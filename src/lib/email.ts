import { format } from "date-fns";
import type { Store } from "@/lib/data-store";

type Settings = Store["settings"];

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export type EmailSendResult = { sent: true } | { sent: false; reason: string };

// Every send goes through here so the "not configured yet" fallback lives in
// one place — mirrors the Stripe checkout route's pattern of degrading
// gracefully instead of crashing when a third-party key isn't set up yet.
export async function sendBrevoEmail(params: {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
}): Promise<EmailSendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Bougie Hair & Beauty";

  if (!apiKey || !senderEmail) {
    console.warn("[BREVO] Not configured (missing BREVO_API_KEY or BREVO_SENDER_EMAIL) — skipping send.", {
      subject: params.subject,
      to: params.to.email,
    });
    return { sent: false, reason: "Brevo not configured" };
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [params.to],
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[BREVO_SEND_ERROR]", res.status, body);
      return { sent: false, reason: `Brevo API error ${res.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[BREVO_SEND_ERROR]", error);
    return { sent: false, reason: "Network error calling Brevo" };
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] as string));
}

// Shared table-based shell (email-client-safe — no flexbox/grid, inline
// styles only) themed from the salon's own settings, so a brand change in
// Admin > Settings flows into emails without touching this file.
function emailShell(settings: Settings, opts: { preheader: string; bodyHtml: string }): string {
  const logoUrl = settings.logoUrl ? `${getBaseUrl()}${settings.logoUrl}` : "";
  const companyName = escapeHtml(settings.companyName || "Bougie Hair & Beauty");
  const primary = settings.primaryColor || "#E6127E";
  const accent = "#3E1D10"; // espresso brown, kept independent of settings.accentColor (a gold UI-detail color) for text/banner contrast in emails
  const secondary = settings.secondaryColor || "#FAF3E7";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${companyName}</title>
</head>
<body style="margin:0;padding:0;background-color:${secondary};font-family:Arial,Helvetica,sans-serif;">
<span style="display:none;font-size:1px;color:${secondary};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${secondary};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background-color:${accent};padding:28px 32px;text-align:center;">
${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" width="56" height="56" style="border-radius:50%;object-fit:cover;display:inline-block;margin-bottom:10px;" />` : ""}
<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#ffffff;letter-spacing:0.5px;">${companyName}</div>
</td></tr>
<tr><td style="padding:32px;">
${opts.bodyHtml}
</td></tr>
<tr><td style="background-color:${secondary};padding:20px 32px;text-align:center;">
${settings.address ? `<div style="font-size:12px;color:${accent};opacity:0.7;margin-bottom:4px;">${escapeHtml(settings.address)}</div>` : ""}
${settings.contactPhone ? `<div style="font-size:12px;color:${accent};opacity:0.7;">${escapeHtml(settings.contactPhone)}</div>` : ""}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(primary: string, href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:9999px;background-color:${primary};">
<a href="${href}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

function bookingSummaryTable(opts: {
  accent: string;
  serviceNames: string[];
  when: string;
  total: string;
}): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #eee;border-radius:12px;">
<tr><td style="padding:16px 20px;border-bottom:1px solid #eee;">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:4px;">Service${opts.serviceNames.length > 1 ? "s" : ""}</div>
<div style="font-size:15px;color:${opts.accent};font-weight:bold;">${opts.serviceNames.map(escapeHtml).join(", ")}</div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #eee;">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:4px;">When</div>
<div style="font-size:15px;color:${opts.accent};font-weight:bold;">${escapeHtml(opts.when)}</div>
</td></tr>
<tr><td style="padding:16px 20px;">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:4px;">Total</div>
<div style="font-size:15px;color:${opts.accent};font-weight:bold;">${escapeHtml(opts.total)}</div>
</td></tr>
</table>`;
}

export function formatAppointmentWhen(startTimeIso: string): string {
  return format(new Date(startTimeIso), "EEEE d MMMM 'at' h:mmaaa");
}

export function buildBookingConfirmationEmail(params: {
  settings: Settings;
  clientName: string;
  serviceNames: string[];
  startTimeIso: string;
  totalPrice: number;
  portalLink: string | null;
}): { subject: string; html: string } {
  const { settings } = params;
  const currency = settings.currencySymbol || "£";
  const accent = "#3E1D10"; // espresso brown, kept independent of settings.accentColor (a gold UI-detail color) for text/banner contrast in emails
  const primary = settings.primaryColor || "#E6127E";
  const firstName = escapeHtml(params.clientName.split(" ")[0] || params.clientName);

  const bodyHtml = `
<div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${accent};margin-bottom:12px;">You're booked in, ${firstName}!</div>
<p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 8px;">Here's a copy of your appointment with ${escapeHtml(settings.companyName || "us")}.</p>
${bookingSummaryTable({
  accent,
  serviceNames: params.serviceNames,
  when: formatAppointmentWhen(params.startTimeIso),
  total: `${currency}${params.totalPrice}`,
})}
${params.portalLink ? `<p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 4px;">Tap below for instant access to your booking portal — no password, no code.</p>${ctaButton(primary, params.portalLink, "View My Booking")}` : ""}
<p style="font-size:12px;color:#999;line-height:1.6;margin-top:16px;">Need to change something? Just reply to this email or call ${escapeHtml(settings.contactPhone || "us")}.</p>
`;

  return {
    subject: `Booking confirmed — ${formatAppointmentWhen(params.startTimeIso)}`,
    html: emailShell(settings, {
      preheader: `Your appointment is confirmed for ${formatAppointmentWhen(params.startTimeIso)}`,
      bodyHtml,
    }),
  };
}

export function buildReminderEmail(params: {
  settings: Settings;
  clientName: string;
  serviceNames: string[];
  startTimeIso: string;
  totalPrice: number;
  portalLink: string | null;
}): { subject: string; html: string } {
  const { settings } = params;
  const currency = settings.currencySymbol || "£";
  const accent = "#3E1D10"; // espresso brown, kept independent of settings.accentColor (a gold UI-detail color) for text/banner contrast in emails
  const primary = settings.primaryColor || "#E6127E";
  const firstName = escapeHtml(params.clientName.split(" ")[0] || params.clientName);

  const bodyHtml = `
<div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${accent};margin-bottom:12px;">See you soon, ${firstName}!</div>
<p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 8px;">Just a reminder — your appointment is coming up in about an hour.</p>
${bookingSummaryTable({
  accent,
  serviceNames: params.serviceNames,
  when: formatAppointmentWhen(params.startTimeIso),
  total: `${currency}${params.totalPrice}`,
})}
${params.portalLink ? ctaButton(primary, params.portalLink, "View My Booking") : ""}
<p style="font-size:12px;color:#999;line-height:1.6;margin-top:16px;">Running late or need to reschedule? Call ${escapeHtml(settings.contactPhone || "us")}.</p>
`;

  return {
    subject: `Reminder — your appointment is in about an hour`,
    html: emailShell(settings, {
      preheader: `Your appointment at ${escapeHtml(settings.companyName || "the salon")} is coming up soon`,
      bodyHtml,
    }),
  };
}
