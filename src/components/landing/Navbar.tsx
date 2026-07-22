"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

export function Navbar({ settings }: { settings?: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const studioName = settings?.companyName || "BOUGIE";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`transition-all duration-300 border-b z-50 ${
        isScrolled ? "py-4 bg-bougie-cream/95 backdrop-blur-xl shadow-lg shadow-bougie-espresso/5 border-bougie-espresso/10" : "py-6 bg-transparent border-white/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="flex flex-col">
            <span className={`text-3xl font-serif tracking-wide leading-none transition-colors ${isScrolled ? 'text-bougie-espresso' : 'text-white'}`}>
              {studioName}
            </span>
            <span className={`text-[9px] font-sans tracking-[0.3em] uppercase mt-1 transition-colors ${isScrolled ? 'text-bougie-espresso/70' : 'text-white/70'}`}>
              Hair & Beauty
            </span>
          </div>
        </Link>

        {/* Centered nav links */}
        <div className="hidden lg:flex items-center gap-10">
          {["HOME", "SERVICES", "GALLERY", "OUR TEAM", "BLOG", "CONTACT"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className={`text-xs font-sans font-medium uppercase tracking-widest transition-colors relative group/link ${isScrolled ? 'text-bougie-espresso hover:text-bougie-pink' : 'text-white/80 hover:text-white'}`}>
              {item}
              <span className={`absolute -bottom-2 left-0 w-0 h-[2px] transition-all group-hover/link:w-full ${isScrolled ? 'bg-bougie-pink' : 'bg-white'}`} />
            </Link>
          ))}
        </div>

        {/* Right-side actions */}
        <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
          <Link href="/booking">
            <button className={`px-8 py-3.5 text-xs font-sans font-medium uppercase tracking-widest transition-colors shadow-lg ${isScrolled ? 'bg-bougie-espresso text-bougie-cream hover:bg-[#3A1D0D]' : 'bg-white text-bougie-espresso hover:bg-white/90'}`}>
              BOOK NOW
            </button>
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden flex items-center gap-4">
           <Link href="/booking">
            <button className={`px-5 py-2 text-xs font-sans font-medium uppercase tracking-widest ${isScrolled ? 'bg-bougie-espresso text-bougie-cream' : 'bg-white text-bougie-espresso'}`}>
              BOOK
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
