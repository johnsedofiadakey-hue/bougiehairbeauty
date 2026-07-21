"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppFloat({ number }: { number?: string }) {
  if (!number) return null;
  
  return (
    <a 
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-8 right-6 z-[60] group"
    >
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-xl shadow-xl border border-zinc-100 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap text-sm font-medium text-brand-primary">
        Chat with us!
      </div>
      <div className="w-14 h-14 rounded-full bg-[#25D366] shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
        <MessageCircle className="w-8 h-8 fill-white" />
      </div>
    </a>
  );
}
