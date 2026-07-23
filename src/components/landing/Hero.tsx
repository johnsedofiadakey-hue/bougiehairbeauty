"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, CalendarDays, Clock, ShieldCheck, Flower2, Users } from "lucide-react";
import { formatSlotLabel } from "@/lib/utils";

interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
  statOneValue: string;
  statOneLabel: string;
  statTwoValue: string;
  statTwoLabel: string;
  statThreeValue: string;
  statThreeLabel: string;
}

export function Hero({
  title,
  subtitle,
  image,
  statOneValue,
  statOneLabel,
  statTwoValue,
  statTwoLabel,
  statThreeValue,
  statThreeLabel,
}: HeroProps) {
  const [currentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  // Real availability, not a fixed guessed list — same endpoint the booking
  // page itself uses, so a slot she picks here is actually bookable when she
  // gets there instead of possibly colliding with something already taken.
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const tzOffset = selectedDate.getTimezoneOffset() * 60000;
  const formattedDate = (new Date(selectedDate.getTime() - tzOffset)).toISOString().split('T')[0];

  useEffect(() => {
    setLoadingTimes(true);
    setSelectedTime(null);
    fetch(`/api/bookings/available?date=${formattedDate}`)
      .then((res) => res.json())
      .then((data) => setAvailableTimes(Array.isArray(data) ? data : []))
      .catch(() => setAvailableTimes([]))
      .finally(() => setLoadingTimes(false));
  }, [formattedDate]);

  // Exact colors from inspiration
  const bgCream = "#F6F1EC";
  const dustyPlum = "#917079";
  const textMauve = "#917079";
  const textDark = "#3A3335";

  return (
    <section className="relative w-full min-h-screen flex flex-col lg:flex-row overflow-hidden" style={{ backgroundColor: bgCream }}>
      {/* Background Floral Watermark */}
      <div className="absolute left-[-10%] top-1/4 opacity-10 pointer-events-none transform -rotate-12 scale-150 z-0 hidden lg:block">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 100C50 100 30 70 30 50C30 30 50 20 50 20C50 20 70 30 70 50C70 70 50 100 50 100Z" stroke={textDark} strokeWidth="0.5"/>
          <path d="M50 50C50 50 20 40 10 20C20 10 40 20 50 50Z" stroke={textDark} strokeWidth="0.5"/>
          <path d="M50 50C50 50 80 40 90 20C80 10 60 20 50 50Z" stroke={textDark} strokeWidth="0.5"/>
        </svg>
      </div>

      {/* Left Side Content */}
      <div className="flex-1 lg:w-[55%] flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-32 pb-24 z-20 relative">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-4 h-4" style={{ color: dustyPlum, fill: dustyPlum }} />
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em]" style={{ color: dustyPlum }}>
            Where Beauty Meets Artistry
          </span>
        </div>

        <h1
          className="text-4xl md:text-5xl xl:text-[3.5rem] font-serif leading-[1.1] mb-6 drop-shadow-sm text-balance tracking-tight"
          style={{ color: textDark }}
        >
          {title}
        </h1>

        <p
          className="text-sm md:text-base leading-relaxed max-w-sm mb-10 font-sans"
          style={{ color: textDark, opacity: 0.8 }}
        >
          {subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-6 mb-16">
          <Link href="/booking">
            <button className="flex items-center gap-4 px-8 py-4 rounded-full text-white text-sm font-sans font-medium hover:opacity-90 transition-all group shadow-md" style={{ backgroundColor: dustyPlum }}>
              Book Your Appointment
              <span className="bg-white rounded-full p-1 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" style={{ color: dustyPlum }} />
              </span>
            </button>
          </Link>
        </div>

        {/* Floating Stats Widget */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-12 max-w-max border border-white">
          <div className="flex flex-col items-center text-center">
            <Star className="w-5 h-5 mb-3" style={{ color: dustyPlum, fill: dustyPlum }} />
            <span className="text-xl font-serif font-bold mb-1" style={{ color: textDark }}>{statOneValue}</span>
            <span className="text-[10px] font-sans font-medium uppercase tracking-wider" style={{ color: textDark, opacity: 0.7 }}>{statOneLabel}</span>
          </div>
          <div className="w-px h-12 bg-black/5" />
          <div className="flex flex-col items-center text-center">
            <Users className="w-5 h-5 mb-3" style={{ color: dustyPlum }} />
            <span className="text-xl font-serif font-bold mb-1" style={{ color: textDark }}>{statTwoValue}</span>
            <span className="text-[10px] font-sans font-medium uppercase tracking-wider" style={{ color: textDark, opacity: 0.7 }}>{statTwoLabel}</span>
          </div>
          <div className="w-px h-12 bg-black/5" />
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="w-5 h-5 mb-3" style={{ color: dustyPlum }} />
            <span className="text-xl font-serif font-bold mb-1" style={{ color: textDark }}>{statThreeValue}</span>
            <span className="text-[10px] font-sans font-medium uppercase tracking-wider" style={{ color: textDark, opacity: 0.7 }}>{statThreeLabel}</span>
          </div>
        </div>
      </div>

      {/* Right Side Image & Calendar */}
      <div className="w-full lg:w-[45%] relative lg:min-h-screen flex flex-col justify-end lg:justify-center z-10 lg:pt-0 pt-10">
        
        {/* The Image Container */}
        <div className="relative w-full h-[60vh] lg:h-[100%] lg:rounded-tl-[400px] lg:rounded-bl-[100px] overflow-visible lg:overflow-hidden shadow-2xl rounded-t-3xl mx-4 lg:mx-0 lg:ml-0 lg:rounded-tr-none lg:rounded-br-none w-[calc(100%-2rem)] lg:w-full">
          
          {/* Top Wave Overlay for Navbar Area */}
          <div className="absolute top-0 right-0 w-full h-[150px] z-10 pointer-events-none hidden lg:block">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full" style={{ fill: bgCream }}>
              <path d="M0,0 L1440,0 L1440,80 Q720,320 0,80 Z" />
            </svg>
          </div>

          <Image
            src={image}
            alt={title}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover rounded-t-3xl lg:rounded-none"
          />
        </div>

        {/* Custom Shape Calendar Widget */}
        <div className="relative lg:absolute lg:bottom-32 lg:left-[-120px] xl:left-[-150px] w-[90%] lg:w-[340px] z-30 mx-auto lg:mx-0 mt-[-60px] lg:mt-0">
          {/* The "bump" tab */}
          <div className="absolute -top-10 left-6 bg-white/95 backdrop-blur-xl rounded-t-3xl w-16 h-12 shadow-[0_-8px_20px_rgb(0,0,0,0.05)] z-0 flex items-center justify-center pt-2">
            <div className="bg-[#917079] rounded-lg p-1.5">
              <CalendarDays className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* The main calendar body */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl rounded-tl-none p-8 shadow-[0_20px_40px_rgb(0,0,0,0.08)] relative z-10 border border-white/50">
            <h3 className="text-xl font-serif font-bold mt-1 mb-1" style={{ color: textDark }}>Book Your Slot</h3>
            <p className="text-[11px] font-sans mb-6" style={{ color: textDark, opacity: 0.6 }}>Because you deserve the best.</p>
            
            {/* Mini Calendar / Time Selection Header */}
            <div className="flex items-center justify-between mb-4">
              {showTimeSelection ? (
                <button onClick={() => setShowTimeSelection(false)} className="transition-colors flex items-center gap-1 text-[11px] font-sans font-bold" style={{ color: dustyPlum }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              ) : (
                <button onClick={handlePrevMonth} className="transition-colors p-1" style={{ color: textDark, opacity: 0.4 }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              
              <span className="text-[11px] font-sans font-bold" style={{ color: textDark }}>
                {showTimeSelection ? formattedDate : `${monthName} ${year}`}
              </span>
              
              {showTimeSelection ? (
                <div className="w-5" />
              ) : (
                <button onClick={handleNextMonth} className="transition-colors p-1" style={{ color: textDark, opacity: 0.4 }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
            
            {/* Dynamic Grid: Calendar or Times */}
            <div className="min-h-[160px]">
              {showTimeSelection ? (
                loadingTimes ? (
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="py-2 rounded-xl bg-black/5 animate-pulse h-8" />
                    ))}
                  </div>
                ) : availableTimes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {availableTimes.map((time, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTime(time)}
                        className="py-2 rounded-xl text-[10px] font-sans font-bold transition-all border"
                        style={{
                          backgroundColor: selectedTime === time ? dustyPlum : 'transparent',
                          color: selectedTime === time ? 'white' : textDark,
                          borderColor: selectedTime === time ? dustyPlum : 'rgba(0,0,0,0.05)'
                        }}
                      >
                        {formatSlotLabel(time)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] mb-6 text-center" style={{ color: textDark, opacity: 0.5 }}>
                    No slots left for this date — try another day.
                  </p>
                )
              ) : (
                <div className="grid grid-cols-7 gap-y-3 gap-x-1 mb-6 text-center">
                  {['S','M','T','W','T','F','S'].map((d,i) => (
                    <span key={i} className="text-[9px] font-bold" style={{ color: textDark, opacity: 0.4 }}>{d}</span>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <span key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                    const isSelected = selectedDate.getFullYear() === date.getFullYear() && 
                                       selectedDate.getMonth() === date.getMonth() && 
                                       selectedDate.getDate() === date.getDate();
                    const isToday = currentDate.getFullYear() === date.getFullYear() && 
                                    currentDate.getMonth() === date.getMonth() && 
                                    currentDate.getDate() === date.getDate();
                    
                    const todayZero = new Date(currentDate);
                    todayZero.setHours(0,0,0,0);
                    const isPast = date < todayZero;
                    
                    return (
                      <span 
                        key={day}
                        onClick={() => {
                          if (!isPast) {
                            setSelectedDate(date);
                            setShowTimeSelection(true);
                          }
                        }}
                        className="text-[10px] font-sans w-6 h-6 mx-auto flex items-center justify-center rounded-full transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? dustyPlum : (isToday ? '#F6F1EC' : 'transparent'),
                          color: isPast ? 'rgba(0,0,0,0.2)' : (isSelected ? 'white' : textDark),
                          fontWeight: isSelected || isToday ? 'bold' : 'normal'
                        }}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <Link href={showTimeSelection && selectedTime ? `/booking?date=${formattedDate}&time=${encodeURIComponent(selectedTime)}` : `/booking?date=${formattedDate}`} className="block w-full mt-2">
              <button 
                disabled={showTimeSelection && !selectedTime}
                className="w-full flex items-center justify-between px-5 py-3 rounded-full text-[11px] font-sans font-bold transition-all group shadow-sm"
                style={{
                  backgroundColor: (showTimeSelection && !selectedTime) ? 'rgba(0,0,0,0.05)' : dustyPlum,
                  color: (showTimeSelection && !selectedTime) ? 'rgba(0,0,0,0.3)' : 'white'
                }}
              >
                {showTimeSelection ? 'Confirm Booking' : 'Choose Date & Time'}
                <span className="rounded-full p-1 group-hover:translate-x-1 transition-transform" style={{ backgroundColor: (showTimeSelection && !selectedTime) ? 'rgba(255,255,255,0.5)' : 'white' }}>
                  <ArrowRight className="w-3 h-3" style={{ color: (showTimeSelection && !selectedTime) ? 'rgba(0,0,0,0.3)' : dustyPlum }} />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Feature Strip */}
      <div className="relative lg:absolute lg:bottom-0 lg:left-0 z-40 w-full lg:w-[60%] lg:rounded-tr-[80px] py-6 px-6 md:px-12 shadow-[0_-10px_40px_rgb(0,0,0,0.1)]" style={{ backgroundColor: dustyPlum }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white max-w-4xl mx-auto">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Flower2 className="w-6 h-6 opacity-90" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[10px] font-sans font-bold leading-tight uppercase tracking-wide">Premium</span>
              <span className="text-[10px] font-sans opacity-80">Products</span>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Clock className="w-6 h-6 opacity-90" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[10px] font-sans font-bold leading-tight uppercase tracking-wide">On-Time</span>
              <span className="text-[10px] font-sans opacity-80">Service</span>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Users className="w-6 h-6 opacity-90" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[10px] font-sans font-bold leading-tight uppercase tracking-wide">Personalized</span>
              <span className="text-[10px] font-sans opacity-80">Care</span>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <ShieldCheck className="w-6 h-6 opacity-90" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[10px] font-sans font-bold leading-tight uppercase tracking-wide">Hygienic &</span>
              <span className="text-[10px] font-sans opacity-80">Safe</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
