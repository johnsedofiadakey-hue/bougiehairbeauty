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
      colors: ['#E8B8B0', '#FFF9F6', '#D4AF37']
    });
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white rounded-[40px] p-12 shadow-2xl border text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8 animate-bounce">
          <Check className="w-12 h-12 text-emerald-600" />
        </div>
        
        <h1 className="text-5xl font-serif text-brand-primary mb-4">Booking Secured!</h1>
        <p className="text-lg text-zinc-500 mb-10">
          Your transformation is on the calendar. We look forward to seeing you.
        </p>

        <div className="bg-brand-primary/5 rounded-3xl p-6 mb-10 border border-brand-primary/10 text-left">
           <div className="flex items-center gap-3 mb-2">
             <Calendar className="w-4 h-4 text-brand-primary" />
             <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Next Steps</span>
           </div>
           <p className="text-sm text-zinc-600 leading-relaxed">
             You can now access your personal portal to view your session history, upload inspiration photos, and see your upcoming treatments.
           </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link 
            href="/portal"
            className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-brand-primary/20"
          >
            Go to My Portal <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/"
            className="w-full py-5 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Return Home
          </Link>
        </div>

        {reference && (
          <p className="mt-8 text-[10px] text-zinc-300 font-mono uppercase tracking-widest">
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
