import { format } from "date-fns";
import type { Store } from "@/lib/data-store";

type Settings = Store["settings"];

import nodemailer from 'nodemailer';

export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export type EmailSendResult = { sent: true } | { sent: false; reason: string };

// Every send goes through here so the "not configured yet" fallback lives in
// one place — mirrors the Stripe checkout route's pattern of degrading
// gracefully instead of crashing when a third-party key isn't set up yet.
export async function sendEmail(params: {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
}): Promise<EmailSendResult> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const senderName = process.env.SMTP_SENDER_NAME || "Bougie Hair & Beauty";

  if (!host || !user || !pass) {
    console.warn("[SMTP] Not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASSWORD) — skipping send.", {
      subject: params.subject,
      to: params.to.email,
    });
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${user}>`, // sender address
      to: params.to.name ? `"${params.to.name}" <${params.to.email}>` : params.to.email,
      subject: params.subject,
      html: params.htmlContent,
    });

    console.log("[SMTP_SEND_SUCCESS]", info.messageId);
    return { sent: true };
  } catch (error: any) {
    console.error("[SMTP_SEND_ERROR]", error);
    return { sent: false, reason: `SMTP Error: ${error.message}` };
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

export function buildAdminNewBookingEmail(params: {
  settings: Settings;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceNames: string[];
  startTimeIso: string;
  totalPrice: number;
  adminPortalLink: string;
}): { subject: string; html: string } {
  const { settings } = params;
  const currency = settings.currencySymbol || "£";
  const accent = "#3E1D10"; 
  const primary = settings.primaryColor || "#E6127E";

  const bodyHtml = `
<div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${accent};margin-bottom:12px;">New Booking Alert!</div>
<p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 8px;">A new appointment has just been booked by <strong>${escapeHtml(params.clientName)}</strong>.</p>
<div style="background-color:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:16px;">
  <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:4px;">Contact Info</div>
  <div style="font-size:14px;color:#333;margin-bottom:4px;"><strong>Email:</strong> ${escapeHtml(params.clientEmail)}</div>
  <div style="font-size:14px;color:#333;"><strong>Phone:</strong> ${escapeHtml(params.clientPhone)}</div>
</div>
${bookingSummaryTable({
  accent,
  serviceNames: params.serviceNames,
  when: formatAppointmentWhen(params.startTimeIso),
  total: `${currency}${params.totalPrice}`,
})}
${ctaButton(primary, params.adminPortalLink, "View in Admin Portal")}
`;

  return {
    subject: `New Booking: ${escapeHtml(params.clientName)} on ${formatAppointmentWhen(params.startTimeIso)}`,
    html: emailShell(settings, {
      preheader: `New booking received from ${escapeHtml(params.clientName)}`,
      bodyHtml,
    }),
  };
}
