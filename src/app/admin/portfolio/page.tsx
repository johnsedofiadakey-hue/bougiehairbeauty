"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Plus, Pencil, Trash2, Tag } from "lucide-react";

const EMPTY_ITEM = { title: "", category: "Bridal", imageUrl: "" };

export default function AdminPortfolio() {
  const [items, setItems] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState(EMPTY_ITEM);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/portfolio").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setItems(data);
    });
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormState(EMPTY_ITEM);
    setIsOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setFormState({ title: item.title || "", category: item.category || "Bridal", imageUrl: item.imageUrl || "" });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const res = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...formState })
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(items.map(i => i.id === editingId ? updated : i));
        setIsOpen(false);
      }
    } else {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      if (res.ok) {
        const added = await res.json();
        setItems([added, ...items]);
        setIsOpen(false);
      }
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const res = await fetch(`/api/portfolio?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-serif text-brand-primary">Transformation Gallery</h3>
          <p className="text-zinc-500">Manage the visual showcase of your professional work.</p>
        </div>
        <Button onClick={openAdd} className="gap-2 shadow-xl shadow-brand-primary/20">
          <Plus className="w-4 h-4" /> Add Transformation
        </Button>
      </div>

      {isOpen && (
        <div className="bg-white p-10 rounded-[40px] border shadow-2xl animate-in fade-in slide-in-from-top-6">
          <h4 className="text-xl font-bold mb-8 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-brand-accent" /> {editingId ? "Edit Showcase Item" : "New Showcase Item"}
          </h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Project Title</label>
              <input
                value={formState.title}
                onChange={e => setFormState({...formState, title: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border focus:ring-2 focus:ring-brand-primary outline-none"
                placeholder="e.g. Platinum Balayage"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Category</label>
              <select
                value={formState.category}
                onChange={e => setFormState({...formState, category: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border focus:ring-2 focus:ring-brand-primary outline-none bg-white"
              >
                <option>Bridal</option>
                <option>Coloring</option>
                <option>Treatments</option>
                <option>Nail Art</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">Media (Image/Video)</label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={uploadFile}
                  className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer"
                  required={!editingId && !formState.imageUrl}
                />
                {uploading && <p className="text-[10px] text-brand-primary animate-pulse">Uploading...</p>}
                {formState.imageUrl && <p className="text-[10px] text-emerald-600 truncate">Uploaded: {formState.imageUrl}</p>}
              </div>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-2xl px-8">Cancel</Button>
              <Button type="submit" className="rounded-2xl px-12">{editingId ? "Save Changes" : "Publish to Gallery"}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-[32px] overflow-hidden border hover:shadow-2xl transition-all duration-500">
            <div className="aspect-square relative overflow-hidden">
               <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => openEdit(item)}
                    className="w-12 h-12 rounded-full bg-white text-zinc-700 flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3 h-3 text-brand-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">{item.category}</span>
              </div>
              <h4 className="text-lg font-bold">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
