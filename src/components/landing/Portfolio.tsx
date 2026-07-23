"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Maximize2, XCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

function ParallaxCard({ item, setSelectedImage, index }: { item: any, setSelectedImage: (url: string) => void, index: number }) {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  // Parallax effect: middle column moves slightly up, right column moves slightly down relative to scroll
  const yOffset = (index % 3 === 1) ? 40 : (index % 3 === 2) ? -40 : 0;
  const y = useTransform(scrollYProgress, [0, 1], [yOffset, -yOffset]);

  const itemVariant = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <motion.div
      variants={itemVariant}
      ref={cardRef}
      style={{ y }}
      onClick={() => setSelectedImage(item.imageUrl)}
      className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer bg-luxe-plum/10 shadow-sm hover:shadow-2xl hover:shadow-luxe-dark/10 transition-all duration-700 border border-luxe-dark/5"
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
      
      <div className="absolute inset-x-4 bottom-4 p-8 rounded-2xl bg-luxe-blush/80 backdrop-blur-md border border-luxe-dark/10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center text-center text-luxe-dark">
        <span className="text-[10px] uppercase tracking-[0.2em] mb-3 text-luxe-dark/70 font-bold">{item.category}</span>
        <h4 className="text-2xl font-serif mb-2">{item.title}</h4>
        <div className="w-8 h-[1px] bg-luxe-dark/20 mb-4" />
        <div className="flex gap-4">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               setSelectedImage(item.imageUrl);
             }}
             className="p-2 rounded-full bg-luxe-dark/5 hover:bg-luxe-dark/10 transition-colors text-luxe-dark"
           >
              <Maximize2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Media Type Badge */}
      <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-luxe-blush/80 backdrop-blur-md border border-luxe-dark/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {item.imageUrl.includes('.mp4') ? <Play className="w-4 h-4 text-luxe-dark fill-luxe-dark" /> : <div className="w-1.5 h-1.5 rounded-full bg-luxe-plum" />}
      </div>
    </motion.div>
  );
}

export function Portfolio({ hideCta = false }: { hideCta?: boolean } = {}) {
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

  if (items.length === 0) return null;

  const containerVariant = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const textVariant = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <>
    <section className="py-24 bg-luxe-blush overflow-hidden" id="portfolio">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariant}
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8"
        >
          <motion.div variants={textVariant}>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-luxe-plum mb-2 block tracking-widest">Our Artistry</span>
            <h2 className="text-5xl md:text-6xl font-serif text-luxe-dark mb-4 leading-tight">The Showcase</h2>
            <p className="text-luxe-dark/70 max-w-sm">A curated collection of professional transformations and technical excellence.</p>
          </motion.div>
          
          <motion.div variants={textVariant} className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-500 backdrop-blur-sm ${
                  filter === cat 
                  ? "bg-luxe-dark text-luxe-blush shadow-2xl shadow-luxe-dark/30 scale-105" 
                  : "bg-transparent border border-luxe-dark/20 text-luxe-dark/70 hover:text-luxe-dark hover:border-luxe-dark/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariant}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {filteredItems.map((item, index) => (
            <ParallaxCard key={item.id} item={item} setSelectedImage={setSelectedImage} index={index} />
          ))}
        </motion.div>

        {!hideCta && (
          <div className="mt-16 text-center">
            <Link href="/gallery">
              <button className="px-8 py-4 rounded-full border border-luxe-dark/20 text-sm font-sans font-medium text-luxe-dark hover:border-luxe-plum hover:text-luxe-plum hover:bg-luxe-plum/5 transition-all">
                View Full Gallery
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
    
    {/* Lightbox Overlay */}
    {selectedImage && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-luxe-dark/90 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
        onClick={() => setSelectedImage(null)}
      >
        <button 
          className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
          onClick={() => setSelectedImage(null)}
        >
          <XCircle className="w-10 h-10" />
        </button>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center"
        >
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
        </motion.div>
      </motion.div>
    )}
    </>
  );
}
