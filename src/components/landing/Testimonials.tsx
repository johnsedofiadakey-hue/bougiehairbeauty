"use client";

import { Star, Quote } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

// Hidden until real client reviews are supplied — these were always
// placeholder content, and publishing invented testimonials as genuine is a
// trust problem, not a style one. Flip to true once real reviews replace
// the array below.
const HAS_REAL_REVIEWS = false;

const reviews = [
  {
    name: "Chantelle A.",
    role: "Knotless Braids Client",
    content: "The attention to detail is unlike anything I've experienced. My braids were flawless and lasted for weeks.",
    rating: 5
  },
  {
    name: "Priya M.",
    role: "Lash Extensions Client",
    content: "A truly professional and relaxing environment. My lash set has completely transformed my routine. Highly recommended.",
    rating: 5
  },
  {
    name: "Jade O.",
    role: "Nail Bar Client",
    content: "She is a master of the craft. The result was exactly what I wanted — natural, vibrant, and beautifully done.",
    rating: 5
  }
];

export function Testimonials() {
  const revealRef = useReveal();

  if (!HAS_REAL_REVIEWS) return null;

  return (
    <section ref={revealRef} className="py-24 bg-bougie-espresso/5 reveal">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex justify-center gap-1 mb-4">
             {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-bougie-pink text-bougie-pink" />)}
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-bougie-espresso mb-4">Client Love</h2>
          <p className="text-bougie-espresso/60 max-w-xl mx-auto">Hear from those who have experienced the Bougie transformation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-white p-10 rounded-3xl shadow-sm border border-bougie-espresso/10 relative group hover:shadow-xl transition-all duration-500"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl glass-dark flex items-center justify-center absolute top-8 right-8 group-hover:scale-110 transition-transform">
                <Quote className="w-6 h-6 text-bougie-cream" />
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-bougie-pink text-bougie-pink" />)}
              </div>
              <p className="text-bougie-espresso/70 mb-8 italic leading-relaxed">&quot;{review.content}&quot;</p>
              <div>
                <p className="font-bold text-bougie-espresso">{review.name}</p>
                <p className="text-xs text-bougie-espresso/50 uppercase tracking-widest">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
