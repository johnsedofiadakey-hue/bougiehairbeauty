"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ChevronRight, MessageCircle } from "lucide-react";

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
  whatsappNumber 
}: HeroProps) {
  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
      {/* Background Media with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {mediaType === 'video' && videoUrl ? (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: `url(${backgroundImage || '/beauty_hero_bg.png'})` }}
          />
        )}
        <div className="absolute inset-0 bg-brand-secondary/40 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/70 via-transparent to-brand-secondary/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-brand-textPrimary">
        <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight animate-fade-in-up [text-shadow:0_4px_30px_var(--color-secondary)]">
          {title}
        </h1>
        <p className="text-xl md:text-2xl font-normal mb-10 max-w-2xl mx-auto text-brand-textSecondary [text-shadow:0_2px_20px_var(--color-secondary)]">
          {subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300">
          <MagneticButton strength={20} className="w-full sm:w-auto">
            <Link href="/booking" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-16 px-10 rounded-full text-lg shadow-2xl shadow-brand-primary/40 font-bold bg-brand-primary hover:bg-brand-primary/90">
                Book Appointment
              </Button>
            </Link>
          </MagneticButton>

          <MagneticButton strength={15} className="w-full sm:w-auto">
            <a 
              href="#services"
              className="w-full sm:w-auto px-10 h-16 border-2 border-[#1A1A1A]/20 backdrop-blur-md text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-full text-lg font-bold flex items-center justify-center gap-2 transition-all"
            >
              Explore Services
              <ChevronRight className="w-5 h-5" />
            </a>
          </MagneticButton>
          
          <Link href={`https://wa.me/${whatsappNumber || '447700900000'}`} target="_blank" className="w-full sm:w-auto">
            <Button 
              variant="ghost" 
              size="lg" 
              className="w-full h-16 rounded-full text-[#1A1A1A] hover:bg-black/5 flex items-center justify-center gap-3 transition-all font-bold"
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-[1px] h-12 bg-[#1A1A1A]/30" />
      </div>
    </section>
  );
}
