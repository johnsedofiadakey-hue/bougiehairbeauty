"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Scissors, Calendar, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/#services", icon: Scissors },
    { name: "Book", href: "/booking", icon: Calendar, primary: true },
    { name: "Contact", href: "/#contact", icon: Phone },
    { name: "Profile", href: "/dashboard", icon: User },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      if (pathname === "/") {
        e.preventDefault();
        const id = href.replace("/#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Allow default Link behavior to navigate to home with hash
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden bg-white/80 backdrop-blur-2xl border-t border-[#D4AF37]/20 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={(e) => handleClick(e, item.href)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all h-full px-1.5 sm:px-3",
              item.primary ? "-translate-y-5" : "flex-1"
            )}
          >
            {item.primary ? (
              // Matches the Hero/Booking CTA's black, not the brand pink —
              // this is the single most-seen button on the site (every
              // mobile page load) so it should carry the same restrained
              // CTA identity as the rest of the site, with a thin gold ring
              // for a touch of the new accent instead of solid pink.
              <div className="w-16 h-16 rounded-full bg-black shadow-xl shadow-black/30 flex items-center justify-center text-white ring-4 ring-white active:scale-95 transition-transform relative">
                <div className="absolute inset-0 rounded-full border border-[#D4AF37]/50" />
                <item.icon className="w-7 h-7" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 active:opacity-60 transition-opacity">
                <item.icon
                  className={cn(
                    "w-6 h-6 mb-1 transition-colors",
                    (pathname === item.href || (item.href.startsWith("/#") && pathname === "/")) ? "text-bougie-espresso" : "text-bougie-espresso/50"
                  )}
                />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors",
                  (pathname === item.href || (item.href.startsWith("/#") && pathname === "/")) ? "text-bougie-espresso" : "text-bougie-espresso/60"
                )}>
                  {item.name}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
