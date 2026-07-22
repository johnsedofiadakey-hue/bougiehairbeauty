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
  address?: string;
}

export function Hero({
  title,
  subtitle,
  backgroundImage,
  videoUrl,
  mediaType = 'image',
  address,
}: HeroProps) {
  return (
    <section className="relative bg-[var(--color-secondary)] overflow-hidden">
      {/* Soft glassmorphic merge where the photo meets the copy column: the
          photo itself fades out via a mask-image gradient (bottom edge on
          mobile, left edge on desktop) instead of a hard seam, and a
          backdrop-blur panel sits over that fade zone so the transition
          reads as frosted glass rather than a cut edge — echoes the navbar's
          glass treatment instead of clashing with it. */}
      <style>{`
        .hero-photo-fade {
          mask-image: linear-gradient(to bottom, black 78%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 78%, transparent 100%);
        }
        .hero-glass-fade {
          mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
        }
        @media (min-width: 768px) {
          .hero-photo-fade {
            mask-image: linear-gradient(to right, transparent 0%, black 30%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 30%);
          }
          .hero-glass-fade {
            mask-image: linear-gradient(to right, black 0%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%);
          }
        }
      `}</style>

      <div className="grid md:grid-cols-2 lg:grid-cols-[0.86fr_1.14fr]">
        {/* Copy */}
        {/* items-start + generous top padding, not items-center: the row's
            height is driven by the photo (min-h-85vh), and on short/medium
            viewports centering this much copy vertically pushed its top
            behind the fixed header. Top-aligned with fixed clearance is
            simple and can never overlap the header regardless of content
            height or viewport size. */}
        <div className="flex items-start px-6 sm:px-10 lg:pl-16 lg:pr-10 py-16 md:pt-44 md:pb-0 order-2 md:order-1">
          <div className="max-w-lg mx-auto md:mx-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
              <span className="hidden md:block w-8 h-px bg-brand-accent" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">
                Hair · Wigs · Lash · Spa · Nails
              </p>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#1A1A1A] mb-6 leading-[1.1] animate-fade-in-up">
              {title}
            </h1>
            <p className="text-lg text-zinc-600 mb-10 animate-fade-in-up delay-150">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-4 sm:gap-8 animate-fade-in-up delay-300">
              <MagneticButton strength={20}>
                <Link href="/booking">
                  <Button size="lg" className="h-14 px-8 rounded-full text-base font-bold gap-2 bg-black text-white hover:bg-zinc-800 shadow-xl shadow-black/20">
                    Book Appointment
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </MagneticButton>
              <Link
                href="/#services"
                className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-brand-primary transition-colors relative group/link"
              >
                View Services
                <span className="absolute -bottom-1 left-0 w-full h-px bg-brand-accent scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left" />
              </Link>
            </div>

            {address && (
              <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 animate-fade-in-up delay-300">
                {address}
                <span className="mx-2 text-brand-accent">·</span>
                By Appointment
              </p>
            )}
          </div>
        </div>

        {/* Portrait media — fades into the copy column through a soft mask
            + frosted-glass overlay instead of a hard 50/50 split or a cut
            edge, so it reads as one continuous, softly blended scene. */}
        <div className="relative min-h-[420px] md:min-h-[85vh] order-1 md:order-2 z-10">
          <div className="hero-photo-fade absolute inset-0 w-full h-full">
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
          {/* Frosted glass over the fade zone — masked with its own gradient
              so the blur itself tapers off smoothly instead of stopping at
              a hard rectangle edge (that hard edge is what made an earlier
              version of this look like a smudge instead of a soft blend). */}
          <div className="hero-glass-fade absolute inset-x-0 bottom-0 h-2/5 md:inset-y-0 md:left-0 md:right-auto md:bottom-auto md:h-full md:w-1/2 backdrop-blur-lg bg-[var(--color-secondary)]/15 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
