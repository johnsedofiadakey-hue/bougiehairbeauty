"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FloatingBooking() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 md:hidden ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <Link href="/booking">
        <Button className="h-14 px-8 rounded-full shadow-2xl shadow-brand-primary/40 flex items-center gap-3">
          <Calendar className="w-5 h-5" />
          <span className="font-bold">Book Now</span>
        </Button>
      </Link>
    </div>
  );
}
