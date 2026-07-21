"use client";

import { format, startOfWeek, addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import { User, Clock } from "lucide-react";

export function CalendarGrid({ appointments, onSelect }: { appointments: any[], onSelect: (apt: any) => void }) {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 10 }).map((_, i) => i + 9); // 9 AM to 6 PM

  const getAptsForSlot = (day: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.startTime);
      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    });
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border p-8 overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Header Row */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b pb-6 mb-2">
          <div />
          {days.map(day => (
            <div key={day.toString()} className="text-center">
              <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest mb-1">{format(day, 'EEE')}</p>
              <p className={`text-lg font-serif ${isSameDay(day, new Date()) ? 'text-brand-primary font-bold underline decoration-brand-accent decoration-2 underline-offset-4' : 'text-zinc-600'}`}>
                {format(day, 'dd')}
              </p>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-zinc-50 h-24 group">
              <div className="flex items-center justify-center text-[10px] font-bold text-zinc-300 group-hover:text-brand-primary transition-colors">
                {format(new Date().setHours(hour, 0), 'h:mm a')}
              </div>
              {days.map(day => {
                const slotApts = getAptsForSlot(day, hour);
                return (
                  <div key={day.toString() + hour} className="border-l border-zinc-50 relative p-1 group/slot hover:bg-zinc-50/50 transition-colors">
                    {slotApts.map(apt => (
                      <div 
                        key={apt.id}
                        onClick={() => onSelect(apt)}
                        className={`absolute inset-1 rounded-2xl border p-2 shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:z-10 group/apt ${
                          apt.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                          apt.status === 'PENDING' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                          'bg-brand-primary/5 text-brand-primary/20 text-brand-primary'
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <User className="w-2.5 h-2.5" />
                          <p className="text-[9px] font-bold truncate">{apt.client?.user?.name || 'Client'}</p>
                        </div>
                        <p className="text-[8px] opacity-70 truncate">{apt.services?.map((s: any) => s.name).join(', ')}</p>
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover/apt:opacity-100 transition-opacity">
                           <Clock className="w-3 h-3 text-brand-primary/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
