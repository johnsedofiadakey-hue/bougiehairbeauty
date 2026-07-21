import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { readStore, findClientByPhone, findClientByEmail } from "@/lib/data-store";
import admin from "@/lib/firebase-admin";

// Seed/legacy accounts may still have a plaintext password if the store was
// created before hashing was introduced. bcrypt hashes always start with
// "$2"; anything else is treated as legacy plaintext for a one-time compare.
export function verifyPassword(inputPassword: string, storedPassword: string): boolean {
  if (storedPassword.startsWith("$2")) {
    return bcrypt.compareSync(inputPassword, storedPassword);
  }
  return inputPassword === storedPassword;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@bougiehairuk.com" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
        firebaseIdToken: { label: "Firebase ID Token", type: "text" }
      },
      async authorize(credentials) {
        const store = await readStore();

        // 1. Firebase-verified login (Client Portal) — either phone OTP or
        // email-link sign-in. Both land here with the same shape: a
        // Firebase ID token whose claims we trust because Firebase already
        // verified possession of the phone/email before issuing it.
        if (credentials?.firebaseIdToken) {
          let decoded;
          try {
            decoded = await admin.auth().verifyIdToken(credentials.firebaseIdToken);
          } catch (err) {
            console.log("[AUTH] Invalid Firebase ID token:", err);
            return null;
          }

          const phoneNumber = decoded.phone_number;
          const email = decoded.email;

          let client = phoneNumber ? findClientByPhone(store, phoneNumber) : undefined;
          if (!client && email) client = findClientByEmail(store, email);

          if (!client) {
            console.log("[AUTH] Client not found for Firebase-verified identity:", phoneNumber || email);
            return null;
          }

          const user = store.users.find((u) => u.id === client.userId);
          if (!user) {
            console.log("[AUTH] Linked user not found for client:", client.id);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        // 2. Phone number authentication (Client Portal)
        if (credentials?.phone) {
          const client = findClientByPhone(store, credentials.phone.trim());

          if (!client) {
            console.log("[AUTH] Client phone not found:", credentials.phone);
            return null;
          }

          const user = store.users.find((u) => u.id === client.userId);
          if (!user) {
            console.log("[AUTH] Linked user not found for client:", client.id);
            return null;
          }

          // Password Login
          if (credentials.password) {
            if (verifyPassword(credentials.password, user.password)) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              };
            }
            console.log("[AUTH] Password mismatch for client phone:", credentials.phone);
            return null;
          }

          return null;
        }

        // 3. Standard email/password authentication (Admin/Staff Portal)
        if (credentials?.email && credentials?.password) {
          const user = store.users.find((candidate) => candidate.email.toLowerCase() === credentials.email.toLowerCase());

          if (!user) {
            console.log("[AUTH] User email not found:", credentials.email);
            return null;
          }

          if (!verifyPassword(credentials.password, user.password)) {
            console.log("[AUTH] Password mismatch for email:", credentials.email);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
