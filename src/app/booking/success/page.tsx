"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Calendar, Home, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const reference = searchParams.get("reference");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Celebrate!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#E8D7D0', '#FAFAF7']
    });
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-bougie-cream flex items-center justify-center px-6">
      {/* Animated abstract mesh gradient background */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-bougie-champagne/40 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-bougie-pink/40 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[40%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-bougie-espresso/5 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="max-w-xl w-full backdrop-blur-2xl bg-white/60 rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(44,30,22,0.08)] border border-white/40 text-center animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8 animate-bounce">
          <Check className="w-12 h-12 text-emerald-600" />
        </div>

        <h1 className="text-5xl font-serif text-bougie-espresso mb-4">Booking Secured!</h1>
        <p className="text-lg text-bougie-taupe mb-10">
          Your transformation is on the calendar. We look forward to seeing you.
        </p>

        <div className="bg-bougie-pink/20 rounded-3xl p-6 mb-10 border border-bougie-espresso/10 text-left">
           <div className="flex items-center gap-3 mb-2">
             <Calendar className="w-4 h-4 text-bougie-champagne" />
             <span className="text-xs font-bold uppercase tracking-widest text-bougie-champagne">Next Steps</span>
           </div>
           <p className="text-sm text-bougie-espresso/80 leading-relaxed">
             You can now access your personal portal to view your session history, upload inspiration photos, and see your upcoming treatments.
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
