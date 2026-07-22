"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  ConfirmationResult,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Phone, Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, MailCheck } from "lucide-react";
import { normalizeUKPhone, stripUKPrefix } from "@/lib/utils";
import { auth } from "@/lib/firebase";

function firebaseErrorMessage(err: any): string {
  const code = err?.code || "";
  if (code === "auth/invalid-phone-number") return "That phone number doesn't look right. Please check and try again.";
  if (code === "auth/too-many-requests") return "Too many attempts from this device. Please wait a bit and try again.";
  if (code === "auth/captcha-check-failed") return "Verification failed. Please refresh the page and try again.";
  if (code === "auth/quota-exceeded") return "We've hit our verification limit for now. Please try again later or log in with your password.";
  if (code === "auth/code-expired") return "That code has expired. Please request a new one.";
  if (code === "auth/invalid-verification-code") return "Incorrect code. Please check and try again.";
  return "Failed to send verification code. Please try again.";
}

export default function ClientPortalAuth() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"phone" | "password" | "otp" | "email" | "email-sent">("phone");
  const [settings, setSettings] = useState<any>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .finally(() => setSettingsLoaded(true));

    // Auto-fill phone from localStorage if present
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("client_phone");
      if (savedPhone) {
        setPhone(stripUKPrefix(savedPhone));
      }
    }

    return () => {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  const fullPhone = () => normalizeUKPhone(phone);

  const getRecaptchaVerifier = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptchaVerifierRef.current;
  };

  const sendOtp = async () => {
    const verifier = getRecaptchaVerifier();
    const confirmation = await signInWithPhoneNumber(auth, `+${fullPhone()}`, verifier);
    confirmationResultRef.current = confirmation;
    setStep("otp");
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (settings?.enableOTP) {
      try {
        await sendOtp();
      } catch (err: any) {
        setError(firebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setStep("password");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!confirmationResultRef.current) {
        setError("Your session expired. Please request a new code.");
        setStep("phone");
        return;
      }

      const result = await confirmationResultRef.current.confirm(otp);
      const idToken = await result.user.getIdToken();
      await auth.signOut();

      const signInResult = await signIn("credentials", {
        redirect: false,
        firebaseIdToken: idToken,
      });

      if (signInResult?.error) {
        setError("This phone number isn't linked to an account yet. Please book an appointment first.");
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("client_phone", fullPhone());
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(firebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendSignInLinkToEmail(auth, email.trim(), {
        url: `${window.location.origin}/portal/verify`,
        handleCodeInApp: true,
      });
      // Cached so /portal/verify can complete sign-in on this same device
      // without asking the client to re-type their email.
      window.localStorage.setItem("emailForSignIn", email.trim());
      setStep("email-sent");
    } catch (err: any) {
      setError(firebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        phone: fullPhone(),
        password,
      });

      if (result?.error) {
        setError("Invalid phone number or password.");
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("client_phone", fullPhone());
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#1C140F] flex items-center justify-center p-6 overflow-hidden">
      {/* Ambient glow for the glass card to actually blur against — see Login page for the same treatment. */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-primary/25 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#D4AF37]/20 blur-3xl" />

      <div id="recaptcha-container" />
      <div className="relative max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/60" />
        <Link href="/" aria-label="Back to website" className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group bg-white/10 sm:bg-transparent rounded-full w-10 h-10 sm:w-auto sm:h-auto justify-center">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Website</span>
        </Link>

        <div className="text-center mb-10 mt-8 sm:mt-0">
          <h2 className="text-3xl sm:text-4xl font-serif text-white mb-2">{settings?.companyName || "Bougie Hair & Beauty"} Portal</h2>
          <p className="text-white/50 text-sm">Access your treatment history and book new sessions.</p>
        </div>

        <form
          onSubmit={
            step === "phone" ? handlePhoneSubmit
            : step === "otp" ? handleOtpSubmit
            : step === "email" ? handleEmailLinkSubmit
            : step === "email-sent" ? (e: React.FormEvent) => e.preventDefault()
            : handlePasswordSubmit
          }
          className="space-y-6"
        >
          {error && (
            <p className="text-rose-200 text-xs text-center font-medium bg-rose-500/10 border border-rose-400/20 py-3 px-4 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
              {error}
            </p>
          )}

          {step === "phone" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-white/50 tracking-widest">Phone Number</label>
                  {typeof window !== "undefined" && localStorage.getItem("client_phone") && (
                    <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Prefilled</span>
                  )}
                </div>
                <div className="relative flex items-stretch">
                  <div className="flex items-center gap-1.5 pl-4 pr-3 rounded-l-xl border border-r-0 border-white/15 bg-white/5 text-white/60 font-bold text-sm">
                    <Phone className="w-4 h-4 text-white/30" />
                    +44
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-3 pr-4 py-4 rounded-r-xl border border-white/15 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                    placeholder="07770 375859 or 7770375859"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-16 text-lg rounded-2xl gap-2 shadow-xl shadow-brand-primary/20" disabled={loading || !settingsLoaded}>
                {!settingsLoaded ? "Loading..." : loading ? "Sending code..." : <>Continue <ArrowRight className="w-5 h-5" /></>}
              </Button>
              {settings?.enableEmailLink && (
                <button
                  type="button"
                  onClick={() => { if (!loading) { setError(""); setStep("email"); } }}
                  className="w-full py-2 text-xs font-bold uppercase text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <Mail className="w-3 h-3" /> Use email instead
                </button>
              )}
            </div>
          )}

          {step === "email" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50 tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-[11px] text-white/40">We'll email you a one-click link — no code to type.</p>
              </div>
              <Button type="submit" className="w-full h-16 text-lg rounded-2xl gap-2 shadow-xl shadow-brand-primary/20" disabled={loading}>
                {loading ? "Sending link..." : <>Send Me a Link <ArrowRight className="w-5 h-5" /></>}
              </Button>
              <button
                type="button"
                onClick={() => { if (!loading) { setError(""); setStep("phone"); } }}
                className="w-full py-2 text-xs font-bold uppercase text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                <ArrowLeft className="w-3 h-3" /> Use phone number instead
              </button>
            </div>
          )}

          {step === "email-sent" && (
            <div className="space-y-4 text-center animate-in fade-in slide-in-from-right-4">
              <div className="w-16 h-16 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-2xl mx-auto flex items-center justify-center text-[#D4AF37]">
                <MailCheck className="w-8 h-8" />
              </div>
              <p className="text-sm text-white/60">
                Check your inbox at <span className="font-bold text-white">{email}</span> — tap the link we sent to finish signing in.
              </p>
              <button
                type="button"
                onClick={() => { if (!loading) { setError(""); setStep("email"); } }}
                className="w-full py-2 text-xs font-bold uppercase text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                <ArrowLeft className="w-3 h-3" /> Wrong email? Try again
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2 text-center">
                <label className="text-xs font-bold uppercase text-white/50 tracking-widest">Verification Code</label>
                <p className="text-[10px] text-white/40 mb-4">Enter the 6-digit code sent by SMS to +{fullPhone()}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-4xl tracking-[0.5em] font-bold py-4 rounded-xl border border-white/15 bg-white/5 text-white focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  placeholder="000000"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full h-16 text-lg rounded-2xl gap-2 shadow-xl shadow-brand-primary/20" disabled={loading}>
                {loading ? "Verifying..." : <>Verify & Enter <ShieldCheck className="w-5 h-5" /></>}
              </Button>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { if (!loading) setStep("password"); }}
                  className="w-full text-xs font-bold uppercase text-[#D4AF37] hover:text-white transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  Log in with password instead
                </button>
                <button
                  type="button"
                  onClick={() => { if (!loading) setStep("phone"); }}
                  className="w-full py-2 text-xs font-bold uppercase text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <ArrowLeft className="w-3 h-3" /> Change Phone Number
                </button>
              </div>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/50 tracking-widest">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-16 text-lg rounded-2xl gap-2 shadow-xl shadow-brand-primary/20" disabled={loading}>
                {loading ? "Securing Session..." : <>Secure Login <ShieldCheck className="w-5 h-5" /></>}
              </Button>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!loading) {
                      setLoading(true);
                      setError("");
                      try {
                        await sendOtp();
                      } catch (err: any) {
                        setError(firebaseErrorMessage(err));
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  className="w-full text-xs font-bold uppercase text-[#D4AF37] hover:text-white transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  Forgot password? Use OTP code
                </button>
                <button
                  type="button"
                  onClick={() => { if (!loading) setStep("phone"); }}
                  className="w-full py-2 text-xs font-bold uppercase text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <ArrowLeft className="w-3 h-3" /> Change Phone Number
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-12 text-center border-t border-white/10 pt-8">
           <p className="text-[10px] text-white/30 uppercase tracking-widest">Powered by Bougie Hair & Beauty</p>
        </div>
      </div>
    </div>
  );
}
