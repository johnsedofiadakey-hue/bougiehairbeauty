"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    const particleCount = 40;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedX: number = 0;
      speedY: number = 0;
      opacity: number = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = -Math.random() * 0.4 - 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y < 0 || this.x < 0 || this.x > canvas!.width) {
          this.reset();
          this.y = canvas!.height;
        }
      }

      draw() {
        if (!ctx) return;
        // Signature Pink #E6127E
        ctx.fillStyle = `rgba(230, 18, 126, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animateCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animateCanvas);
    };
    animateCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />;
}

interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  whatsappNumber?: string;
  address?: string;
}

export function Hero({
  title,
  subtitle,
  backgroundImage,
}: HeroProps) {
  
  const [activeService, setActiveService] = useState<'hair' | 'scalp' | 'facial'>('hair');
  
  const bgCatalog = {
    hair: backgroundImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2000&q=90',
    scalp: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=2000&q=90',
    facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=2000&q=90'
  };

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const translateX = useSpring(mouseX, springConfig);
  const translateY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Normalize to -1 to 1
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;

    // Movement intensity
    mouseX.set(x * 15);
    mouseY.set(y * 15);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section 
      className="relative w-full min-h-screen flex flex-col justify-end bg-bougie-espresso overflow-hidden pt-32 pb-16 px-6 lg:px-[10%]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* 100% Full-Bleed Background Layer */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeService}
            src={bgCatalog[activeService]}
            alt="Hero Background"
            initial={{ opacity: 0.3, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0.3, scale: 1.08 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ x: translateX, y: translateY }}
            className="w-full h-full object-cover object-[center_20%] filter brightness-75 contrast-125"
          />
        </AnimatePresence>
        
        {/* Gradient Overlay for Text Legibility (Dark Mocha to transparent) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(90deg, rgba(44, 30, 22, 0.95) 0%, rgba(44, 30, 22, 0.75) 45%, rgba(44, 30, 22, 0.2) 100%),
              linear-gradient(0deg, rgba(44, 30, 22, 0.95) 0%, transparent 30%, transparent 70%, rgba(44, 30, 22, 0.7) 100%)
            `
          }}
        />

        {/* Subtle Signature Pink Wash for brand cohesion */}
        <div className="absolute inset-0 bg-bougie-pink/10 mix-blend-overlay pointer-events-none" />
      </div>

      <ParticleCanvas />

      {/* Main Content Grid */}
      <div className="relative z-20 w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center my-auto">
        
        {/* Left Editorial Text */}
        <div className="flex flex-col items-start max-w-[680px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-bougie-pink/10 border border-bougie-pink/30 text-bougie-pink text-[0.72rem] uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-bougie-pink animate-pulse" style={{ boxShadow: '0 0 12px #E6127E' }} />
            Haute Coiffure & Botanical Spa
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[clamp(4rem,6.5vw,6.5rem)] font-serif text-white font-light leading-[0.95] tracking-tight mb-8 drop-shadow-2xl"
          >
            Mastery of <br/>
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-br from-[#F8F6F0] via-[#E6127E] to-[#c40f6b]">
              hair couture
            </span> & radiance.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-white/70 leading-[1.8] max-w-[540px] mb-12 font-light drop-shadow-md"
          >
            Step into an exclusive sanctuary engineered for high-fashion hair transformations, luxury organic scalp elixirs, and bespoke aesthetic rituals tailored to your unique essence.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link href="/booking">
              <button className="relative px-10 py-4 rounded-full bg-gradient-to-br from-bougie-pink to-[#c40f6b] text-white text-sm font-bold tracking-[0.15em] uppercase shadow-[0_12px_35px_rgba(230,18,126,0.3)] hover:translate-y-[-3px] hover:shadow-[0_18px_45px_rgba(230,18,126,0.5)] transition-all overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Reserve Sanctuary
              </button>
            </Link>
            <Link href="#services">
              <button className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-bougie-espresso/30 border border-bougie-pink/40 text-white text-sm font-medium tracking-widest uppercase backdrop-blur-md hover:bg-white/10 hover:border-bougie-pink hover:translate-y-[-3px] transition-all group">
                Explore Rituals
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right Interactive Floating Accents */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-start lg:items-end gap-6"
        >
          {/* Glass Widget Profile */}
          <div className="flex items-center gap-4 bg-bougie-espresso/40 border border-bougie-pink/30 backdrop-blur-xl rounded-2xl p-5 shadow-[0_25px_50px_rgba(0,0,0,0.4)] hover:border-bougie-pink hover:translate-y-[-5px] transition-all">
            <div className="w-12 h-12 rounded-full border border-bougie-pink overflow-hidden">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" alt="Master Stylist" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Elena Rostova</h4>
              <p className="text-[0.72rem] text-bougie-pink tracking-wider mt-0.5">✦ CREATIVE DIRECTOR</p>
            </div>
          </div>

          {/* Interactive Pills */}
          <div className="flex flex-wrap gap-2.5 mt-2">
            {[
              { id: 'hair', label: 'Couture Hair' },
              { id: 'scalp', label: 'Scalp Elixirs' },
              { id: 'facial', label: 'Skin Glow' }
            ].map(service => (
              <button
                key={service.id}
                onClick={() => setActiveService(service.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs tracking-widest uppercase backdrop-blur-md transition-all ${
                  activeService === service.id 
                    ? 'bg-bougie-pink text-white font-bold shadow-[0_10px_25px_rgba(230,18,126,0.4)]' 
                    : 'bg-bougie-espresso/60 border border-bougie-pink/30 text-white/70 hover:text-white hover:border-bougie-pink'
                }`}
              >
                ✦ {service.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Landscape Metrics Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="relative z-20 w-full grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 mt-16 border-t border-bougie-pink/20"
      >
        <div className="flex items-center gap-5">
          <div className="font-serif text-[2.8rem] font-light text-bougie-pink leading-none">100%</div>
          <div>
            <h6 className="text-sm font-medium text-white mb-0.5">Organic Botanical Oils</h6>
            <p className="text-xs text-white/60 leading-relaxed">Eco-certified rare cold-pressed elixirs.</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="font-serif text-[2.8rem] font-light text-bougie-pink leading-none">15+</div>
          <div>
            <h6 className="text-sm font-medium text-white mb-0.5">International Stylists</h6>
            <p className="text-xs text-white/60 leading-relaxed">Paris & Milan trained hair artists.</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="font-serif text-[2.8rem] font-light text-bougie-pink leading-none">01</div>
          <div>
            <h6 className="text-sm font-medium text-white mb-0.5">Private VIP Suites</h6>
            <p className="text-xs text-white/60 leading-relaxed">Soundproof luxury acoustic therapy rooms.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
