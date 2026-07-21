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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-brand-secondary/80 backdrop-blur-xl py-3 shadow-lg border-b border-brand-accent/20" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {settings?.logoUrl ? (
            <div className="relative w-16 h-16 overflow-hidden rounded-full border border-brand-accent/30 shadow-md">
              <img src={settings.logoUrl} alt={studioName} className="w-full h-full object-cover scale-[1.03]" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform duration-500">
               <Scissors className="w-5 h-5" />
            </div>
          )}
          <span className="text-2xl font-serif text-[#1A1A1A] tracking-tight">
            {studioName}
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8">
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
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-accent transition-all group-hover/link:w-full" />
            </Link>
          </div>

          <div className="h-6 w-[1px] bg-zinc-200 mx-2" />

          <div className="flex items-center gap-6">
            <Link href="/portal" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-brand-primary transition-all group/portal">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover/portal:bg-brand-secondary transition-colors">
                <User className="w-4 h-4 text-zinc-500 group-hover/portal:text-brand-primary" />
              </div>
              <span className="hidden lg:inline">My Portal</span>
            </Link>
            
            <Link href="/booking">
              <button className="px-8 py-3 bg-brand-primary text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-accent hover:scale-105 transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Book Session
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Trigger (MobileNav is used for actual navigation, but we can show a trigger if needed) */}
        <div className="md:hidden flex items-center gap-4">
           <Link href="/portal" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-500" />
           </Link>
        </div>
      </div>
    </nav>
  );
}
