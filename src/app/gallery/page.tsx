import { TopBar } from "@/components/landing/TopBar";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { MobileNav } from "@/components/landing/MobileNav";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import { readStore } from "@/lib/data-store";
import { Portfolio } from "@/components/landing/Portfolio";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let settings;
  try {
    settings = (await readStore()).settings;
  } catch (e) {
    console.error("Failed to fetch settings from DB, using defaults");
  }
  const serializedSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;

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

      <div className="min-h-[60vh]">
        <Portfolio hideCta={true} />
      </div>
      
      <Footer settings={serializedSettings} />
    </main>
  );
}
