"use client";

import { MapPin, Phone, Instagram, Facebook } from "lucide-react";

export function TopBar({ settings }: { settings?: any }) {
  const address = settings?.address;
  const phone = settings?.contactPhone;
  const instagramUrl = settings?.instagramUrl;
  const facebookUrl = settings?.facebookUrl;
  const whatsappNumber = settings?.whatsappNumber;

  if (!address && !phone && !instagramUrl && !facebookUrl && !whatsappNumber) return null;

  return (
    <div className="bg-black text-white/70 text-xs">
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0 overflow-hidden">
          {address && (
            <span className="hidden sm:flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{address}</span>
            </span>
          )}
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-white transition-colors flex-shrink-0">
              <Phone className="w-3.5 h-3.5" />
              {phone}
            </a>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Instagram className="w-3.5 h-3.5" />
            </a>
          )}
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Facebook className="w-3.5 h-3.5" />
            </a>
          )}
          {whatsappNumber && (
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.15-1.35c1.46.8 3.1 1.22 4.89 1.22 5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.18c-1.56 0-3.09-.42-4.42-1.21l-.32-.19-3.06.8.82-2.98-.21-.31A8.14 8.14 0 0 1 3.86 12c0-4.5 3.66-8.16 8.18-8.16 4.5 0 8.16 3.66 8.16 8.16 0 4.5-3.66 8.18-8.16 8.18Zm4.47-6.13c-.24-.12-1.45-.72-1.67-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.35-1.68-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z"/></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
