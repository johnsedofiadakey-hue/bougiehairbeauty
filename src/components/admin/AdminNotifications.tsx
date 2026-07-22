"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing } from "lucide-react";

const LAST_SEEN_KEY = "admin_bookings_last_seen";
const POLL_MS = 30_000;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function AdminNotifications() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);
  const lastSeenRef = useRef<string>("");

  useEffect(() => {
    lastSeenRef.current = window.localStorage.getItem(LAST_SEEN_KEY) || new Date().toISOString();
    window.localStorage.setItem(LAST_SEEN_KEY, lastSeenRef.current);

    const poll = async () => {
      try {
        const res = await fetch(`/api/admin/appointments/new-count?since=${encodeURIComponent(lastSeenRef.current)}`);
        if (res.ok) {
          const data = await res.json();
          setCount(data.count || 0);
        }
      } catch {
        // silent — badge just won't update this cycle
      }
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushEnabled(false);
      return;
    }
    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      const existing = await registration.pushManager.getSubscription();
      setPushEnabled(!!existing);
    }).catch(() => setPushEnabled(false));
  }, []);

  const handleBellClick = () => {
    lastSeenRef.current = new Date().toISOString();
    window.localStorage.setItem(LAST_SEEN_KEY, lastSeenRef.current);
    setCount(0);
    router.push("/admin/appointments");
  };

  const handleEnablePush = async () => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      alert("Push notifications aren't configured yet.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setPushEnabled(true);
    } catch (err) {
      console.error("[PUSH_SUBSCRIBE_ERROR]", err);
      alert("Couldn't enable push notifications on this device.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {pushEnabled === false && (
        <button
          onClick={handleEnablePush}
          className="hidden sm:block text-[11px] font-bold uppercase tracking-wider text-bougie-espresso/50 hover:text-bougie-espresso transition-colors whitespace-nowrap"
        >
          Enable Alerts
        </button>
      )}
      <button
        onClick={handleBellClick}
        className="relative p-2 hover:bg-bougie-cream drop-shadow-sm rounded-lg text-bougie-espresso/60 transition-colors"
        aria-label="New bookings"
      >
        {count > 0 ? <BellRing className="w-5 h-5 text-bougie-espresso" /> : <Bell className="w-5 h-5" />}
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-bougie-espresso text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
    </div>
  );
}
