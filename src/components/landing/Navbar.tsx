"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Navbar({ settings }: { settings?: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const studioName = settings?.companyName || "Bougie Hair & Beauty";
  const [brandWord, ...rest] = studioName.trim().split(" ");
  const brandRest = rest.join(" ") || "Hair & Beauty";

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
        isScrolled ? "py-3 lg:py-4 bg-luxe-blush/90 backdrop-blur-xl shadow-lg border-b border-luxe-plum/10" : "py-5 lg:py-8 bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex flex-col items-start gap-1">
          <span className="text-2xl sm:text-3xl font-serif tracking-[0.15em] leading-none text-luxe-dark uppercase">
            {brandWord}
          </span>
          <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-luxe-dark/70 font-semibold">
            {brandRest}
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
        </div>
      </div>
    </nav>
  );
}
