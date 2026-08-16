import { NextResponse } from 'next/server';
import { createId, updateStore } from '@/lib/data-store';

// ONE-TIME migration: replaces the "Wigs & Frontal Services" catalog with the
// client's new wig/chemical/wash/styling menu. Guarded the same way as the
// cron route (`Authorization: Bearer ${CRON_SECRET}`) rather than an admin
// session, because this needs to run with the production service's own
// credentials — no browser login involved. Idempotent: if the new category
// already exists, it no-ops instead of re-running. Delete this route once
// it's been run against production.
const NEW_CATEGORY = "Wig & Extension Services";
const OLD_CATEGORY = "Wigs & Frontal Services";

function svc(name: string, price: number, duration: number, category: string, description: string, flags: Record<string, boolean> = {}) {
  return {
    id: createId("service"),
    name,
    price,
    duration,
    category,
    description,
    image: "",
    materials: [],
    ...flags,
  };
}

const NEW_SERVICES = [
  svc("Wig Making - Bundles", 70, 360, NEW_CATEGORY,
    "Custom wig made from new bundles. Includes cap construction, plucking, bleaching knots. Typically 4–6 hrs."),
  svc("Wig Making - Client Hair", 70, 300, NEW_CATEGORY,
    "Turn your old bundles/weave into a custom wig. Typically 3–5 hrs."),
  svc("Wig Wash, Treatment & Revival", 40, 60, NEW_CATEGORY,
    "Deep clean, condition, detangle, and restyle old wig."),
  svc("Wig Install", 75, 90, NEW_CATEGORY,
    "Sew-in or glue/melt install of frontal or closure wig. Includes baby hairs. Typically 1 hr – 1 hr 30 mins."),
  svc("Closure Install", 65, 75, NEW_CATEGORY,
    "Sew-in or glue install with natural part. Typically 1 hr – 1 hr 15 mins."),
  svc("Wig Styling & Customization", 125, 90, NEW_CATEGORY,
    "Cut, layer, curl, or colour a wig to your preference. Typically 45 mins – 1 hr 30 mins."),
  svc("Sew-in Weave", 140, 180, NEW_CATEGORY,
    "Tracks sewn onto cornrow base. Includes wash + style. Typically 2 – 3 hrs."),
  svc("Quick Weave", 70, 90, NEW_CATEGORY,
    "Glue-in tracks on protective cap. 6-8 week wear."),
  svc("Frontal Ponytail", 100, 60, NEW_CATEGORY,
    "Gives you a 360° natural hairline with the flexibility of wearing your hair up. We use a lace frontal to mimic a natural scalp, so the ponytail looks like it's growing from your own head. No leave-out needed.\n\n" +
    "Includes: Braid down, frontal installation, ponytail creation, baby hairs, edge control.\n" +
    "Wear Time: 2-4 weeks with proper maintenance and nightly wrap.\n" +
    "Good For: Special events, sleek looks, protecting natural hair.\n" +
    "Add-ons: +30 mins for extra length, curls, swoop, or bang.\n" +
    "Note: Time varies based on hair thickness, length, and if you're adding bundles for extra volume.\n\n" +
    "⚠️ Duration not specified — defaulted to 60 min pending confirmation.",
    { durationUnconfirmed: true }),
  svc("Tape-in Extensions", 120, 120, NEW_CATEGORY,
    "Semi-permanent tape extensions. Reusable for 6-8 weeks. Typically 1 hr 30 mins – 2 hrs."),

  svc("Relaxer", 90, 90, "Chemical Services",
    "Chemical straightening with neutralizing shampoo + deep condition."),
  svc("Texturizer", 90, 90, "Chemical Services",
    "Mild chemical to loosen curl pattern, not fully straight."),
  svc("Hair Colouring", 50, 180, "Chemical Services",
    "Single process colour. Consultation needed for shade. Typically 2 – 3 hrs. Starting price — final cost confirmed after consultation."),
  svc("Highlights", 60, 240, "Chemical Services",
    "Partial or full highlights with toner. Typically 2 – 4 hrs. Starting price — final cost confirmed after consultation."),
  svc("Colour Correction", 60, 300, "Chemical Services",
    "Fixing previous colour. Price depends on consultation. Typically 3 – 5 hrs. Starting price — final cost confirmed after consultation."),

  svc("Shampoo", 35, 20, "Wash & Treatments",
    "Clarifying wash with scalp massage."),
  svc("Deep Conditioning", 60, 30, "Wash & Treatments",
    "Moisture treatment under steamer or heat cap."),
  svc("Protein Treatment", 70, 45, "Wash & Treatments",
    "Strengthening treatment for weak/breaking hair."),
  svc("Scalp Treatment", 70, 30, "Wash & Treatments",
    "Detox, exfoliation, and treatment for dandruff/itchy scalp."),

  svc("Hair Steaming", 50, 20, "Styling Add-ons",
    "Add-on to any wash/treatment to open cuticles for moisture."),
  svc("Silk Press / Blow Dry", 0, 90, "Styling Add-ons",
    "Wash, blow dry, and flat iron for sleek, straight finish. Typically 1 hr – 1 hr 30 mins.\n\n⚠️ Price not specified — defaulted to £0 pending confirmation.",
    { priceUnconfirmed: true }),
  svc("Roller Set", 65, 105, "Styling Add-ons",
    "Wash, set on rollers, and hood dry for soft, bouncy curls."),
];

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await updateStore((store) => {
    const alreadyMigrated = store.services.some((s) => s.category === NEW_CATEGORY);
    if (alreadyMigrated) {
      return { alreadyMigrated: true, removed: 0, added: 0 };
    }

    const before = store.services.length;
    store.services = store.services.filter((s) => s.category !== OLD_CATEGORY);
    const removed = before - store.services.length;

    store.services.push(...NEW_SERVICES);

    return {
      alreadyMigrated: false,
      removed,
      added: NEW_SERVICES.length,
      addedNames: NEW_SERVICES.map((s) => s.name),
    };
  });

  return NextResponse.json(result);
}
