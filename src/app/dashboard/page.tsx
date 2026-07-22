"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CreditCard, FileText, Scissors, User as UserIcon, History as TreatmentHistory, ArrowLeft, XCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function ClientDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"appointments" | "invoices" | "timeline">("appointments");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("£");

  useEffect(() => {
    fetch("/api/client/dashboard")
      .then(res => res.json())
      .then(d => {
        if (!d.error) {
          setData(d);
        } else {
          router.push("/portal");
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/portal");
        setLoading(false);
      });

    fetch("/api/settings")
      .then(res => res.json())
      .then(d => {
        if (d.currencySymbol) setCurrency(d.currencySymbol);
      });
  }, [router]);

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center">Refining your profile...</div>;
  if (!data) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center">Redirecting you to the portal...</div>;

  const { profile, appointments, formulations } = data;

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-brand-primary transition-colors text-xs font-bold uppercase tracking-widest mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Website
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 mb-8 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
            <div className="w-24 h-24 rounded-full bg-brand-secondary/50 flex items-center justify-center text-brand-primary border-4 border-white shadow-xl">
              <UserIcon className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-serif text-[#1A1A1A]">{profile.name}</h2>
              <p className="text-zinc-500">{profile.email} • Member since {new Date(profile.createdAt).getFullYear()}</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => router.push("/booking")}
               className="px-6 py-3 bg-brand-primary text-white rounded-xl shadow-lg hover:scale-105 transition-transform font-medium"
             >
               Book New Service
             </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Navigation */}
          <div className="w-64 hidden lg:flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'appointments' ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-white text-zinc-500'}`}
            >
              <Calendar className="w-5 h-5" /> Appointments
            </button>
            <button 
              onClick={() => setActiveTab("invoices")}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'invoices' ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-white text-zinc-500'}`}
            >
              <FileText className="w-5 h-5" /> Digital Receipts
            </button>
            <button 
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'timeline' ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-white text-zinc-500'}`}
            >
              <TreatmentHistory className="w-5 h-5" /> My History
            </button>
            <div className="mt-auto pt-8">
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl transition-all w-full text-red-400 hover:bg-red-50 hover:text-red-600 font-bold"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-6">
            {activeTab === "appointments" && (
              <div className="bg-white rounded-3xl p-8 border shadow-sm">
                <h3 className="text-xl font-bold mb-6">Upcoming Sessions</h3>
                <div className="space-y-4">
                  {appointments.filter((a: any) => a.status === 'PENDING' || a.status === 'CONFIRMED').map((apt: any) => (
                    <div key={apt.id} className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border bg-zinc-50 hover:border-brand-accent transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                          <Scissors className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold">{apt.services.map((s: any) => s.name).join(', ') || 'Unnamed Service'}</p>
                          <p className="text-xs text-zinc-500 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> {new Date(apt.startTime).toLocaleDateString()} • <Clock className="w-3 h-3" /> {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                           <p className="text-sm font-bold">{currency}{apt.totalPrice.toFixed(2)}</p>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
                            apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-secondary/50 text-brand-primary'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {appointments.filter((a: any) => a.status === 'PENDING' || a.status === 'CONFIRMED').length === 0 && (
                    <p className="text-center py-12 text-zinc-400 italic">No upcoming appointments. Ready for a new look?</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="bg-white rounded-3xl p-8 border shadow-sm">
                <h3 className="text-xl font-bold mb-6">Historical Log & Formulations</h3>
                <div className="space-y-8">
                  {formulations.map((form: any) => (
                    <div key={form.id} className="relative pl-12 border-l-2 border-zinc-100 pb-8 last:pb-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-accent border-2 border-white shadow-sm" />
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{new Date(form.createdAt).toLocaleDateString()}</p>
                      <h4 className="font-bold text-lg mb-2">{form.title}</h4>
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-dashed text-sm text-zinc-600 mb-4">
                        {form.description}
                      </div>
                      
                      {(form.beforeImage || form.afterImage) && (
                        <div className="flex gap-4">
                           {form.beforeImage && (
                             <div className="relative group cursor-pointer" onClick={() => setSelectedImage(form.beforeImage)}>
                                <div className="w-32 h-32 rounded-2xl bg-zinc-100 overflow-hidden border-2 border-white shadow-md">
                                   <img src={form.beforeImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Before" />
                                </div>
                                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] px-2 py-0.5 rounded-full font-bold uppercase">Before</span>
                             </div>
                           )}
                           {form.afterImage && (
                             <div className="relative group cursor-pointer" onClick={() => setSelectedImage(form.afterImage)}>
                                <div className="w-32 h-32 rounded-2xl bg-zinc-100 overflow-hidden border-2 border-brand-accent shadow-md">
                                   <img src={form.afterImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="After" />
                                </div>
                                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-accent text-white text-[8px] px-2 py-0.5 rounded-full font-bold uppercase">After</span>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  ))}
                  {formulations.length === 0 && (
                    <div className="text-center py-12">
                       <TreatmentHistory className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                       <p className="text-zinc-400 italic">Your transformation notes will appear here after your sessions.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="bg-white rounded-3xl p-8 border shadow-sm">
                <h3 className="text-xl font-bold mb-6">Past Receipts</h3>
                <div className="space-y-4">
                   {appointments.filter((a: any) => a.status === 'COMPLETED').map((apt: any) => (
                     <div key={apt.id} className="flex items-center justify-between p-6 rounded-2xl border bg-zinc-50 hover:bg-zinc-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <FileText className="w-6 h-6 text-brand-primary" />
                          <div>
                            <p className="font-bold">#{apt.id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-zinc-500">{new Date(apt.startTime).toLocaleDateString()} • {apt.services.map((s: any) => s.name).join(', ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <p className="font-bold text-sm">{currency}{apt.totalPrice.toFixed(2)}</p>
                           <button className="text-brand-primary font-bold text-xs hover:underline uppercase tracking-widest">Receipt</button>
                        </div>
                     </div>
                   ))}
                   {appointments.filter((a: any) => a.status === 'COMPLETED').length === 0 && (
                    <p className="text-center py-12 text-zinc-400 italic">No completed sessions found.</p>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors">
            <XCircle className="w-10 h-10" />
          </button>
          <div className="relative max-w-4xl max-h-[80vh] w-full">
            <img 
              src={selectedImage} 
              className="w-full h-full object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300" 
              alt="Zoomed transformation" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
