import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import { MobileNav } from "@/components/landing/MobileNav";
import { Button } from "@/components/ui/button";
import { readStore } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  let settings;

  try {
    settings = (await readStore()).settings;
  } catch (e) {
    console.error("Failed to fetch settings from DB, using defaults");
  }

  const serializedSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;

  const heading = serializedSettings?.aboutHeading || "Our Story";
  const image = serializedSettings?.aboutImage || "/service_hair.png";
  const badgeNumber = serializedSettings?.aboutBadgeNumber || "5";
  const badgeLabel = serializedSettings?.aboutBadgeLabel || "Service Departments";
  const body: string = serializedSettings?.aboutBody ||
    "Bougie Hair & Beauty brings hair braiding, wig construction, lash extensions, a Japanese head spa, and a full nail bar together under one roof at 41 Crouch Street, Colchester.\n\nWhether you're booking a fresh set of knotless braids, a custom frontal unit, a lash refresh, or a full nail bar visit, every appointment is built around the same standard of care and craft.";

  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <main className="min-h-screen pb-20 md:pb-0 bg-white">
      <MobileNav />
      <WhatsAppFloat />
      <Navbar settings={serializedSettings} />

      <section className="pt-40 pb-20 px-6 bg-[var(--color-secondary)]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-4 block">Our Story</span>
          <h1 className="text-5xl md:text-6xl font-serif text-brand-primary mb-6 leading-tight">{heading}</h1>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-start">
          <div className="relative w-full md:w-2/5 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 md:sticky md:top-32">
            <Image
              src={image}
              alt={heading}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-8 right-8 glass p-6 rounded-2xl shadow-xl max-w-[200px]">
              <div className="text-3xl font-serif text-white mb-1">{badgeNumber}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/70">{badgeLabel}</div>
            </div>
          </div>

          <div className="w-full md:w-3/5 space-y-8">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className="text-xl md:text-2xl text-zinc-700 leading-relaxed whitespace-pre-line font-serif"
              >
                {paragraph}
              </p>
            ))}

            <div className="pt-8">
              <Link href="/booking">
                <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold shadow-xl shadow-brand-primary/20">
                  Book Your Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={serializedSettings} />
    </main>
  );
}
