import admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Must match the app's actual Storage bucket (see NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
// in firebase.ts) — not Firebase App Hosting's internal build-artifact bucket.
// storage.bucket() validates its argument is a non-empty string at
// construction time (throws synchronously, before any try/catch around an
// awaited readStore()/updateStore() call could catch it), so this needs a
// non-empty placeholder rather than "" when unset — it doesn't point at any
// real project, so it's safe to fall back to; the real failure still
// surfaces (and gets caught by callers) the first time a Storage network
// call is actually made against a bucket that doesn't exist. See .env.example.
const STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || "unconfigured-bucket.appspot.com";

// Constructed directly via @google-cloud/storage (not admin.storage()) so we
// can disable the client's built-in automatic retries. The library treats
// any write with ifGenerationMatch as safe to auto-retry, but it can't tell
// "this already succeeded, the response just got lost" apart from "this
// genuinely conflicts" — so a transient network blip right after a
// successful conditional write causes the library's own hidden retry to
// receive a stale-precondition error, which then trips updateStore()'s own
// retry loop into re-running the whole update a second time on top of the
// write that already landed, silently duplicating it. This bit us for real:
// a batch of service-catalog writes each landed twice. Disabling autoRetry
// means transient errors surface immediately to our code instead of being
// retried invisibly underneath our own retry logic.
const storage = new Storage({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  retryOptions: { autoRetry: false },
});

export const bucket = storage.bucket(STORAGE_BUCKET);
export default admin;
