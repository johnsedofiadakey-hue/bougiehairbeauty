import webpush from "web-push";
import { readStore, updateStore } from "@/lib/data-store";

let configured = false;
function ensureConfigured(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!publicKey || !privateKey) return false;
  if (!configured) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
  return true;
}

// Fires on every new booking so the admin dashboard doesn't rely on someone
// having the tab open — sends to every device that's subscribed (usually
// just the studio's own phone/laptop), and quietly drops subscriptions the
// browser has since invalidated (410/404) so the list doesn't grow stale.
export async function notifyAdminsOfNewBooking(params: {
  clientName: string;
  serviceNames: string[];
  whenLabel: string;
}): Promise<void> {
  if (!ensureConfigured()) {
    console.warn("[PUSH] VAPID keys not configured — skipping admin push notification.");
    return;
  }

  const store = await readStore();
  const subs = store.pushSubscriptions || [];
  if (subs.length === 0) return;

  const payload = JSON.stringify({
    title: "New booking",
    body: `${params.clientName} — ${params.serviceNames.join(", ")} at ${params.whenLabel}`,
    url: "/admin/appointments",
  });

  const deadEndpoints: string[] = [];

  await Promise.all(
    subs.map(async (sub: any) => {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          deadEndpoints.push(sub.endpoint);
        } else {
          console.error("[PUSH_SEND_ERROR]", error?.statusCode, error?.body || error);
        }
      }
    })
  );

  if (deadEndpoints.length > 0) {
    await updateStore((store) => {
      store.pushSubscriptions = (store.pushSubscriptions || []).filter(
        (sub: any) => !deadEndpoints.includes(sub.endpoint)
      );
      return null;
    });
  }
}
