"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DEPARTMENTS } from "@/lib/departments";

export function About({ settings, hideCta = false }: { settings?: any, hideCta?: boolean }) {
  const revealRef = useReveal();

  const heading = settings?.aboutHeading || "Our Story";
  const image = "/about_realistic.jpg";
  const intro = settings?.aboutIntro ||
    "Bougie Hair & Beauty is a full-service salon in the heart of Colchester, built around care, craft, and confidence.";

  return (
    <section ref={revealRef} className="relative bg-luxe-dark overflow-hidden reveal" id="about">
      <div className="grid md:grid-cols-[1.05fr_0.95fr]">
        {/* Portrait media — full-bleed, mirrors the Hero's asymmetric photo
            treatment but on the opposite side, so the page has a rhythm as
            you scroll instead of every section repeating the same layout. */}
        <div className="relative min-h-[380px] md:min-h-[720px] order-1">
          <Image src={image} alt={heading} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-luxe-dark/40 md:to-luxe-dark/90" />
          <div className="hidden md:block absolute inset-y-0 right-0 w-px bg-luxe-plum/20" />
        </div>

        {/* Copy */}
        <div className="order-2 flex items-center px-6 sm:px-10 lg:pl-14 lg:pr-16 py-16 md:py-24">
          <div className="max-w-lg mx-auto md:mx-0">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px bg-luxe-plum" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-luxe-plum">About Us</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-luxe-blush mb-8 leading-[1.15] text-balance">
              {heading}
            </h2>
            <p className="text-lg text-luxe-blush/70 leading-relaxed mb-10">
              {intro}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-10">
              {DEPARTMENTS.map((dept, i) => (
                <span key={dept.name} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-luxe-blush/60">
                    {dept.name}
                  </span>
                  {i < DEPARTMENTS.length - 1 && <span className="text-luxe-plum/60">—</span>}
                </span>
              ))}
            </div>

            {!hideCta && (
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-luxe-blush hover:text-luxe-plum transition-colors relative group/link"
              >
                Read Our Story
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                <span className="absolute -bottom-1 left-0 w-full h-px bg-luxe-plum scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
