"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/useReveal";
import Image from "next/image";

export function About({ settings }: { settings?: any }) {
  const revealRef = useReveal();

  const heading = settings?.aboutHeading || "Our Story";
  const image = settings?.aboutImage || "/service_hair.png";
  const intro = settings?.aboutIntro ||
    "Bougie Hair & Beauty is a full-service salon in the heart of Colchester, built around care, craft, and confidence.";
  const badgeNumber = settings?.aboutBadgeNumber || "5";
  const badgeLabel = settings?.aboutBadgeLabel || "Service Departments";

  return (
    <section ref={revealRef} className="py-24 bg-white reveal" id="about">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="relative w-full md:w-1/2 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
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
            <h2 className="text-4xl md:text-5xl font-serif text-brand-primary mb-6">{heading}</h2>
            <div className="w-20 h-1 bg-brand-accent mb-8" />
            <p className="text-xl text-zinc-700 leading-relaxed mb-8">
              {intro}
            </p>
            <Link href="/about">
              <Button variant="primary" size="lg">
                Read Our Story
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
