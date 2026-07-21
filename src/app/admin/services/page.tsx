"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatServicePrice } from "@/lib/utils";
import { ServiceCategoryIcon } from "@/components/landing/ServiceCategoryIcon";

const EMPTY_SERVICE = { name: "", price: "", priceMax: "", duration: "", category: "", description: "", imageUrl: "" };

export default function AdminServices() {
  const [formState, setFormState] = useState(EMPTY_SERVICE);
  const [services, setServices] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currency, setCurrency] = useState("£");

  useEffect(() => {
    fetch("/api/services").then(res => res.json()).then(data => setServices(data));
    fetch("/api/settings").then(res => res.json()).then(data => {
      if (data.currencySymbol) setCurrency(data.currencySymbol);
    });
  }, []);

  const categories = Array.from(new Set(services.map((s) => s.category || "Other")));

  const openAdd = () => {
    setEditingId(null);
    setFormState(EMPTY_SERVICE);
    setIsOpen(true);
  };

  const openEdit = (service: any) => {
    setEditingId(service.id);
    setFormState({
      name: service.name || "",
      price: String(service.price ?? ""),
      priceMax: service.priceMax !== undefined && service.priceMax !== null ? String(service.priceMax) : "",
      duration: String(service.duration ?? ""),
      category: service.category || "",
      description: service.description || "",
      imageUrl: service.image || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formState,
      price: parseFloat(formState.price),
      priceMax: formState.priceMax ? parseFloat(formState.priceMax) : "",
      duration: parseInt(formState.duration),
    };

    if (editingId) {
      const res = await fetch("/api/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload })
      });
      if (res.ok) {
        const updated = await res.json();
        setServices(services.map(s => s.id === editingId ? updated : s));
        setIsOpen(false);
      }
    } else {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const added = await res.json();
        setServices([...services, added]);
        setIsOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFormState({ ...formState, imageUrl: data.url });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-serif text-brand-primary">Service Menu</h3>
          <p className="text-zinc-500">Define your treatments and their professional pricing.</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {isOpen && (
        <div className="bg-white p-8 rounded-3xl border shadow-lg animate-in fade-in slide-in-from-top-4">
          <h4 className="text-xl font-bold mb-6">{editingId ? "Edit Treatment" : "New Treatment"}</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Name</label>
              <input
                value={formState.name || ""}
                onChange={e => setFormState({...formState, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
                placeholder="e.g. Classic Lashes"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Category</label>
              <input
                value={formState.category || ""}
                onChange={e => setFormState({...formState, category: e.target.value})}
                list="service-categories"
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
                placeholder="e.g. Waxing, Lashes, Brows..."
                required
              />
              <datalist id="service-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Price ({currency})</label>
              <input
                type="number"
                value={formState.price || ""}
                onChange={e => setFormState({...formState, price: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Max Price (optional, for a range)</label>
              <input
                type="number"
                value={formState.priceMax || ""}
                onChange={e => setFormState({...formState, priceMax: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
                placeholder="Leave blank for a fixed price"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Duration (min)</label>
              <input
                type="number"
                value={formState.duration || ""}
                onChange={e => setFormState({...formState, duration: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
                placeholder="60"
                required
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Description</label>
              <textarea
                value={formState.description || ""}
                onChange={e => setFormState({...formState, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none h-12"
                placeholder="Brief description of the service..."
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Upload Service Image (optional)</label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadFile}
                  className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer"
                />
                {formState.imageUrl && <p className="text-[10px] text-zinc-400 truncate">Uploaded: {formState.imageUrl}</p>}
              </div>
            </div>
            <div className="flex items-end gap-2 md:col-span-4">
              <Button type="submit" className="flex-1 h-[50px]">{editingId ? "Save Changes" : "Save Treatment"}</Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-[50px]">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <ServiceCategoryIcon category={category} className="w-5 h-5 text-brand-primary" />
            <h4 className="text-lg font-bold text-brand-primary">{category}</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter((s) => (s.category || "Other") === category).map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-3xl border hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-secondary/50 flex items-center justify-center text-brand-primary">
                    <ServiceCategoryIcon category={service.category} className="w-6 h-6" />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(service)}
                      className="text-zinc-300 hover:text-brand-primary transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-bold">{service.name}</h4>
                <p className="text-zinc-500 text-sm mb-6">{service.duration} mins</p>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                  <span className="text-xl font-bold text-brand-primary">{formatServicePrice(service, currency)}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
