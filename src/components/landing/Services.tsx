"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { ServiceCategoryIcon } from "@/components/landing/ServiceCategoryIcon";
import { DEPARTMENTS } from "@/lib/departments";

// The homepage teaser shows the five departments, not all 23 raw
// categories — the full breakdown is still one click away on /booking.

export function Services({ settings, hideCta = false }: { settings?: any; hideCta?: boolean }) {
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

  const departmentCards = DEPARTMENTS.map(({ name, match }) => {
    const items = services.filter((s) => match.test(s.category || ""));
    return {
      name,
      matchLabel: name,
      count: items.length,
      cheapest: items.length ? Math.min(...items.map((s) => s.price)) : null,
      // First real category in this department — passed to /booking so it
      // opens on the right department tab instead of a generic first page.
      firstCategory: items[0]?.category as string | undefined,
    };
  }).filter((d) => d.count > 0);

  return (
    <section ref={revealRef} className="py-24 bg-luxe-blush reveal" id="services">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-luxe-plum mb-3">Our Services</p>
          <h2 className="text-4xl md:text-5xl font-serif text-luxe-dark">Explore by Discipline</h2>
        </div>

        {departmentCards.length === 0 ? (
          <p className="text-center text-luxe-dark/70 italic">Our service menu is being updated — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            {departmentCards.map(({ name, count, cheapest, firstCategory }, i) => (
              <Link
                key={name}
                href={firstCategory ? `/booking?category=${encodeURIComponent(firstCategory)}` : "/booking"}
                className="reveal-stagger-item group flex flex-col items-center text-center"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-luxe-blush flex items-center justify-center text-luxe-dark mb-5 shadow-sm ring-1 ring-luxe-dark/10 group-hover:bg-luxe-dark group-hover:text-luxe-blush group-hover:scale-105 transition-all duration-300">
                  <ServiceCategoryIcon category={name} className="w-9 h-9 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide text-luxe-dark mb-1">{name}</h3>
                <p className="text-xs sm:text-sm text-luxe-dark/70">
                  {count} treatment{count === 1 ? "" : "s"}{cheapest != null ? ` · from ${currency}${cheapest}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
