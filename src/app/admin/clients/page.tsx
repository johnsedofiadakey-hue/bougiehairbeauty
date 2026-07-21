"use client";

import { useState, useEffect } from "react";
import { Search, User as UserIcon, History, FlaskConical, MessageSquare, Pencil, Loader2, X, ArrowLeft } from "lucide-react";

export default function ClientVault() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("£");
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setLoading(false);
      });
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.currencySymbol) setCurrency(data.currencySymbol);
      });
  }, []);

  const filteredClients = clients.filter((client) => {
    const query = search.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query)
    );
  });

  const openEdit = () => {
    if (!selectedClient) return;
    setEditForm({ name: selectedClient.name || "", phone: selectedClient.phone || "", notes: selectedClient.notes || "" });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedClient.id, ...editForm })
      });
      if (res.ok) {
        const updated = await res.json();
        const merged = { ...selectedClient, ...updated };
        setSelectedClient(merged);
        setClients(clients.map(c => c.id === merged.id ? { ...c, ...merged } : c));
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const whatsappHref = selectedClient?.phone
    ? `https://wa.me/${selectedClient.phone.replace(/[^\d]/g, "")}`
    : undefined;

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  const detailPanelClasses = selectedClient
    ? "fixed inset-0 z-50 p-4 md:p-0 md:static md:z-auto md:w-[450px] md:translate-x-0 md:opacity-100 translate-x-0 opacity-100"
    : "hidden md:block md:w-[450px] md:absolute md:right-0 md:translate-x-full md:opacity-0";

  return (
    <div className="relative flex h-[calc(100vh-12rem)] gap-4 md:gap-8">
      {/* Client List */}
      <div className={`flex-1 bg-white rounded-3xl shadow-sm border overflow-hidden flex-col ${selectedClient ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b bg-zinc-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left min-w-[560px]">
            <thead className="bg-zinc-50 border-b sticky top-0">
              <tr className="text-xs uppercase tracking-widest text-zinc-500">
                <th className="px-8 py-4 font-bold">Client Name</th>
                <th className="px-8 py-4 font-bold">Last Visit</th>
                <th className="px-8 py-4 font-bold">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-brand-primary/5' : 'hover:bg-zinc-50'}`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">{client.name}</p>
                        <p className="text-xs text-zinc-500">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm">{client.lastVisit}</td>
                  <td className="px-8 py-6 text-sm font-medium">{currency}{client.totalSpent.toFixed(2)}</td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-zinc-400 italic">No clients match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Detail Side Panel */}
      <div className={`w-full transition-all duration-500 ${detailPanelClasses}`}>
        <div className="bg-white rounded-3xl shadow-xl border h-full overflow-y-auto p-6 md:p-8">
          {selectedClient ? (
            <div className="space-y-10">
              <button
                onClick={() => setSelectedClient(null)}
                className="md:hidden flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-brand-primary"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Clients
              </button>
              {/* Profile Header */}
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-brand-secondary/50 mx-auto mb-4 flex items-center justify-center text-brand-primary border-4 border-white shadow-lg">
                  <UserIcon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif">{selectedClient.name}</h3>
                <p className="text-zinc-500 mb-6">{selectedClient.phone}</p>
                <div className="flex gap-2 justify-center">
                   <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!whatsappHref}
                      className={`p-3 rounded-xl shadow-lg transition-transform ${whatsappHref ? 'bg-brand-primary text-white hover:scale-105' : 'bg-zinc-200 text-zinc-400 pointer-events-none'}`}
                   >
                      <MessageSquare className="w-5 h-5" />
                   </a>
                   <button onClick={openEdit} className="px-4 p-3 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2 text-sm font-medium">
                      <Pencil className="w-4 h-4" /> Edit Profile
                   </button>
                </div>
              </div>

              {/* History Tabs */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <FlaskConical className="w-5 h-5 text-brand-primary" />
                  <h4 className="font-bold">Formulation Vault</h4>
                </div>
                <div className="space-y-4">
                   {selectedClient.formulations?.map((f: any) => (
                     <div key={f.id} className="p-5 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-sm">{f.title}</p>
                          <span className="text-[10px] text-zinc-400">{f.date}</span>
                        </div>
                        <p className="text-xs font-mono text-zinc-600 break-words">{f.mix}</p>
                     </div>
                   ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <History className="w-5 h-5 text-brand-primary" />
                  <h4 className="font-bold">Service History</h4>
                </div>
                <div className="space-y-4">
                   {selectedClient.history?.map((h: any) => (
                     <div key={h.id} className="flex gap-4">
                        <div className="w-[2px] bg-zinc-100 relative">
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-accent" />
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-bold">{h.service}</p>
                            <span className="text-xs text-zinc-400">{h.date}</span>
                          </div>
                          <p className="text-xs text-zinc-500 italic mb-2">"{h.notes}"</p>
                          <p className="text-xs font-bold text-brand-primary">{currency}{h.amount.toFixed(2)}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center">
              <UserIcon className="w-16 h-16 mb-4 opacity-10" />
              <p>Select a client to view their vault</p>
            </div>
          )}
        </div>
      </div>

      {isEditing && selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setIsEditing(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsEditing(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
            <h4 className="text-xl font-bold mb-6">Edit Client Profile</h4>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-400">Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-400">Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-400">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border h-24 focus:ring-2 focus:ring-brand-primary outline-none"
                  placeholder="Preferences, allergies, notes..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-medium disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
