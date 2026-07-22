"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Youtube, Type as TikTok } from "lucide-react";

export function Footer({ settings }: { settings?: any }) {
  const currentYear = new Date().getFullYear();
  
  const studioName = settings?.companyName || "Bougie Hair & Beauty";
  const contactEmail = settings?.contactEmail || "bougiehairuk@gmail.com";
  const contactPhone = settings?.contactPhone || "+44 7700 900000";
  const contactAddress = settings?.address || "41 Crouch Street, Colchester";

  return (
    <footer className="bg-[#3E1D10] text-white pt-24 pb-12 border-t border-brand-accent/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            {settings?.logoUrl ? (
              <div className="relative w-20 h-20 overflow-hidden rounded-full border border-white/20 shadow-md">
                <img src={settings.logoUrl} alt={studioName} className="w-full h-full object-cover scale-[1.03]" />
              </div>
            ) : (
              <h3 className="text-3xl font-serif text-brand-secondary">{studioName}</h3>
            )}
            <p className="text-zinc-400 text-sm leading-relaxed">
              Five disciplines, one standard of craft — braiding, wigs, lash artistry, head spa and nails, all under one roof at 41 Crouch Street.
            </p>
            <div className="flex gap-4">
              {settings?.instagramUrl && (
                <Link href={settings.instagramUrl} target="_blank" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition-all">
                  <Instagram className="w-5 h-5" />
                </Link>
              )}
              {settings?.facebookUrl && (
                <Link href={settings.facebookUrl} target="_blank" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition-all">
                  <Facebook className="w-5 h-5" />
                </Link>
              )}
              {settings?.tiktokUrl && (
                <Link href={settings.tiktokUrl} target="_blank" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition-all">
                  <TikTok className="w-5 h-5" />
                </Link>
              )}
              {settings?.youtubeUrl && (
                <Link href={settings.youtubeUrl} target="_blank" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition-all">
                  <Youtube className="w-5 h-5" />
                </Link>
              )}
              {settings?.twitterUrl && (
                <Link href={settings.twitterUrl} target="_blank" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition-all">
                  <Twitter className="w-5 h-5" />
                </Link>
              )}
              {settings?.whatsappNumber && (
                <Link href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition-all">
                  <Phone className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Explore</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/#services" className="text-zinc-400 hover:text-white transition-colors text-sm">Services</Link>
              <Link href="/#portfolio" className="text-zinc-400 hover:text-white transition-colors text-sm">Portfolio</Link>
              <Link href="/about" className="text-zinc-400 hover:text-white transition-colors text-sm">Our Story</Link>
              <Link href="/portal" className="text-zinc-400 hover:text-white transition-colors text-sm">Client Portal</Link>
              <Link href="/booking" className="text-zinc-400 hover:text-white transition-colors text-sm">Book Session</Link>
            </nav>
          </div>

          {/* Contact Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Studio</h4>
            <div className="flex flex-col gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-brand-secondary" />
                <span>{contactAddress}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-secondary" />
                <span>{contactPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-secondary" />
                <span>{contactEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            © {currentYear} {studioName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
