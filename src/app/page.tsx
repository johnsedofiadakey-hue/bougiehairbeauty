import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { About } from "@/components/landing/About";
import { Contact } from "@/components/landing/Contact";
import { Navbar } from "@/components/landing/Navbar";
import { Portfolio } from "@/components/landing/Portfolio";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import { MobileNav } from "@/components/landing/MobileNav";
import { readStore } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  let settings;
  
  try {
    settings = (await readStore()).settings;
  } catch (e) {
    console.error("Failed to fetch settings from DB, using defaults");
  }

  // Safe serialization for Client Components
  const serializedSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;

  const defaultSettings = {
    heroTitle: "Elevate Your Natural Beauty",
    heroSubtitle: "Professional cosmetology services tailored to you.",
    heroImage: "/beauty_hero_bg.png",
    heroMediaType: "image",
    whatsappNumber: "447700900000"
  };

  const currentSettings = serializedSettings || defaultSettings;

  return (
    <main className="min-h-screen pb-20 md:pb-0">
      <MobileNav />
      <WhatsAppFloat />
      <Navbar settings={serializedSettings} />
      
      <Hero 
        title={currentSettings.heroTitle} 
        subtitle={currentSettings.heroSubtitle} 
        backgroundImage={currentSettings.heroImage || defaultSettings.heroImage}
        videoUrl={currentSettings.heroVideoUrl}
        mediaType={currentSettings.heroMediaType}
        whatsappNumber={currentSettings.whatsappNumber}
      />
      
      <TrustStrip />
      <About settings={serializedSettings} />
      <Services settings={serializedSettings} />
      <Portfolio />
      <Testimonials />
      <FAQ />
      <Contact settings={serializedSettings} />
      <Footer settings={serializedSettings} />
    </main>
  );
}
