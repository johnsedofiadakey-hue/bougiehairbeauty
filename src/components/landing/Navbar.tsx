"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, User, ShoppingBag, Calendar, Scissors } from "lucide-react";

export function Navbar({ settings }: { settings?: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const studioName = settings?.companyName || "Bougie Hair & Beauty";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`transition-all duration-300 border-b border-white/40 ${
        isScrolled ? "py-3 bg-white/90 backdrop-blur-xl shadow-lg" : "py-5 bg-white/60 backdrop-blur-xl"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          {settings?.logoUrl ? (
            <div className="relative w-12 h-12 overflow-hidden rounded-full border border-brand-accent/30 shadow-sm">
              <img src={settings.logoUrl} alt={studioName} className="w-full h-full object-cover scale-[1.03]" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform duration-500">
               <Scissors className="w-5 h-5" />
            </div>
          )}
          <span className="text-xl font-serif text-[#1A1A1A] tracking-tight whitespace-nowrap">
            {studioName}
          </span>
        </Link>

        {/* Centered nav links */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-8">
          <Link href="/#services" className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-brand-primary transition-all relative group/link">
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-accent transition-all group-hover/link:w-full" />
          </Link>
          <Link href="/#portfolio" className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-brand-primary transition-all relative group/link">
            Showcase
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-accent transition-all group-hover/link:w-full" />
          </Link>
          <Link href="/about" className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-brand-primary transition-all relative group/link">
            Our Story
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-accent transition-all group-hover/link:w-full" />
          </Link>
          <Link href="/#contact" className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-brand-primary transition-all relative group/link">
            Contact
          </Link>
        </div>

        {/* Right-side actions */}
        <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
          <Link href="/portal" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-brand-primary transition-all group/portal">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover/portal:bg-brand-secondary transition-colors">
              <User className="w-4 h-4 text-zinc-500 group-hover/portal:text-brand-primary" />
            </div>
            <span className="hidden lg:inline">My Portal</span>
          </Link>

          <Link href="/booking">
            <button className="px-7 py-3 bg-brand-primary text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-accent hover:scale-105 transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>
          </Link>
        </div>

        {/* Mobile Menu Trigger (MobileNav is used for actual navigation, but we can show a trigger if needed) */}
        <div className="lg:hidden flex items-center gap-4">
           <Link href="/portal" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-500" />
           </Link>
        </div>
      </div>
    </nav>
  );
}
