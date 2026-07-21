"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { ChevronRight, ChevronLeft, ChevronDown, Check, Clock, Phone, Banknote, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeUKPhone, formatSlotLabel, formatServicePrice, formatTotalPrice } from "@/lib/utils";
import { ServiceCategoryIcon } from "@/components/landing/ServiceCategoryIcon";

type Step = "service" | "datetime" | "details" | "policy";

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsAdmin(searchParams.get("admin") === "true");
    const requestedCategory = searchParams.get("category");
    setIsLoadingServices(true);
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setIsLoadingServices(false);
        if (Array.isArray(data) && data.length > 0) {
          const match = requestedCategory && data.find((s: any) => s.category === requestedCategory);
          setExpandedCategory(match ? requestedCategory : data[0].category);
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
        });
    }
  }, [selectedDate]);

  const needsPolicyStep = requireDeposit && !isAdmin;
  const steps: Step[] = needsPolicyStep ? ["service", "datetime", "details", "policy"] : ["service", "datetime", "details"];
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

  const handleNext = async () => {
    if (currentStep === "service") setCurrentStep("datetime");
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
      // Save phone to localStorage so they can auto-fill it when logging in
      if (typeof window !== "undefined") {
        localStorage.setItem("client_phone", normalizedPhone);
      }

      setIsSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E8B8B0', '#FFF9F6', '#D4AF37']
      });
    } else {
      const errorData = await res.json();
      alert(errorData.error || "Failed to confirm booking. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleBack = () => {
    if (currentStep === "datetime") setCurrentStep("service");
    else if (currentStep === "details") setCurrentStep("datetime");
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
    <div className="min-h-screen bg-zinc-50 pt-28 sm:pt-32 pb-28 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all text-sm ${
                  idx <= stepIndex ? "bg-brand-primary text-white" : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {idx < stepIndex ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 sm:w-24 h-[2px] mx-1.5 sm:mx-2 ${idx < stepIndex ? "bg-brand-primary" : "bg-zinc-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-12 shadow-xl border relative overflow-hidden">
          {/* Success Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 sm:p-12 text-center animate-in fade-in duration-500">
               <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500 delay-200">
                  <Check className="w-12 h-12 text-emerald-600" />
               </div>
               <h2 className="text-4xl font-serif text-brand-primary mb-4">Confirmed!</h2>
               <p className="text-lg text-zinc-600 mb-8">Your appointment for {selectedServices.length} service{selectedServices.length === 1 ? "" : "s"} has been secured. We'll see you soon!</p>
               <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                 <Link
                   href="/portal"
                   className="flex-1 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-brand-primary/20"
                 >
                   Access Your Portal
                 </Link>
                 <Link
                   href="/"
                   className="flex-1 px-8 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
                 >
                   Back to Home
                 </Link>
               </div>
            </div>
          )}

          {/* Step 1: Select Service */}
          {currentStep === "service" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-primary mb-2">Select Services</h2>
                <p className="text-sm sm:text-base text-zinc-500">Tap a category to see options. Choose as many as you like.</p>
              </div>

              {isLoadingServices ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => {
                    const items = servicesByCategory[category];
                    const cheapest = Math.min(...items.map((s) => s.price));
                    const selectedInCategory = items.filter((s) => selectedServices.find((sel) => sel.id === s.id)).length;
                    const isExpanded = expandedCategory === category;

                    return (
                      <div key={category} className={`rounded-2xl border-2 overflow-hidden transition-colors ${selectedInCategory > 0 ? "border-brand-primary/40" : "border-zinc-100"}`}>
                        <button
                          type="button"
                          onClick={() => setExpandedCategory(isExpanded ? null : category)}
                          className="w-full flex items-center gap-4 p-4 text-left"
                        >
                          <div className="w-11 h-11 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary flex-shrink-0">
                            <ServiceCategoryIcon category={category} className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold flex items-center gap-2">
                              {category}
                              {selectedInCategory > 0 && (
                                <span className="text-[10px] font-bold bg-brand-primary text-white px-2 py-0.5 rounded-full">{selectedInCategory}</span>
                              )}
                            </h4>
                            <p className="text-xs text-zinc-500">{items.length} option{items.length === 1 ? "" : "s"} • from {currency}{cheapest}</p>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        {isExpanded && (
                          <div className="border-t border-zinc-100 divide-y divide-zinc-50">
                            {items.map((service) => {
                              const isChecked = !!selectedServices.find((s) => s.id === service.id);
                              return (
                                <label
                                  key={service.id}
                                  className={`flex items-center gap-4 px-4 py-4 min-h-[56px] cursor-pointer transition-colors ${isChecked ? "bg-brand-primary/5" : "active:bg-zinc-50"}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleService(service)}
                                    className="w-5 h-5 rounded accent-brand-primary flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{service.name}</p>
                                    {service.description && <p className="text-xs text-zinc-400 mt-0.5">{service.description}</p>}
                                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {service.duration} mins
                                    </p>
                                  </div>
                                  <span className="font-bold text-brand-primary text-sm whitespace-nowrap">{formatServicePrice(service, currency)}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === "datetime" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-primary mb-2">Choose Time</h2>
                <p className="text-sm sm:text-base text-zinc-500">Select a slot for your {totalDuration} min session.</p>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {days.map((day) => (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center min-w-[70px] p-4 rounded-2xl border-2 transition-all ${
                      isSameDay(day, selectedDate) ? "border-brand-primary bg-brand-primary text-white" : "border-zinc-100"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold mb-1 opacity-60">{format(day, "EEE")}</span>
                    <span className="text-lg font-bold">{format(day, "d")}</span>
                  </button>
                ))}
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
                        selectedTime === time ? "border-brand-primary bg-brand-primary text-white" : "border-zinc-100 hover:border-brand-accent"
                      }`}
                    >
                      {formatSlotLabel(time)}
                    </button>
                  ))
                ) : (
                  <p className="col-span-full text-center text-zinc-400 py-8">No slots available for this date.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Client Details */}
          {currentStep === "details" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-primary mb-2">Your Information</h2>
                <p className="text-sm sm:text-base text-zinc-500">We'll use this to confirm your booking and reach you.</p>
              </div>
              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={clientData.name}
                    onChange={(e) => setClientData({...clientData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="relative flex items-stretch">
                    <div className="flex items-center gap-1.5 pl-4 pr-3 rounded-l-xl border border-r-0 bg-zinc-50 text-zinc-500 font-bold text-sm">
                      <Phone className="w-4 h-4 text-zinc-300" />
                      +44
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={clientData.phone}
                      onChange={(e) => setClientData({...clientData, phone: e.target.value.replace(/\D/g, "")})}
                      className="w-full pl-3 pr-4 py-3 rounded-r-xl border focus:ring-2 focus:ring-brand-primary outline-none"
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
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
                    placeholder="you@example.com"
                  />
                  <p className="text-xs text-zinc-400">Get your booking details and a reminder by email, plus one-click access to your portal.</p>
                </div>
                {!needsPolicyStep && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl text-emerald-800 text-sm">
                    <Banknote className="w-5 h-5 flex-shrink-0" />
                    <p>No online payment needed — pay by Mobile Money or cash when you arrive.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Deposit & Policy */}
          {currentStep === "policy" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-primary mb-2">Secure Your Slot</h2>
                <p className="text-sm sm:text-base text-zinc-500">A deposit secures your appointment — please review our policy below.</p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-5 sm:p-6 border border-dashed border-zinc-300">
                <div className="space-y-3">
                  <div className="pb-3 border-b border-zinc-200">
                    <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Selected Services</span>
                  </div>
                  {selectedServices.map(s => (
                    <div key={s.id} className="flex justify-between text-sm gap-4">
                      <span className="text-zinc-500">{s.name}</span>
                      <span className="font-medium whitespace-nowrap">{formatServicePrice(s, currency)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-zinc-500">Date & Time</span>
                    <span className="font-medium">{format(selectedDate, "MMMM do")} at {selectedTime && formatSlotLabel(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-bold">Estimated Total</span>
                    <span className="font-bold">{totalLabel}</span>
                  </div>
                  <div className="flex justify-between text-brand-primary">
                    <span className="font-bold">Deposit Due (20%)</span>
                    <span className="font-bold">{depositEstimate()}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/20 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-primary">Send Your Deposit via Bank Transfer</p>
                {bankDetails ? (
                  <>
                    <p className="text-lg font-bold">{bankDetails}</p>
                    {bankAccountName && <p className="text-sm text-zinc-600">Account name: {bankAccountName}</p>}
                  </>
                ) : (
                  <p className="text-sm text-zinc-600">We'll share bank transfer details with you directly to confirm your deposit.</p>
                )}
                <p className="text-xs text-zinc-500 pt-2">After booking, please send your deposit and keep your reference — our team will confirm it against your appointment.</p>
              </div>

              <div className="max-h-40 overflow-y-auto p-4 rounded-xl border bg-white text-xs text-zinc-500 leading-relaxed whitespace-pre-line">
                {bookingPolicy}
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-zinc-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded accent-brand-primary flex-shrink-0"
                />
                <span className="text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-primary flex-shrink-0" />
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
                className="flex items-center gap-2 text-zinc-500 font-medium hover:text-zinc-800 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back to Home</span>
              </Link>
            ) : (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-zinc-500 font-medium hover:text-zinc-800 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {currentStep === "service" && selectedServices.length > 0 && (
              <div className="hidden sm:flex flex-col items-end mr-auto ml-4 text-right">
                <span className="text-xs text-zinc-400">{selectedServices.length} selected • {totalDuration} mins</span>
                <span className="text-lg font-serif font-bold text-brand-primary">{totalLabel}</span>
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
