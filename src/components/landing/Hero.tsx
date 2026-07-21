"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ChevronRight } from "lucide-react";

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  whatsappNumber?: string;
}

export function Hero({
  title,
  subtitle,
  backgroundImage,
  videoUrl,
  mediaType = 'image',
}: HeroProps) {
  return (
    <section className="relative bg-[var(--color-secondary)] overflow-hidden">
      {/* Torn-paper clip paths for the hero photo below: jagged bottom edge on
          mobile (photo stacks above the copy), jagged left edge on desktop
          (photo sits beside the copy) — objectBoundingBox so they scale with
          whatever size the photo column ends up at any breakpoint. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="hero-torn-bottom" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,0.96 L0.95,0.93 L0.905,0.985 L0.86,0.935 L0.81,0.99 L0.76,0.935 L0.71,0.985 L0.66,0.93 L0.61,0.985 L0.56,0.935 L0.51,0.985 L0.46,0.93 L0.41,0.985 L0.36,0.93 L0.31,0.985 L0.26,0.935 L0.21,0.985 L0.16,0.93 L0.11,0.985 L0.06,0.93 L0,0.975 Z" />
          </clipPath>
          <clipPath id="hero-torn-left" clipPathUnits="objectBoundingBox">
            <path d="M0.045,0 L1,0 L1,1 L0.03,1 L0.075,0.94 L0.015,0.885 L0.07,0.83 L0.02,0.77 L0.08,0.715 L0.025,0.66 L0.075,0.605 L0.015,0.55 L0.07,0.495 L0.025,0.44 L0.08,0.385 L0.02,0.33 L0.075,0.275 L0.015,0.22 L0.07,0.165 L0.025,0.11 L0.06,0.055 Z" />
          </clipPath>
        </defs>
      </svg>
      <style>{`
        .hero-photo-clip {
          clip-path: url(#hero-torn-bottom);
          filter: drop-shadow(0 18px 28px rgba(212, 175, 55, 0.35));
        }
        @media (min-width: 768px) {
          .hero-photo-clip { clip-path: url(#hero-torn-left); }
        }
      `}</style>

      <div className="grid md:grid-cols-2">
        {/* Copy */}
        <div className="flex items-center px-6 sm:px-10 lg:pl-16 lg:pr-12 py-16 md:py-0 order-2 md:order-1">
          <div className="max-w-lg mx-auto md:mx-0 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary mb-4">
              Hair · Wigs · Lash · Spa · Nails
            </p>
            <h1 className="text-5xl md:text-6xl font-serif text-[#1A1A1A] mb-6 leading-[1.1] animate-fade-in-up">
              {title}
            </h1>
            <p className="text-lg text-zinc-600 mb-10 animate-fade-in-up delay-150">
              {subtitle}
            </p>

            <div className="flex justify-center md:justify-start animate-fade-in-up delay-300">
              <MagneticButton strength={20}>
                <Link href="/booking">
                  <Button size="lg" className="h-14 px-8 rounded-full text-base font-bold gap-2 bg-black text-white hover:bg-zinc-800 shadow-xl shadow-black/20">
                    Book Appointment
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Portrait media, torn-paper edge where it meets the copy column —
            bleeds slightly over the copy column instead of a hard 50/50 split
            so it reads as one composed scene rather than two stacked panels. */}
        <div className="relative min-h-[360px] md:min-h-[85vh] order-1 md:order-2 md:-ml-10 lg:-ml-16 z-10">
          <div className="hero-photo-clip absolute inset-0 w-full h-full">
            {mediaType === 'video' && videoUrl ? (
              <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundImage || '/beauty_hero_bg.png'})` }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
