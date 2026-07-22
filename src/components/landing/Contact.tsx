"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Mail, Phone, Instagram } from "lucide-react";

export function Contact({ settings }: { settings?: any }) {

  return (
    <section className="relative py-24 bg-[#1C140F] text-white overflow-hidden" id="contact">
      {/* Same ambient-glow + glass card language as the Login/Portal pages,
          so the "quick contact" card reads as considered glass rather than
          a flat white box on hot pink. */}
      <div className="absolute top-1/2 -left-24 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-primary/20 blur-3xl" />
      <div className="absolute top-1/2 -right-24 -translate-y-1/2 w-96 h-96 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Let's Connect</h2>
            <p className="text-xl text-white/60 mb-12 max-w-md">
              Whether you're ready to book or just have a question, we're here to help you begin your beauty journey.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-medium">Visit Us</h4>
                  <p className="text-white/50">{settings?.address || '123 Beauty Lane, Luxury District'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-white/50">{settings?.contactEmail || 'bougiehairuk@gmail.com'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-medium">Follow Us</h4>
                  <p className="text-white/50">{settings?.instagramUrl?.split('/').filter(Boolean).pop() || '@bougiehair_'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h3 className="text-3xl font-serif mb-8 text-white">Quick Contact</h3>
            <div className="space-y-6">
              <a href={`https://wa.me/${settings?.whatsappNumber || '447700900000'}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full bg-[#25D366] text-white border-none hover:bg-[#20bd5c]">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </a>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/15"></div>
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-[#241A14] px-2 text-white/40">Or Call Us</span>
                </div>
              </div>
              <a href={`tel:${settings?.contactPhone || settings?.whatsappNumber || '+447700900000'}`}>
                <Button variant="outline" size="lg" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
                  <Phone className="w-5 h-5 mr-2" />
                  {settings?.contactPhone || (settings?.whatsappNumber ? `+${settings.whatsappNumber}` : '07770 375859')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
