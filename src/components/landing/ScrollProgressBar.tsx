"use client";

import { useEffect, useState } from "react";

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (currentScrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-zinc-100 z-[1000]">
      <div 
        className="h-full bg-brand-primary transition-all duration-150 ease-out shadow-[0_0_10px_rgba(5,46,22,0.5)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
