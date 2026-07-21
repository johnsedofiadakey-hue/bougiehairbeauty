"use client";

import { ShieldCheck, Award, FlaskConical, Leaf } from "lucide-react";

export function TrustStrip() {
  const badges = [
    { icon: ShieldCheck, label: "Certified & Insured" },
    { icon: Award, label: "Professional Excellence" },
    { icon: FlaskConical, label: "Technical Precision" },
    { icon: Leaf, label: "Organic-Infused Care" },
  ];

  return (
    <div className="bg-brand-primary py-8 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center justify-center gap-3 text-white/60 hover:text-brand-secondary transition-colors group">
              <badge.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
