"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Home, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import confetti from "canvas-confetti";

type VerifyState = "verifying" | "confirmed" | "failed";

function SuccessContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const reference = searchParams.get("reference");
  const [state, setState] = useState<VerifyState>("verifying");

  useEffect(() => {
    // The booking only becomes real once we confirm the deposit actually
    // cleared — the server asks Stripe directly, we never assume payment.
    if (!appointmentId || !reference) {
      setState("failed");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/stripe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId, sessionId: reference }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.paid) {
          setState("confirmed");
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#D4AF37", "#E8D7D0", "#FAFAF7"],
          });
        } else {
          setState("failed");
        }
      } catch {
        if (!cancelled) setState("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appointmentId, reference]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-bougie-cream flex items-center justify-center px-6">
      {/* Animated abstract mesh gradient background */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-bougie-champagne/40 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-bougie-pink/40 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[40%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-bougie-espresso/5 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="max-w-xl w-full backdrop-blur-2xl bg-white/60 rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(44,30,22,0.08)] border border-white/40 text-center animate-in fade-in zoom-in-95 duration-700 relative z-10">

        {state === "verifying" && (
          <>
            <div className="w-24 h-24 rounded-full bg-bougie-champagne/20 flex items-center justify-center mx-auto mb-8">
              <Loader2 className="w-12 h-12 text-bougie-champagne animate-spin" />
            </div>
            <h1 className="text-4xl font-serif text-bougie-espresso mb-4">Confirming your payment…</h1>
            <p className="text-lg text-bougie-taupe">One moment while we secure your appointment.</p>
          </>
        )}

        {state === "failed" && (
          <>
            <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-12 h-12 text-amber-600" />
            </div>
            <h1 className="text-4xl font-serif text-bougie-espresso mb-4">Payment not confirmed</h1>
            <p className="text-lg text-bougie-taupe mb-10">
              We couldn't confirm your deposit, so your slot hasn't been booked yet. If you didn't complete the payment, please try again — or choose "pay cash on arrival" at the last step.
            </p>
            <Link
              href="/booking"
              className="inline-flex w-full py-5 bg-bougie-espresso text-bougie-cream rounded-2xl font-bold items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-bougie-espresso/20"
            >
              Back to Booking <ArrowRight className="w-5 h-5" />
            </Link>
          </>
        )}

        {state === "confirmed" && (
          <>
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Check className="w-12 h-12 text-emerald-600" />
            </div>

            <h1 className="text-5xl font-serif text-bougie-espresso mb-4">Booking Secured!</h1>
            <p className="text-lg text-bougie-taupe mb-10">
              Your deposit is paid and your appointment is confirmed. We look forward to seeing you.
            </p>

            <div className="bg-bougie-pink/20 rounded-3xl p-6 mb-8 border border-bougie-espresso/10 text-left">
              <p className="text-sm text-bougie-espresso/80 leading-relaxed">
                We've emailed your confirmation and a link to your personal portal, where you can view your upcoming treatments and history.
              </p>
              <p className="text-sm text-bougie-espresso/80 leading-relaxed mt-3 font-medium">
                📩 Don't see the email? Please check your <strong>spam or junk folder</strong> — and mark us as "not spam" so you get your reminder too.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/portal"
                className="w-full py-5 bg-bougie-espresso text-bougie-cream rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-bougie-espresso/20"
              >
                Go to My Portal <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/"
                className="w-full py-5 bg-bougie-espresso/5 text-bougie-espresso/80 rounded-2xl font-bold hover:bg-bougie-espresso/10 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" /> Return Home
              </Link>
            </div>

            {reference && (
              <p className="mt-8 text-[10px] text-bougie-taupe/50 font-mono uppercase tracking-widest">
                Payment Ref: {reference}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Finalizing...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
