"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName === "BUTTON" ||
        target.tagName === "A"
      );
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (typeof window === "undefined") return null;

  return (
    <div 
      className={`fixed top-0 left-0 w-8 h-8 rounded-full border border-brand-accent pointer-events-none z-[9999] transition-transform duration-300 ease-out hidden md:block ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transform: `translate3d(${position.x - 16}px, ${position.y - 16}px, 0) scale(${isPointer ? 2 : 1})`,
        backgroundColor: isPointer ? "var(--color-brand-accent-rgb, rgba(191, 155, 48, 0.1))" : "transparent",
      }}
    />
  );
}
