import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UK mobile numbers are 10 digits after the leading 0 (e.g. 07770 375859),
// or the same 10 digits with no leading 0 (7770375859). Accepts either and
// returns "44XXXXXXXXXX" so phone numbers are stored consistently
// regardless of how the client typed it into the "+44" prefixed input.
export function normalizeUKPhone(localInput: string): string {
  const digits = localInput.replace(/\D/g, "");
  if (digits.startsWith("44")) return digits;
  if (digits.startsWith("0")) return "44" + digits.slice(1);
  return "44" + digits;
}

// Strips a 44/0 prefix so a previously-normalized number can be re-shown
// in a "+44"-prefixed input as just the local digits.
export function stripUKPrefix(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("44")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

// Formats an "HH:mm" 24-hour slot string (as returned by
// /api/bookings/available) into a 12-hour "h:mm AM/PM" display string.
export function formatSlotLabel(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteStr} ${period}`;
}

// Displays a service's price as either a fixed amount ("£200") or, when
// priceMax is set, a range ("£100-250"). Booking totals always sum the
// base `price` (the low end of a range) — see formatTotalPrice below.
export function formatServicePrice(service: { price: number; priceMax?: number }, currency: string): string {
  if (service.priceMax && service.priceMax > service.price) {
    return `${currency}${service.price}-${service.priceMax}`;
  }
  return `${currency}${service.price}`;
}

// Sums a cart's base prices, and — if any selected service has a price
// range — also sums the high end, so the total is shown as a range too
// (e.g. "£450 - £700") rather than silently collapsing to just the low
// estimate.
export function formatTotalPrice(services: Array<{ price: number; priceMax?: number }>, currency: string): string {
  const min = services.reduce((sum, s) => sum + s.price, 0);
  const max = services.reduce((sum, s) => sum + (s.priceMax && s.priceMax > s.price ? s.priceMax : s.price), 0);
  return max > min ? `${currency}${min} - ${currency}${max}` : `${currency}${min}`;
}
