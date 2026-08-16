import { NextResponse } from 'next/server';
import { createId, updateStore } from '@/lib/data-store';

// ONE-TIME fix: the client sent real pricing/duration for the two items that
// were flagged as unconfirmed after the Wigs & Frontals migration.
//   - Frontal Ponytail: real duration (2-3 hrs) replaces the 60min default.
//   - Silk Press / Blow Dry: turns out to be length-tiered pricing (plus a
//     "+ Trim" variant), not a single price — so it's split into 4 real line
//     items, same pattern the rest of the catalog already uses for
//     length-dependent services (see Box Braids · Knotless · Twists).
// Same auth pattern as the earlier migration route (Bearer CRON_SECRET, no
// admin session needed) and same idempotency guard. Delete after use.
const SILK_PRESS_DESC = "Wash → Deep Condition → Blow Dry → Flat Iron → Light curls + serum. Goal is glassy, straight hair with bounce that still moves. Typically 1 hr 30 mins – 2 hrs 30 mins.";

function svc(name: string, price: number, priceMax: number, duration: number, description: string) {
  return {
    id: createId("service"),
    name,
    price,
    priceMax,
    duration,
    category: "Styling Add-ons",
    description,
    image: "",
    materials: [],
  };
}

const NEW_SILK_PRESS_ITEMS = [
  svc("Silk Press — Short/Medium", 65, 80, 150, SILK_PRESS_DESC),
  svc("Silk Press — Long/Extra Long", 85, 100, 150, SILK_PRESS_DESC),
  svc("Silk Press + Trim — Short/Medium", 75, 95, 150, SILK_PRESS_DESC + " Includes a trim."),
  svc("Silk Press + Trim — Long/Extra Long", 95, 100, 150, SILK_PRESS_DESC + " Includes a trim."),
];

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await updateStore((store) => {
    const alreadyApplied = store.services.some((s) => s.name === "Silk Press — Short/Medium");
    if (alreadyApplied) {
      return { alreadyApplied: true };
    }

    // 1. Frontal Ponytail: real duration confirmed.
    const frontalPonytail = store.services.find((s) => s.name === "Frontal Ponytail");
    let frontalPonytailUpdated = false;
    if (frontalPonytail) {
      frontalPonytail.duration = 180; // longer end of "2-3 hours", per site convention
      frontalPonytail.durationUnconfirmed = false;
      frontalPonytail.description = frontalPonytail.description.replace(
        /\n\n⚠️ Duration not specified — defaulted to 60 min pending confirmation\.$/,
        "\n\nTypically 2 – 3 hrs."
      );
      frontalPonytailUpdated = true;
    }

    // 2. Silk Press / Blow Dry: remove the £0 placeholder, add the 4 real tiers.
    const beforeCount = store.services.length;
    store.services = store.services.filter((s) => s.name !== "Silk Press / Blow Dry");
    const removed = beforeCount - store.services.length;
    store.services.push(...NEW_SILK_PRESS_ITEMS);

    return {
      alreadyApplied: false,
      frontalPonytailUpdated,
      silkPressRemoved: removed,
      silkPressAdded: NEW_SILK_PRESS_ITEMS.length,
      addedNames: NEW_SILK_PRESS_ITEMS.map((s) => s.name),
    };
  });

  return NextResponse.json(result);
}
