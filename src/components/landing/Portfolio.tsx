"use client";

import { useState, useEffect } from "react";
import { Play, Maximize2, XCircle } from "lucide-react";

export function Portfolio() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portfolio").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setItems(data);
    });
  }, []);

  const categories = ["All", ...new Set(items.map(item => item.category))];
  const filteredItems = filter === "All" ? items : items.filter(i => i.category === filter);

  return (
    <>
    <section className="py-24 bg-zinc-50" id="portfolio">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-2 block tracking-widest">Our Artistry</span>
            <h2 className="text-5xl md:text-6xl font-serif text-brand-primary mb-4 leading-tight">The Showcase</h2>
            <p className="text-zinc-500 max-w-sm">A curated collection of professional transformations and technical excellence.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-500 backdrop-blur-sm ${
                  filter === cat 
                  ? "bg-brand-primary text-brand-secondary shadow-2xl shadow-brand-primary/30 scale-105" 
                  : "bg-white border border-zinc-100 text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredItems.length > 0 ? filteredItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedImage(item.imageUrl)}
              className="group relative aspect-[4/5] rounded-[40px] overflow-hidden cursor-pointer bg-white shadow-sm hover:shadow-2xl transition-all duration-700"
            >
              {item.imageUrl.includes('.mp4') ? (
                <video 
                  src={item.imageUrl} 
                  muted 
                  loop 
                  autoPlay 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              )}
              
              <div className="absolute inset-x-4 bottom-4 p-8 rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center text-center text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] mb-3 text-brand-secondary font-bold">{item.category}</span>
                <h4 className="text-2xl font-serif mb-2">{item.title}</h4>
                <div className="w-8 h-[1px] bg-white/40 mb-4" />
                <div className="flex gap-4">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setSelectedImage(item.imageUrl);
                     }}
                     className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                   >
                      <Maximize2 className="w-4 h-4" />
                   </button>
                </div>
              </div>

              {/* Media Type Badge */}
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {item.imageUrl.includes('.mp4') ? <Play className="w-4 h-4 text-white fill-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-[40px] text-zinc-400 font-serif italic">
              Your artistic showcase will appear here.
            </div>
          )}
        </div>
      </div>
    </section>
    
    {/* Lightbox Overlay */}
    {selectedImage && (
      <div 
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-fade-in"
        onClick={() => setSelectedImage(null)}
      >
        <button 
          className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
          onClick={() => setSelectedImage(null)}
        >
          <XCircle className="w-10 h-10" />
        </button>
        <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center">
          {selectedImage.includes('.mp4') ? (
            <video 
              src={selectedImage} 
              controls 
              autoPlay 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
            />
          ) : (
            <img 
              src={selectedImage} 
              alt="Zoomed Portfolio" 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
          )}
        </div>
      </div>
    )}
    </>
  );
}
