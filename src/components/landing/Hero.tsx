"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Star, CalendarDays, Clock, ShieldCheck, Flower2, Users } from "lucide-react";
import { motion } from "framer-motion";

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

  const availableTimes = ["09:00 AM", "10:30 AM", "12:00 PM", "01:30 PM", "03:00 PM", "04:30 PM"];

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

  // Format YYYY-MM-DD handling local timezone shifts
  const tzOffset = selectedDate.getTimezoneOffset() * 60000;
  const formattedDate = (new Date(selectedDate.getTime() - tzOffset)).toISOString().split('T')[0];

  return (
    <section className="relative w-full min-h-screen flex flex-col bg-luxe-blush overflow-hidden">
      
      {/* Background Grid Setup */}
      <div className="absolute inset-0 w-full h-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Solid Blush */}
        <div className="bg-luxe-blush w-full h-full hidden lg:block" />
        
        {/* Right Side: The Image with Large Top-Left Radius */}
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-luxe-blush lg:hidden" /> {/* Mobile fallback background */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-full relative lg:rounded-tl-[350px] overflow-hidden"
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Subtle overlay for text legibility on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-luxe-blush via-luxe-blush/80 to-transparent lg:hidden" />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex-1 flex flex-col justify-center pt-32 lg:pt-0">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="flex flex-col items-start pt-10 lg:pt-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-6"
            >
              <Star className="w-4 h-4 text-luxe-plum fill-luxe-plum" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-luxe-plum">
                Where Beauty Meets Artistry
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-[4.5rem] font-serif text-luxe-dark leading-[1.1] mb-6 drop-shadow-sm text-balance"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-base text-luxe-dark/70 leading-relaxed max-w-md mb-10 font-sans"
            >
              {subtitle}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center gap-6 mb-16"
            >
              <Link href="/booking">
                <button className="flex items-center gap-4 px-8 py-4 rounded-full bg-luxe-plum text-white text-sm font-sans font-medium hover:bg-luxe-plumDark hover:shadow-lg transition-all group">
                  Book Your Appointment
                  <span className="bg-white rounded-full p-1 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-luxe-plum" />
                  </span>
                </button>
              </Link>
              
              <button className="flex items-center gap-3 text-sm font-sans font-medium text-luxe-dark hover:text-luxe-plum transition-colors group">
                <span className="w-12 h-12 rounded-full border border-luxe-dark/20 flex items-center justify-center group-hover:border-luxe-plum">
                  <Play className="w-4 h-4 fill-luxe-dark text-luxe-dark group-hover:fill-luxe-plum group-hover:text-luxe-plum ml-1" />
                </span>
                Watch Our Studio
              </button>
            </motion.div>

            {/* Floating Stats Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-6 shadow-sm flex items-center gap-10 max-w-max"
            >
              <div className="flex flex-col items-center text-center">
                <Star className="w-6 h-6 text-luxe-plum fill-luxe-plum mb-2" />
                <span className="text-xl font-serif font-bold text-luxe-dark mb-1">{statOneValue}</span>
                <span className="text-[10px] uppercase font-sans font-medium tracking-wider text-luxe-dark/60">{statOneLabel}</span>
              </div>
              <div className="w-px h-12 bg-luxe-dark/10" />
              <div className="flex flex-col items-center text-center">
                <Users className="w-6 h-6 text-luxe-plum mb-2" />
                <span className="text-xl font-serif font-bold text-luxe-dark mb-1">{statTwoValue}</span>
                <span className="text-[10px] uppercase font-sans font-medium tracking-wider text-luxe-dark/60">{statTwoLabel}</span>
              </div>
              <div className="w-px h-12 bg-luxe-dark/10" />
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-luxe-plum mb-2" />
                <span className="text-xl font-serif font-bold text-luxe-dark mb-1">{statThreeValue}</span>
                <span className="text-[10px] uppercase font-sans font-medium tracking-wider text-luxe-dark/60">{statThreeLabel}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Floating Calendar Widget */}
          <div className="flex items-center justify-center h-full relative lg:mt-0 mt-8 mb-12 lg:mb-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute right-10 bottom-32 bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/50 w-[340px]"
            >
              {/* Decorative top tab */}
              <div className="absolute -top-6 left-8 bg-luxe-plum rounded-t-2xl px-5 py-3 shadow-md">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              
              <h3 className="text-xl font-serif font-bold text-luxe-dark mt-2 mb-1">Book Your Slot</h3>
              <p className="text-xs font-sans text-luxe-dark/60 mb-6">Because you deserve the best.</p>
              
              {/* Mini Calendar / Time Selection Header */}
              <div className="flex items-center justify-between mb-4">
                {showTimeSelection ? (
                  <button onClick={() => setShowTimeSelection(false)} className="text-luxe-dark/60 hover:text-luxe-plum transition-colors flex items-center gap-1 text-xs font-sans font-bold">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back
                  </button>
                ) : (
                  <button onClick={handlePrevMonth} className="text-luxe-dark/40 hover:text-luxe-dark transition-colors p-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                
                <span className="text-sm font-sans font-bold text-luxe-dark">
                  {showTimeSelection ? formattedDate : `${monthName} ${year}`}
                </span>
                
                {showTimeSelection ? (
                  <div className="w-10" /> /* spacer */
                ) : (
                  <button onClick={handleNextMonth} className="text-luxe-dark/40 hover:text-luxe-dark transition-colors p-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </div>
              
              {/* Dynamic Grid: Calendar or Times */}
              <div className="min-h-[160px]">
                {showTimeSelection ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-2 gap-2 mb-6"
                  >
                    {availableTimes.map((time, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-lg text-xs font-sans font-bold transition-all border ${
                          selectedTime === time 
                            ? 'bg-luxe-plum text-white border-luxe-plum shadow-md' 
                            : 'bg-white text-luxe-dark border-luxe-dark/10 hover:border-luxe-plum/50 hover:bg-luxe-blush/30'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-7 gap-y-2 mb-6 text-center"
                  >
                    {['S','M','T','W','T','F','S'].map((d,i) => (
                      <span key={i} className="text-[10px] font-bold text-luxe-dark/40">{d}</span>
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
                          className={`text-xs font-sans w-7 h-7 mx-auto flex items-center justify-center rounded-full transition-colors ${
                            isPast 
                              ? 'text-luxe-dark/20 cursor-not-allowed'
                              : isSelected 
                                ? 'bg-luxe-plum text-white shadow-md cursor-pointer' 
                                : isToday 
                                  ? 'bg-luxe-blush text-luxe-dark font-bold border border-luxe-plum/20 cursor-pointer' 
                                  : 'text-luxe-dark hover:bg-luxe-blush cursor-pointer'
                          }`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </motion.div>
                )}
              </div>

              <Link href={showTimeSelection && selectedTime ? `/booking?date=${formattedDate}&time=${encodeURIComponent(selectedTime)}` : `/booking?date=${formattedDate}`} className="block w-full">
                <button 
                  disabled={showTimeSelection && !selectedTime}
                  className={`w-full flex items-center justify-between px-6 py-3.5 rounded-full text-xs font-sans font-bold transition-all group shadow-sm ${
                    (showTimeSelection && !selectedTime) ? 'bg-luxe-dark/10 text-luxe-dark/40 cursor-not-allowed' : 'bg-luxe-plum text-white hover:bg-luxe-plumDark'
                  }`}
                >
                  {showTimeSelection ? 'Confirm Booking' : 'Choose Date & Time'}
                  <span className={`${(showTimeSelection && !selectedTime) ? 'bg-white/50 text-luxe-dark/40' : 'bg-white text-luxe-plum'} rounded-full p-0.5 group-hover:translate-x-1 transition-transform`}>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              </Link>
            </motion.div>
          </div>
          
        </div>
      </div>

      {/* Bottom Feature Strip (Plum) */}
      <div className="relative z-20 w-full bg-luxe-plum/95 backdrop-blur-md py-6 mt-16 lg:mt-0">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
            <div className="flex items-center gap-3">
              <Flower2 className="w-6 h-6 opacity-80" />
              <div className="flex flex-col">
                <span className="text-xs font-sans font-bold leading-tight">Premium</span>
                <span className="text-xs font-sans opacity-80">Products</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 opacity-80" />
              <div className="flex flex-col">
                <span className="text-xs font-sans font-bold leading-tight">On-Time</span>
                <span className="text-xs font-sans opacity-80">Service</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 opacity-80" />
              <div className="flex flex-col">
                <span className="text-xs font-sans font-bold leading-tight">Personalized</span>
                <span className="text-xs font-sans opacity-80">Care</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 opacity-80" />
              <div className="flex flex-col">
                <span className="text-xs font-sans font-bold leading-tight">Hygienic &</span>
                <span className="text-xs font-sans opacity-80">Safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
