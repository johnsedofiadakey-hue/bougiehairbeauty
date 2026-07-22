"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      question: "What should I do to prepare for my hair appointment?",
      answer: "We recommend arriving with clean, dry hair. If you're booking for color, avoid washing your hair 24 hours prior to allow natural oils to protect your scalp."
    },
    {
      question: "Do you offer consultations for new clients?",
      answer: "Yes, every first-time service includes a complimentary 15-minute diagnostic consultation to understand your goals and hair/skin history."
    },
    {
      question: "What is your cancellation policy?",
      answer: "We require at least 24 hours' notice for cancellations. Deposits are non-refundable but can be transferred to a new date if rescheduled within the notice period."
    },
    {
      question: "Which products do you use in the studio?",
      answer: "We exclusively use professional-grade products chosen for your specific hair and skin needs. You can also purchase these for aftercare."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] mb-4">Common Inquiries</h2>
          <p className="text-zinc-500">Everything you need to know before your Bougie experience.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-zinc-100 last:border-0 pb-4">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center py-4 text-left group"
              >
                <span className="text-lg font-medium text-brand-primary transition-colors">
                  {faq.question}
                </span>
                {openIndex === i ? <Minus className="w-5 h-5 text-brand-accent" /> : <Plus className="w-5 h-5 text-zinc-300" />}
              </button>
              {openIndex === i && (
                <div className="pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-zinc-500 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
