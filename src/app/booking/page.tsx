"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { ChevronRight, ChevronLeft, ChevronDown, Check, Clock, Phone, Banknote, ShieldCheck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeUKPhone, formatSlotLabel, formatServicePrice, formatTotalPrice } from "@/lib/utils";
import { ServiceCategoryIcon } from "@/components/landing/ServiceCategoryIcon";
import { DEPARTMENTS, OTHER_DEPARTMENT, getDepartmentForCategory } from "@/lib/departments";

type Step = "service" | "datetime" | "details" | "policy";

// Horizontally-scrolling rows (department tabs, date picker) had no visual
// cue that more content sat off-screen — customers said they had to guess
// there was anything to swipe to. Tracks scroll position so callers can show
// an edge fade + hint arrow only on the side that actually has more content.
function useScrollFade(deps: any[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref, canScrollLeft, canScrollRight };
}

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [clientData, setClientData] = useState({ name: "", phone: "", email: "" });
  const [currency, setCurrency] = useState("£");
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [bankDetails, setBankDetails] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bookingPolicy, setBookingPolicy] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointmentId, setConfirmedAppointmentId] = useState<string | null>(null);
  // Set when the Hero's "Book Your Slot" widget hands off a date + time —
  // lets her land straight on service selection and skip re-picking a slot
  // she already chose. Cleared automatically if that slot turns out not to
  // actually be free (see the availability check below) rather than letting
  // a stale/fake slot silently through.
  const [dateTimePrefilled, setDateTimePrefilled] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsAdmin(searchParams.get("admin") === "true");
    const requestedCategory = searchParams.get("category");

    // Hand-off from the Hero's booking widget — she already picked a date
    // and time there, so don't make her pick it again here.
    const requestedDateStr = searchParams.get("date");
    const requestedTime = searchParams.get("time");
    if (requestedDateStr) {
      const parsedDate = new Date(`${requestedDateStr}T00:00:00`);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
        if (requestedTime) {
          setSelectedTime(requestedTime);
          setDateTimePrefilled(true);
        }
      }
    }

    setIsLoadingServices(true);
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setIsLoadingServices(false);
        if (Array.isArray(data) && data.length > 0) {
          const match = requestedCategory && data.find((s: any) => s.category === requestedCategory);
          const initialCategory = match ? requestedCategory : data[0].category;
          setExpandedCategory(initialCategory);
          setSelectedDepartment(getDepartmentForCategory(initialCategory).name);
        }
      });

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.currencySymbol) setCurrency(data.currencySymbol);
        setRequireDeposit(!!data.requireDeposit);
        setBankDetails(data.bankDetails || "");
        setBankAccountName(data.bankAccountName || "");
        setBookingPolicy(data.bookingPolicy || "");
      });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setIsLoadingSlots(true);
      fetch(`/api/bookings/available?date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
          setAvailableSlots(data);
          setIsLoadingSlots(false);
          // The Hero widget offers a fixed set of times without checking
          // real availability first — confirm the hand-off slot is actually
          // still free against the real schedule before trusting it enough
          // to skip a whole step. If it's gone, fall back to the normal
          // flow instead of silently letting a conflicting booking through.
          if (dateTimePrefilled && selectedTime && Array.isArray(data) && !data.includes(selectedTime)) {
            setDateTimePrefilled(false);
            setSelectedTime(null);
          }
        });
    }
  }, [selectedDate]);

  const needsPolicyStep = requireDeposit && !isAdmin;
  const baseSteps: Step[] = needsPolicyStep ? ["service", "datetime", "details", "policy"] : ["service", "datetime", "details"];
  const steps: Step[] = dateTimePrefilled ? baseSteps.filter((s) => s !== "datetime") : baseSteps;
  const stepIndex = steps.indexOf(currentStep);

  const days = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));

  const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
  const totalLabel = formatTotalPrice(selectedServices, currency);

  const categories = Array.from(new Set(services.map((s) => s.category || "Other")));
  const servicesByCategory: Record<string, any[]> = categories.reduce((acc, cat) => {
    acc[cat] = services.filter((s) => (s.category || "Other") === cat);
    return acc;
  }, {} as Record<string, any[]>);

  // Grouping 23 raw categories into Bougie's 5 real departments (same
  // mapping as the homepage teaser) so the picker shows one manageable
  // tab at a time instead of a single 23-item wall of accordions.
  const departmentTabs = [...DEPARTMENTS, OTHER_DEPARTMENT]
    .map((dept) => ({ ...dept, categories: categories.filter((c) => getDepartmentForCategory(c).name === dept.name) }))
    .filter((dept) => dept.categories.length > 0);
  const visibleCategories = selectedDepartment
    ? categories.filter((c) => getDepartmentForCategory(c).name === selectedDepartment)
    : categories;

  const deptScroll = useScrollFade([departmentTabs.length]);
  const dateScroll = useScrollFade([days.length]);

  const handleNext = async () => {
    if (currentStep === "service") setCurrentStep(dateTimePrefilled ? "details" : "datetime");
    else if (currentStep === "datetime") setCurrentStep("details");
    else if (currentStep === "details") {
      if (needsPolicyStep) {
        setCurrentStep("policy");
      } else {
        await finalizeBooking();
      }
    }
    else if (currentStep === "policy") {
      await finalizeBooking();
    }
  };

  const handleStripeCheckout = async () => {
    if (!confirmedAppointmentId) return;
    setIsSubmitting(true);
    try {
      // Use exact same logic for minimum deposit
      const depositAmount = Math.round(totalPrice * 0.2);
      const res = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: confirmedAppointmentId, amount: depositAmount })
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.error || "Failed to initiate payment");
      }
    } catch (e) {
      alert("Error initiating payment");
    }
    setIsSubmitting(false);
  };

  const finalizeBooking = async () => {
    setIsSubmitting(true);
    const normalizedPhone = normalizeUKPhone(clientData.phone);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceIds: selectedServices.map(s => s.id),
        startTime: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`,
        name: clientData.name,
        phone: normalizedPhone,
        email: clientData.email.trim(),
        staffId: "solo-staff-id"
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.id) setConfirmedAppointmentId(data.id);
      
      // Save phone to localStorage so they can auto-fill it when logging in
      if (typeof window !== "undefined") {
        localStorage.setItem("client_phone", normalizedPhone);
      }

      setIsSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E8D7D0', '#FAFAF7']
      });
    } else {
      const errorData = await res.json();
      alert(errorData.error || "Failed to confirm booking. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleBack = () => {
    if (currentStep === "datetime") setCurrentStep("service");
    else if (currentStep === "details") setCurrentStep(dateTimePrefilled ? "service" : "datetime");
    else if (currentStep === "policy") setCurrentStep("details");
  };

  const toggleService = (service: any) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const depositEstimate = () => {
    const min = Math.round(totalPrice * 0.2);
    const maxTotal = selectedServices.reduce((sum, s) => sum + (s.priceMax && s.priceMax > s.price ? s.priceMax : s.price), 0);
    const max = Math.round(maxTotal * 0.2);
    return max > min ? `${currency}${min} - ${currency}${max}` : `${currency}${min}`;
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-32 pb-28 px-4 sm:px-6 relative overflow-hidden bg-bougie-cream">
      {/* Animated abstract mesh gradient background */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-bougie-champagne/40 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-bougie-pink/40 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[40%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-bougie-espresso/5 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all text-sm ${
                  idx <= stepIndex ? "bg-bougie-espresso text-bougie-cream shadow-lg" : "backdrop-blur-md bg-white/40 text-bougie-taupe border border-white/30"
                }`}
              >
                {idx < stepIndex ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 sm:w-24 h-[2px] mx-1.5 sm:mx-2 ${idx < stepIndex ? "bg-bougie-espresso" : "bg-bougie-espresso/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl p-5 sm:p-8 md:p-12 shadow-[0_8px_32px_0_rgba(44,30,22,0.08)] border border-white/40 relative overflow-hidden">
          {/* Top back button — mirrors the one in the fixed bottom bar so
              it's visible the instant a step loads, without needing to
              notice (or scroll to) the bottom nav bar first. */}
          {!isSuccess && (
            stepIndex === 0 ? (
              <Link
                href="/"
                aria-label="Back to home"
                className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-bougie-espresso/5 hover:bg-bougie-espresso/10 text-bougie-taupe hover:text-bougie-espresso transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <button
                onClick={handleBack}
                aria-label="Back"
                className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-bougie-espresso/5 hover:bg-bougie-espresso/10 text-bougie-taupe hover:text-bougie-espresso transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )
          )}

          {/* Success Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 sm:p-12 text-center animate-in fade-in duration-500 overflow-y-auto">
               <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500 delay-200 flex-shrink-0">
                  <Check className="w-12 h-12 text-emerald-600" />
               </div>
               <h2 className="text-3xl sm:text-4xl font-serif text-bougie-espresso mb-4">Confirmed!</h2>
               <p className="text-lg text-bougie-espresso/80 mb-8 max-w-md">Your appointment for {selectedServices.length} service{selectedServices.length === 1 ? "" : "s"} has been secured. We'll see you soon!</p>
               
               {needsPolicyStep ? (
                 <div className="w-full max-w-md space-y-4">
                   <div className="p-5 bg-bougie-pink/20 rounded-2xl border border-bougie-champagne/30 mb-6">
                     <p className="font-serif text-xl text-bougie-espresso mb-2">Deposit Required</p>
                     <p className="text-sm text-bougie-espresso/80 mb-4">Please pay your {depositEstimate()} deposit to finalize this booking.</p>
                     
                     <button
                       onClick={handleStripeCheckout}
                       disabled={isSubmitting}
                       className="w-full px-8 py-4 bg-bougie-espresso text-bougie-cream rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-xl shadow-bougie-espresso/20 flex items-center justify-center gap-2"
                     >
                       {isSubmitting ? "Loading..." : "Pay Deposit via Card (Secure)"}
                     </button>
                     
                     <div className="mt-4 pt-4 border-t border-bougie-champagne/20">
                       <p className="text-xs font-bold uppercase tracking-widest text-bougie-champagne mb-2">Or Pay via Bank Transfer</p>
                       {bankDetails ? (
                         <>
                           <p className="text-sm font-bold">{bankDetails}</p>
                           {bankAccountName && <p className="text-xs text-bougie-espresso/80 mt-1">Account name: {bankAccountName}</p>}
                         </>
                       ) : (
                         <p className="text-xs text-bougie-espresso/80">We'll share bank transfer details with you directly.</p>
                       )}
                     </div>
                   </div>
                   
                   <Link
                     href="/portal"
                     className="block w-full px-8 py-4 bg-bougie-espresso/5 text-bougie-espresso/80 rounded-xl font-bold hover:bg-bougie-espresso/10 transition-colors"
                   >
                     Access Your Portal
                   </Link>
                 </div>
               ) : (
                 <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                   <Link
                     href="/portal"
                     className="flex-1 px-8 py-4 bg-bougie-espresso text-bougie-cream rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-bougie-espresso/20"
                   >
                     Access Your Portal
                   </Link>
                   <Link
                     href="/"
                     className="flex-1 px-8 py-4 bg-bougie-espresso/5 text-bougie-espresso/80 rounded-2xl font-bold hover:bg-bougie-espresso/10 transition-colors"
                   >
                     Back to Home
                   </Link>
                 </div>
               )}
            </div>
          )}

          {/* Step 1: Select Service */}
          {currentStep === "service" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-serif text-bougie-espresso mb-2">Select Services</h2>
                <p className="text-sm sm:text-base text-bougie-taupe">Tap a category to see options. Choose as many as you like.</p>
              </div>

              {dateTimePrefilled && selectedTime && (
                <div className="flex items-center justify-center gap-2 text-sm bg-emerald-50 text-emerald-800 rounded-full px-4 py-2.5 mx-auto w-fit">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Your slot: {format(selectedDate, "EEEE d MMMM")} at {formatSlotLabel(selectedTime)}</span>
                  <button
                    type="button"
                    onClick={() => { setDateTimePrefilled(false); setCurrentStep("datetime"); }}
                    className="underline font-bold hover:text-emerald-900 transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}

              {isLoadingServices ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Department tabs — pick a department first so the list below
                      shows a handful of categories at a time, not all 23 at once.
                      Edge fades + a chevron hint on the right make it obvious
                      there's more to swipe to instead of the row just trailing
                      off with no cue. */}
                  <div className="relative -mx-1 px-1">
                    {deptScroll.canScrollLeft && (
                      <div className="pointer-events-none absolute left-0 top-0 bottom-1 w-8 z-10 bg-gradient-to-r from-white/90 to-transparent" />
                    )}
                    <div ref={deptScroll.ref} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {departmentTabs.map((dept) => {
                        const isActive = selectedDepartment === dept.name;
                        return (
                          <button
                            key={dept.name}
                            type="button"
                            onClick={() => {
                              setSelectedDepartment(dept.name);
                              if (!dept.categories.includes(expandedCategory || "")) {
                                setExpandedCategory(dept.categories[0] || null);
                              }
                            }}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                              isActive ? "bg-bougie-espresso text-bougie-cream" : "bg-bougie-espresso/5 text-bougie-taupe hover:bg-bougie-espresso/10"
                            }`}
                          >
                            <ServiceCategoryIcon category={dept.name} className="w-4 h-4" />
                            {dept.name}
                          </button>
                        );
                      })}
                    </div>
                    {deptScroll.canScrollRight && (
                      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-12 z-10 flex items-center justify-end bg-gradient-to-l from-white/95 via-white/70 to-transparent">
                        <ChevronRight className="w-4 h-4 text-bougie-taupe/70 mr-0.5 animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                  {visibleCategories.map((category) => {
                    const items = servicesByCategory[category];
                    const cheapest = Math.min(...items.map((s) => s.price));
                    const selectedInCategory = items.filter((s) => selectedServices.find((sel) => sel.id === s.id)).length;
                    const isExpanded = expandedCategory === category;

                    return (
                      <div key={category} className={`rounded-2xl border-2 overflow-hidden transition-colors ${selectedInCategory > 0 ? "border-bougie-champagne/40" : "border-bougie-espresso/10"}`}>
                        <button
                          type="button"
                          onClick={() => setExpandedCategory(isExpanded ? null : category)}
                          className="w-full flex items-center gap-4 p-4 text-left"
                        >
                          <div className="w-11 h-11 rounded-xl bg-bougie-pink/20 flex items-center justify-center text-bougie-champagne flex-shrink-0">
                            <ServiceCategoryIcon category={category} className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold flex items-center gap-2">
                              {category}
                              {selectedInCategory > 0 && (
                                <span className="text-[10px] font-bold bg-bougie-espresso text-bougie-cream px-2 py-0.5 rounded-full">{selectedInCategory}</span>
                              )}
                            </h4>
                            <p className="text-xs text-bougie-taupe">{items.length} option{items.length === 1 ? "" : "s"} • from {currency}{cheapest}</p>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-bougie-taupe/70 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        {isExpanded && (
                          <div className="border-t border-bougie-espresso/10 divide-y divide-zinc-50">
                            {items.map((service) => {
                              const isChecked = !!selectedServices.find((s) => s.id === service.id);
                              return (
                                <label
                                  key={service.id}
                                  className={`flex items-center gap-4 px-4 py-4 min-h-[56px] cursor-pointer transition-colors ${isChecked ? "bg-bougie-pink/20" : "active:bg-bougie-cream"}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleService(service)}
                                    className="w-5 h-5 rounded accent-bougie-champagne flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{service.name}</p>
                                    {service.description && <p className="text-xs text-bougie-taupe/70 mt-0.5">{service.description}</p>}
                                    <p className="text-xs text-bougie-taupe mt-0.5 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {service.duration} mins
                                    </p>
                                  </div>
                                  <span className="font-bold text-bougie-champagne text-sm whitespace-nowrap">{formatServicePrice(service, currency)}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === "datetime" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-serif text-bougie-espresso mb-2">Choose Time</h2>
                <p className="text-sm sm:text-base text-bougie-taupe">Select a slot for your {totalDuration} min session.</p>
              </div>

              <div className="relative">
                {dateScroll.canScrollLeft && (
                  <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-8 z-10 bg-gradient-to-r from-white/90 to-transparent" />
                )}
                <div ref={dateScroll.ref} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {days.map((day) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`flex flex-col items-center min-w-[70px] p-4 rounded-2xl border-2 transition-all ${
                        isSameDay(day, selectedDate) ? "border-bougie-espresso bg-bougie-espresso text-bougie-cream" : "border-bougie-espresso/10"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold mb-1 opacity-60">{format(day, "EEE")}</span>
                      <span className="text-lg font-bold">{format(day, "d")}</span>
                    </button>
                  ))}
                </div>
                {dateScroll.canScrollRight && (
                  <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 z-10 flex items-center justify-end bg-gradient-to-l from-white/95 via-white/70 to-transparent">
                    <ChevronRight className="w-4 h-4 text-bougie-taupe/70 mr-0.5 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {isLoadingSlots ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))
                ) : availableSlots.length > 0 ? (
                  availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedTime === time ? "border-bougie-espresso bg-bougie-espresso text-bougie-cream" : "border-bougie-espresso/10 hover:border-bougie-champagne"
                      }`}
                    >
                      {formatSlotLabel(time)}
                    </button>
                  ))
                ) : (
                  <p className="col-span-full text-center text-bougie-taupe/70 py-8">No slots available for this date.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Client Details */}
          {currentStep === "details" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-serif text-bougie-espresso mb-2">Your Information</h2>
                <p className="text-sm sm:text-base text-bougie-taupe">We'll use this to confirm your booking and reach you.</p>
              </div>
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={clientData.name}
                    onChange={(e) => setClientData({...clientData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="relative flex items-stretch">
                    <div className="flex items-center gap-1.5 pl-4 pr-3 rounded-l-xl border border-r-0 bg-bougie-cream text-bougie-taupe font-bold text-sm">
                      <Phone className="w-4 h-4 text-bougie-taupe/50" />
                      +44
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={clientData.phone}
                      onChange={(e) => setClientData({...clientData, phone: e.target.value.replace(/\D/g, "")})}
                      className="w-full pl-3 pr-4 py-3 rounded-r-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                      placeholder="07770 375859 or 7770375859"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (optional)</label>
                  <input
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData({...clientData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-bougie-espresso outline-none"
                    placeholder="you@example.com"
                  />
                  <p className="text-xs text-bougie-taupe/70">Get your booking details and a reminder by email, plus one-click access to your portal.</p>
                </div>

              </div>
            </div>
          )}

          {/* Step 4: Deposit & Policy */}
          {currentStep === "policy" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-serif text-bougie-espresso mb-2">Secure Your Slot</h2>
                <p className="text-sm sm:text-base text-bougie-taupe">A deposit secures your appointment — please review our policy below.</p>
              </div>

              <div className="bg-bougie-cream rounded-2xl p-5 sm:p-6 border border-dashed border-bougie-espresso/30">
                <div className="space-y-3">
                  <div className="pb-3 border-b border-bougie-espresso/20">
                    <span className="text-xs uppercase tracking-widest text-bougie-taupe/70 font-bold">Selected Services</span>
                  </div>
                  {selectedServices.map(s => (
                    <div key={s.id} className="flex justify-between text-sm gap-4">
                      <span className="text-bougie-taupe">{s.name}</span>
                      <span className="font-medium whitespace-nowrap">{formatServicePrice(s, currency)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-bougie-taupe">Date & Time</span>
                    <span className="font-medium">{format(selectedDate, "MMMM do")} at {selectedTime && formatSlotLabel(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-bold">Estimated Total</span>
                    <span className="font-bold">{totalLabel}</span>
                  </div>
                  <div className="flex justify-between text-bougie-champagne">
                    <span className="font-bold">Deposit Due (20%)</span>
                    <span className="font-bold">{depositEstimate()}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-bougie-pink/20 rounded-2xl border border-bougie-champagne/20 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-bougie-champagne">Send Your Deposit via Bank Transfer</p>
                {bankDetails ? (
                  <>
                    <p className="text-lg font-bold">{bankDetails}</p>
                    {bankAccountName && <p className="text-sm text-bougie-espresso/80">Account name: {bankAccountName}</p>}
                  </>
                ) : (
                  <p className="text-sm text-bougie-espresso/80">We'll share bank transfer details with you directly to confirm your deposit.</p>
                )}
                <p className="text-xs text-bougie-taupe pt-2">After booking, please send your deposit and keep your reference — our team will confirm it against your appointment.</p>
              </div>

              <div className="max-h-40 overflow-y-auto p-4 rounded-xl border bg-white text-xs text-bougie-taupe leading-relaxed whitespace-pre-line">
                {bookingPolicy}
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-bougie-espresso/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded accent-bougie-champagne flex-shrink-0"
                />
                <span className="text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-bougie-champagne flex-shrink-0" />
                  I have read and agree to the booking policy above.
                </span>
              </label>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 sm:mt-12 flex items-center justify-between md:relative fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/90 backdrop-blur-xl border-t md:border-none md:bg-transparent md:p-0 z-40 pb-safe gap-3">
            {stepIndex === 0 ? (
              <Link
                href="/"
                aria-label="Back to home"
                className="flex items-center gap-2 text-bougie-taupe font-medium hover:text-bougie-espresso transition-colors flex-shrink-0 bg-bougie-espresso/5 sm:bg-transparent rounded-full sm:rounded-none w-11 h-11 sm:w-auto sm:h-auto justify-center"
              >
                <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back to Home</span>
              </Link>
            ) : (
              <button
                onClick={handleBack}
                aria-label="Back"
                className="flex items-center gap-2 text-bougie-taupe font-medium hover:text-bougie-espresso transition-colors flex-shrink-0 bg-bougie-espresso/5 sm:bg-transparent rounded-full sm:rounded-none w-11 h-11 sm:w-auto sm:h-auto justify-center"
              >
                <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {currentStep === "service" && selectedServices.length > 0 && (
              <div className="hidden sm:flex flex-col items-end mr-auto ml-4 text-right">
                <span className="text-xs text-bougie-taupe/70">{selectedServices.length} selected • {totalDuration} mins</span>
                <span className="text-lg font-serif font-bold text-bougie-champagne">{totalLabel}</span>
              </div>
            )}

            <Button
              size="lg"
              className="flex-1 sm:flex-none ml-auto sm:ml-4 h-14 sm:h-12 font-bold text-base sm:text-lg"
              onClick={handleNext}
              disabled={
                isSubmitting ||
                (currentStep === "service" && selectedServices.length === 0) ||
                (currentStep === "datetime" && !selectedTime) ||
                (currentStep === "details" && (!clientData.name || clientData.phone.replace(/\D/g, "").length < 9)) ||
                (currentStep === "policy" && !agreedToPolicy)
              }
            >
              {isSubmitting
                ? "Confirming..."
                : currentStep === "policy"
                ? "Confirm Booking"
                : currentStep === "details" && !needsPolicyStep
                ? "Confirm Booking"
                : currentStep === "service" && selectedServices.length > 0
                ? `Continue • ${totalLabel}`
                : "Continue"}
              {!isSubmitting && !(currentStep === "policy" || (currentStep === "details" && !needsPolicyStep)) && <ChevronRight className="w-5 h-5 ml-2 flex-shrink-0" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
