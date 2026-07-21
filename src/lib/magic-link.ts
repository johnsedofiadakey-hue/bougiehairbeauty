import admin from "@/lib/firebase-admin";
import { getBaseUrl } from "@/lib/email";

// Generates a Firebase-verified, single-use, time-limited sign-in link for
// a given email — same underlying mechanism as the client-triggered "sign
// in with email" portal option, just issued server-side so a booking
// confirmation/reminder email can embed a working portal link without a
// live browser session. Requires "Email Link" sign-in to be enabled for
// this Firebase project (Authentication > Sign-in method); if it isn't,
// this fails closed (returns null) rather than sending a broken link.
export async function generatePortalMagicLink(email: string): Promise<string | null> {
  try {
    const link = await admin.auth().generateSignInWithEmailLink(email, {
      url: `${getBaseUrl()}/portal/verify`,
      handleCodeInApp: true,
    });
    return link;
  } catch (error) {
    console.error("[MAGIC_LINK_GENERATE_ERROR]", error);
    return null;
  }
}
