"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, Users, Settings, Scissors, Home, Command } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { name: "Dashboard", icon: Home, link: "/admin" },
    { name: "Appointments", icon: Calendar, link: "/admin/appointments" },
    { name: "Services", icon: Scissors, link: "/admin/services" },
    { name: "Clients", icon: Users, link: "/admin/clients" },
    { name: "Settings", icon: Settings, link: "/admin/settings" },
  ];

  const filteredActions = actions.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === "Enter" && filteredActions[selectedIndex]) {
        e.preventDefault();
        router.push(filteredActions[selectedIndex].link);
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, router]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-6 animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-zinc-100 flex items-center gap-4">
          <Search className="w-5 h-5 text-zinc-400" />
          <input 
            autoFocus
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-zinc-900 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="px-2 py-1 bg-zinc-100 rounded-lg flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {filteredActions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                router.push(action.link);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group text-left ${i === selectedIndex ? 'bg-brand-primary text-white' : 'hover:bg-zinc-50'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${i === selectedIndex ? 'bg-white/20' : 'bg-zinc-50'}`}>
                <action.icon className={`w-5 h-5 transition-colors ${i === selectedIndex ? 'text-white' : 'text-zinc-500'}`} />
              </div>
              <span className={`font-medium transition-colors ${i === selectedIndex ? 'text-white' : 'text-zinc-700'}`}>{action.name}</span>
            </button>
          ))}
          {filteredActions.length === 0 && (
            <div className="p-8 text-center text-zinc-400 font-serif italic">
              No matching commands found.
            </div>
          )}
        </div>
        
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
           <div className="flex gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
           </div>
           <span>ESC to Close</span>
        </div>
      </div>
    </div>
  );
}
