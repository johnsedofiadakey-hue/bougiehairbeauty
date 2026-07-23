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
      className={`w-full transition-all duration-300 ${
        isScrolled ? "py-4 bg-luxe-blush/90 backdrop-blur-xl shadow-lg border-b border-luxe-plum/10" : "py-8 bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex flex-col items-start gap-1">
          <span className="text-3xl font-serif tracking-[0.2em] leading-none text-luxe-dark">
            B O U G I Ė
          </span>
          <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-luxe-dark/70 font-semibold">
            Salon & Studio
          </span>
        </Link>

        {/* Centered nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { name: "Home", href: "/" },
            { name: "Services", href: "/services" },
            { name: "Stylists", href: "/stylists" },
            { name: "Gallery", href: "/gallery" },
            { name: "About Us", href: "/about" },
            { name: "Contact", href: "/#contact" }
          ].map((item, idx) => (
            <Link key={item.name} href={item.href} className={`text-sm font-sans font-medium transition-colors relative group/link text-luxe-dark hover:text-luxe-plum`}>
              {item.name}
              {idx === 0 && (
                 <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-luxe-plum rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Right-side actions */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          <Link href="/booking">
            <button className="flex items-center gap-3 px-6 py-3 rounded-full text-sm font-sans font-medium transition-all shadow-sm bg-luxe-plum text-white hover:bg-luxe-plumDark hover:shadow-md">
              Book Appointment
              <span className="bg-white rounded-full p-1">
                <svg className="w-3 h-3 text-luxe-plum" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </Link>
          
          <button className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-luxe-dark hover:bg-luxe-stone transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             </svg>
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden flex items-center gap-4">
           <Link href="/booking">
            <button className="px-5 py-2 rounded-full text-xs font-sans font-medium bg-luxe-plum text-white">
              BOOK
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
