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

        {/* Full-bleed portrait media — no frame, fills its column edge to edge */}
        <div className="relative min-h-[360px] md:min-h-[85vh] order-1 md:order-2">
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
    </section>
  );
}
