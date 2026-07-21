"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export function About({ settings }: { settings?: any }) {
  const revealRef = useReveal();

  const heading = settings?.aboutHeading || "Our Story";
  const image = settings?.aboutImage || "/service_hair.png";
  const intro = settings?.aboutIntro ||
    "Bougie Hair & Beauty is a full-service salon in the heart of Colchester, built around care, craft, and confidence.";
  const badgeNumber = settings?.aboutBadgeNumber || "5";
  const badgeLabel = settings?.aboutBadgeLabel || "Service Departments";

  return (
    <section ref={revealRef} className="relative py-24 bg-black overflow-hidden reveal" id="about">
      {/* Decorative accent, echoing the reference's floral corner flourish */}
      <div className="hidden md:block absolute top-1/2 -right-24 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="relative w-full md:w-1/2 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl flex-shrink-0">
            <Image
              src={image}
              alt={heading}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-8 right-8 glass p-6 rounded-2xl shadow-xl max-w-[200px] animate-fade-in-up">
               <div className="text-3xl font-serif text-white mb-1">{badgeNumber}</div>
               <div className="text-xs font-bold uppercase tracking-widest text-white/70">{badgeLabel}</div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary mb-4">About Us</p>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">{heading}</h2>
            <p className="text-lg text-white/60 leading-relaxed mb-10">
              {intro}
            </p>
            <Link href="/about">
              <Button className="h-14 px-8 rounded-full text-base font-bold bg-brand-primary hover:bg-brand-primary/90 gap-2">
                Learn More
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
