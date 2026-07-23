"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, Clock, ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { ServiceCategoryIcon } from "@/components/landing/ServiceCategoryIcon";
import { DEPARTMENTS } from "@/lib/departments";

// The teaser shows the five departments, not all 23 raw categories. It used
// to link straight to /booking on click — that meant there was no way to
// actually look at what's on offer (names, prices, durations) without being
// dropped into the booking wizard. Clicking a department now expands it
// in place instead; booking is a deliberate next step from there, not the
// only thing a click can do.
export function Services({ settings, hideCta = false }: { settings?: any; hideCta?: boolean }) {
  const revealRef = useReveal();
  const [services, setServices] = useState<any[]>([]);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

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
      count: items.length,
      cheapest: items.length ? Math.min(...items.map((s) => s.price)) : null,
      items,
    };
  }).filter((d) => d.count > 0);

  const active = departmentCards.find((d) => d.name === expandedDept);

  // Services within a department can span several real categories (e.g.
  // "Nails" alone covers a dozen) — group so the expanded list reads as
  // sub-sections, not one long flat list.
  const groupedByCategory = active
    ? active.items.reduce((acc: Record<string, any[]>, item) => {
        const cat = item.category || "Other";
        (acc[cat] ||= []).push(item);
        return acc;
      }, {})
    : {};

  return (
    <section ref={revealRef} className="py-24 bg-luxe-blush reveal" id="services">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-luxe-plum mb-3">Our Services</p>
          <h2 className="text-4xl md:text-5xl font-serif text-luxe-dark">Explore by Discipline</h2>
        </div>

        {departmentCards.length === 0 ? (
          <p className="text-center text-luxe-dark/70 italic">Our service menu is being updated — check back soon.</p>
        ) : !active ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            {departmentCards.map(({ name, count, cheapest }, i) => (
              <button
                key={name}
                type="button"
                onClick={() => setExpandedDept(name)}
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
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setExpandedDept(null)}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-luxe-plum mb-8 hover:text-luxe-dark transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> All Departments
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-luxe-dark text-luxe-blush flex items-center justify-center flex-shrink-0">
                <ServiceCategoryIcon category={active.name} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-luxe-dark">{active.name}</h3>
                <p className="text-sm text-luxe-dark/60">{active.count} treatment{active.count === 1 ? "" : "s"}</p>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedByCategory).map(([category, items]) => (
                <div key={category} className="bg-white/60 rounded-2xl overflow-hidden border border-luxe-dark/10">
                  <div className="px-5 py-3 border-b border-luxe-dark/10 bg-white/40">
                    <h4 className="font-bold text-luxe-dark text-sm">{category}</h4>
                  </div>
                  <div className="divide-y divide-luxe-dark/5">
                    {items.map((service) => (
                      <div key={service.id} className="flex items-center justify-between gap-4 px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-luxe-dark">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-luxe-dark/50 mt-0.5 line-clamp-2">{service.description}</p>
                          )}
                          {service.duration > 0 && (
                            <p className="text-xs text-luxe-dark/50 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {service.duration} mins
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-luxe-plum text-sm whitespace-nowrap flex-shrink-0">
                          {currency}{service.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href={`/booking?category=${encodeURIComponent(active.items[0]?.category || "")}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-luxe-plum text-white text-sm font-bold hover:bg-luxe-plumDark transition-colors"
              >
                Book {active.name}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
