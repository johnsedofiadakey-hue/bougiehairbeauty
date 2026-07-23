import { TopBar } from "@/components/landing/TopBar";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { MobileNav } from "@/components/landing/MobileNav";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import { readStore } from "@/lib/data-store";
import { User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StylistsPage() {
  let settings;
  try {
    settings = (await readStore()).settings;
  } catch (e) {
    console.error("Failed to fetch settings from DB, using defaults");
  }
  const serializedSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;

  const stylistName = serializedSettings?.stylistName || "Bougie Hair & Beauty";
  const stylistTitle = serializedSettings?.stylistTitle || "Owner & Lead Specialist";
  const stylistBio = serializedSettings?.stylistBio || "Hair braiding, wigs, lash extensions, head spa & nails — every appointment is done personally, start to finish.";
  const stylistImage = serializedSettings?.stylistImage || "";

  return (
    <main className="min-h-screen pb-20 lg:pb-0 bg-luxe-blush">
      <MobileNav />
      <WhatsAppFloat />
      <header className="fixed top-0 inset-x-0 z-50">
        <TopBar settings={serializedSettings} />
        <Navbar settings={serializedSettings} />
      </header>

      {/* Spacer for fixed header */}
      <div className="h-32 bg-luxe-blush"></div>

      <div className="py-24 bg-luxe-blush min-h-[60vh]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-luxe-dark mb-4">Meet Your Stylist</h1>
            <p className="text-luxe-dark/70 leading-relaxed">
              Bougie is a one-woman studio — every service, every appointment, is with the same person, start to finish.
            </p>
          </div>

          {/* One real card, not a fabricated multi-stylist grid — this is a
              solo studio (see docs/HANDOVER.md), so a "meet our team" page
              with several generic profiles would be publishing something
              false. Photo falls back to a plain placeholder until a real
              one is uploaded via Admin → Settings → Team / Stylist. */}
          <div className="max-w-sm">
            <div className="group relative rounded-3xl overflow-hidden bg-white/50 border border-luxe-dark/10">
              <div className="aspect-[3/4] bg-luxe-dark/5 relative overflow-hidden">
                {stylistImage ? (
                  <>
                    <img src={stylistImage} alt={stylistName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxe-dark/80 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-luxe-plum/10">
                    <User className="w-16 h-16 text-luxe-dark/20" />
                  </div>
                )}

                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className={`text-xl font-serif mb-1 ${stylistImage ? "text-white" : "text-luxe-dark"}`}>{stylistName}</h3>
                  <p className={`text-sm font-sans ${stylistImage ? "text-white/80" : "text-luxe-dark/60"}`}>{stylistTitle}</p>
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm text-luxe-dark/70 leading-relaxed">{stylistBio}</p>
          </div>
        </div>
      </div>

      <Footer settings={serializedSettings} />
    </main>
  );
}
