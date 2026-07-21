import { NextResponse } from 'next/server';
import { differenceInMinutes } from 'date-fns';
import { readStore, updateStore } from '@/lib/data-store';
import { sendBrevoEmail, buildReminderEmail, formatAppointmentWhen } from '@/lib/email';
import { generatePortalMagicLink } from '@/lib/magic-link';

// Hit by Cloud Scheduler every 5-10 minutes with `Authorization: Bearer
// ${CRON_SECRET}` — anyone else gets a 401. Sends a reminder to every
// upcoming appointment that's now within an hour of starting, has an email
// on file, and hasn't already been reminded (or been marked skipped at
// booking time for having had under an hour of runway to begin with).
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await readStore();
  const now = new Date();

  const due = store.appointments.filter((apt: any) => {
    if (apt.reminderSent || apt.reminderSkipped) return false;
    if (!['PENDING', 'CONFIRMED'].includes(apt.status)) return false;
    const minutesUntil = differenceInMinutes(new Date(apt.startTime), now);
    // Small negative grace window covers a missed poll (e.g. a brief outage)
    // rather than silently never reminding a client who's still en route.
    return minutesUntil <= 60 && minutesUntil > -10;
  });

  let sent = 0;
  let skippedNoEmail = 0;
  const errors: string[] = [];

  for (const apt of due) {
    const client = store.clients.find((c: any) => c.id === apt.clientId);
    const email = client?.email?.trim();

    if (!email) {
      skippedNoEmail++;
      await updateStore((s) => {
        const target = s.appointments.find((a: any) => a.id === apt.id);
        if (target) target.reminderSkipped = true;
        return null;
      });
      continue;
    }

    try {
      const user = store.users.find((u: any) => u.id === client.userId);
      const services = (apt.serviceIds as string[])
        .map((id) => store.services.find((s: any) => s.id === id))
        .filter(Boolean);

      const portalLink = await generatePortalMagicLink(email);
      const { subject, html } = buildReminderEmail({
        settings: store.settings,
        clientName: user?.name || 'there',
        serviceNames: services.map((s: any) => s.name),
        startTimeIso: apt.startTime,
        totalPrice: apt.totalPrice,
        portalLink,
      });

      const result = await sendBrevoEmail({ to: { email, name: user?.name }, subject, htmlContent: html });
      if (result.sent) {
        sent++;
        await updateStore((s) => {
          const target = s.appointments.find((a: any) => a.id === apt.id);
          if (target) target.reminderSent = true;
          return null;
        });
      } else {
        errors.push(`${apt.id}: ${result.reason}`);
      }
    } catch (error) {
      console.error('[REMINDER_SEND_ERROR]', apt.id, error);
      errors.push(`${apt.id}: unexpected error`);
    }
  }

  return NextResponse.json({
    checked: due.length,
    sent,
    skippedNoEmail,
    errors,
    formattedNow: formatAppointmentWhen(now.toISOString()),
  });
}
