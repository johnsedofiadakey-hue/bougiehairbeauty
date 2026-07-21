"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/firebase";

// Landing page for every magic link — both the client-triggered kind (sent
// from /portal's "use email instead" option, which caches the email in
// localStorage on this device) and the server-generated kind embedded in
// booking confirmation/reminder emails (which never has a local cache, so
// this always falls back to asking the client to confirm their email).
export default function VerifyMagicLink() {
  const [status, setStatus] = useState<"checking" | "needs-email" | "error">("checking");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const completeSignIn = async (emailToUse: string) => {
    setSubmitting(true);
    setError("");
    try {
      const result = await signInWithEmailLink(auth, emailToUse, window.location.href);
      const idToken = await result.user.getIdToken();
      await auth.signOut();
      window.localStorage.removeItem("emailForSignIn");

      const signInResult = await signIn("credentials", { redirect: false, firebaseIdToken: idToken });
      if (signInResult?.error) {
        setError("This email isn't linked to a booking yet. Please book an appointment first.");
        setStatus("error");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/invalid-action-code") {
        setError("This link has already been used or has expired. Please request a new one.");
      } else if (code === "auth/invalid-email") {
        setError("That doesn't look like the email this link was sent to. Please check and try again.");
      } else {
        setError("Something went wrong confirming this link. Please request a new one.");
      }
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setError("This link is invalid or has expired.");
      setStatus("error");
      return;
    }
    const cachedEmail = window.localStorage.getItem("emailForSignIn");
    if (cachedEmail) {
      completeSignIn(cachedEmail);
    } else {
      setStatus("needs-email");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-accent" />
        <Link href="/portal" aria-label="Back to portal" className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-zinc-400 hover:text-brand-primary transition-colors text-xs font-bold uppercase tracking-widest group bg-zinc-100 sm:bg-transparent rounded-full w-10 h-10 sm:w-auto sm:h-auto justify-center">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Portal</span>
        </Link>

        <div className="text-center mb-10 mt-8 sm:mt-0">
          <div className="w-16 h-16 bg-brand-secondary/50 rounded-2xl mx-auto flex items-center justify-center text-brand-primary mb-4">
            {status === "checking" || submitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-serif text-brand-primary mb-2">Confirming your link</h2>
        </div>

        {status === "checking" && (
          <p className="text-center text-zinc-500 text-sm">One moment...</p>
        )}

        {error && (
          <p className="text-rose-600 text-xs text-center font-medium bg-rose-50 border border-rose-100 py-3 px-4 rounded-2xl mb-6">
            {error}
          </p>
        )}

        {status === "needs-email" && (
          <form
            onSubmit={(e) => { e.preventDefault(); completeSignIn(email.trim()); }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400 tracking-widest">Confirm Your Email</label>
              <p className="text-[11px] text-zinc-400">For your security, please re-enter the email this link was sent to.</p>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  placeholder="you@example.com"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-16 text-lg rounded-2xl gap-2 shadow-xl shadow-brand-primary/20" disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm & Enter Portal"}
            </Button>
          </form>
        )}

        {status === "error" && (
          <div className="text-center">
            <Link href="/portal" className="text-xs font-bold uppercase text-brand-primary hover:text-brand-accent transition-colors">
              Return to portal login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
