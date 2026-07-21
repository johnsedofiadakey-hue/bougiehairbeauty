"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { ServiceCategoryIcon } from "@/components/landing/ServiceCategoryIcon";

export function Services({ settings }: { settings?: any }) {
  const revealRef = useReveal();
  const [services, setServices] = useState<any[]>([]);

  const currency = settings?.currencySymbol || "£";

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch(() => setServices([]));
  }, []);

  const categories = Array.from(new Set(services.map((s) => s.category || "Other")));
  const categoryCards = categories.map((category) => {
    const items = services.filter((s) => (s.category || "Other") === category);
    return {
      category,
      count: items.length,
      cheapest: Math.min(...items.map((s) => s.price)),
    };
  });

  return (
    <section ref={revealRef} className="py-24 bg-[var(--color-secondary)] reveal" id="services">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] mb-4">Our Services</h2>
          <div className="w-20 h-1 bg-brand-accent mx-auto mb-6 rounded-full" />
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Each service is a journey of transformation, blending technical excellence with artistic vision.
          </p>
        </div>

        {categoryCards.length === 0 ? (
          <p className="text-center text-zinc-400 italic">Our service menu is being updated — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryCards.map(({ category, count, cheapest }) => (
              <Link
                key={category}
                href={`/booking?category=${encodeURIComponent(category)}`}
                className="group bg-white rounded-[2rem] p-6 sm:p-8 text-center shadow-sm hover:shadow-2xl transition-all duration-500 ring-1 ring-zinc-100 hover:ring-brand-accent/30 flex flex-col items-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary mb-4 sm:mb-6 group-hover:bg-brand-primary/10 transition-colors">
                  <ServiceCategoryIcon category={category} className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif text-brand-primary mb-1">{category}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 mb-4">{count} treatment{count === 1 ? "" : "s"} • from {currency}{cheapest}</p>
                <span className="mt-auto text-xs font-bold uppercase tracking-widest text-brand-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Book Now <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
