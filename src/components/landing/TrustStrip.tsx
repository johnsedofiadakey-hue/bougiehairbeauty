"use client";

import { ShieldCheck, Award, FlaskConical, Leaf } from "lucide-react";

export function TrustStrip() {
  const badges = [
    { icon: ShieldCheck, label: "Certified & Insured", description: "Fully qualified stylists you can trust." },
    { icon: Award, label: "Professional Excellence", description: "Years of craft across braids, wigs & nails." },
    { icon: FlaskConical, label: "Technical Precision", description: "Consistent, detail-led results every visit." },
    { icon: Leaf, label: "Organic-Infused Care", description: "Quality products, gentle on hair and skin." },
  ];

  return (
    <div className="bg-[var(--color-secondary)] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary mb-3">Why Choose Us</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {badges.map((badge, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center text-brand-primary mb-5 shadow-sm ring-1 ring-black/5 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                <badge.icon className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide text-[#1A1A1A] mb-2">{badge.label}</h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-[180px]">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
