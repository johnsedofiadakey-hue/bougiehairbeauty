"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, MoreVertical } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { generateInvoiceSummary } from "@/lib/invoice";
import { CalendarGrid } from "@/components/admin/CalendarGrid";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [currency, setCurrency] = useState("£");
  const [companyName, setCompanyName] = useState("Bougie Hair & Beauty");
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "true";

  useEffect(() => {
    if (isNew) {
      alert("Redirecting to Admin Booking Flow...");
      window.location.href = "/booking?admin=true";
    }
  }, [isNew]);

  useEffect(() => {
    fetch("/api/bookings")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAppointments(data);
      });

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.currencySymbol) setCurrency(data.currencySymbol);
        if (data.companyName) setCompanyName(data.companyName);
      });
  }, []);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Permanently delete this appointment? This cannot be undone.")) return;
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-serif text-bougie-espresso">Appointment Book</h3>
          <p className="text-bougie-espresso/60">Manage your daily schedule and confirm client arrivals.</p>
        </div>
        <div className="flex bg-bougie-cream drop-shadow-sm p-1 rounded-xl">
          <button 
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-white shadow-sm text-bougie-espresso' : 'text-bougie-espresso/60'}`}
          >
            List View
          </button>
          <button 
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-bougie-espresso' : 'text-bougie-espresso/60'}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[640px]">
          <thead className="bg-bougie-cream border-b">
            <tr className="text-xs uppercase tracking-widest text-bougie-espresso/60">
              <th className="px-8 py-4 font-bold">Client & Service</th>
              <th className="px-8 py-4 font-bold">Time</th>
              <th className="px-8 py-4 font-bold">Status</th>
              <th className="px-8 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {appointments.length > 0 ? appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-bougie-cream transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bougie-cream/50 flex items-center justify-center text-bougie-espresso">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{apt.client?.user?.name || 'Walk-in Client'}</p>
                      <p className="text-xs text-bougie-espresso">{apt.services?.map((s: any) => s.name).join(', ') || 'No services'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-bougie-espresso/50" />
                    <span>{new Date(apt.startTime).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 text-bougie-espresso/50 ml-2" />
                    <span>{new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    apt.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    'bg-bougie-cream drop-shadow-sm text-zinc-700'
                  }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    {apt.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => updateStatus(apt.id, 'COMPLETED')}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateStatus(apt.id, 'CANCELLED')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => setActiveInvoice(apt)}
                      className="px-3 py-2 text-[10px] font-bold uppercase bg-bougie-cream drop-shadow-sm rounded-lg hover:bg-zinc-200"
                    >
                      Invoice
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === apt.id ? null : apt.id)}
                        className="p-2 hover:bg-bougie-cream drop-shadow-sm rounded-lg text-bougie-espresso/50"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === apt.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-lg z-20 overflow-hidden min-w-[160px]">
                            {apt.status !== 'CANCELLED' && (
                              <button
                                onClick={() => { updateStatus(apt.id, 'CANCELLED'); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-bougie-cream text-zinc-700"
                              >
                                Cancel Appointment
                              </button>
                            )}
                            <button
                              onClick={() => deleteAppointment(apt.id)}
                              className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-red-50 text-red-600"
                            >
                              Delete Permanently
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-bougie-espresso/50 italic">
                  No appointments scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      ) : (
        <CalendarGrid
          appointments={appointments} 
          onSelect={(apt) => setActiveInvoice(apt)} 
        />
      )}

      {/* Invoice Modal Overlay */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setActiveInvoice(null)}
              className="absolute top-8 right-8 p-2 hover:bg-bougie-cream drop-shadow-sm rounded-full"
            >
              <XCircle className="w-6 h-6 text-bougie-espresso/50" />
            </button>
            <div className="mb-8">
              <h4 className="text-2xl font-serif text-bougie-espresso">Billing Summary</h4>
              <p className="text-bougie-espresso/60 text-sm">Receipt for session #${activeInvoice.id.slice(-6)}</p>
            </div>
            <pre className="bg-bougie-cream p-8 rounded-3xl font-mono text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap border border-dashed">
              {generateInvoiceSummary({
                invoiceNumber: `INV-${activeInvoice.id.slice(-6).toUpperCase()}`,
                date: new Date(activeInvoice.startTime).toLocaleDateString(),
                clientName: activeInvoice.client?.user?.name || "Valued Client",
                serviceName: activeInvoice.services?.map((s: any) => s.name).join(', ') || "Studio Service",
                amount: activeInvoice.totalPrice,
                companyName: companyName,
                currencySymbol: currency
              })}
            </pre>
            <div className="mt-8 flex gap-4">
               <Button className="flex-1 h-14 rounded-2xl" onClick={() => window.print()}>Print Invoice</Button>
               <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setActiveInvoice(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
