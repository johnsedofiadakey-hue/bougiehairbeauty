// Minimal service worker whose only job is displaying admin new-booking
// push notifications and focusing/opening the appointments tab on click.
// Not a full PWA/offline-cache worker — scope is intentionally narrow.

self.addEventListener("push", (event) => {
  let data = { title: "New booking", body: "", url: "/admin/appointments" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    // ignore malformed payloads
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.png",
      badge: "/logo.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin/appointments";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientsList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })()
  );
});
