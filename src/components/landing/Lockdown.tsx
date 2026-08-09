import { Mail, Phone, MapPin, Instagram, MessageCircle } from "lucide-react";

// Full-screen "site lockdown" / maintenance screen shown in place of the whole
// public site when the studio takes the site offline. Deliberately self-
// contained (no nav, no booking, no data fetching) so it renders even when the
// data store is unavailable — the title/message fall back to warm defaults when
// no custom copy has been saved. Editable via Admin → Settings → Site Lockdown.
export function Lockdown({ settings }: { settings?: any }) {
  const s = settings || {};

  const company = s.companyName || "Bougie Hair & Beauty";
  const title = s.lockdownTitle || "We're taking a short break";
  const message =
    s.lockdownMessage ||
    "Our website is having a little pampering of its own. We'll be back and booking beautiful appointments very soon.\n\nIn the meantime, we'd still love to hear from you — reach us directly using the details below.";
  const eyebrow = s.lockdownEyebrow || "A moment, please";

  const phone = s.contactPhone;
  const email = s.contactEmail;
  const whatsapp = s.whatsappNumber;
  const instagram = s.instagramUrl;
  const address = s.address;

  const contacts = [
    phone && { icon: Phone, label: phone, href: `tel:${String(phone).replace(/\s+/g, "")}` },
    email && { icon: Mail, label: email, href: `mailto:${email}` },
    whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/${String(whatsapp).replace(/[^\d]/g, "")}`,
    },
    instagram && { icon: Instagram, label: "Instagram", href: instagram },
  ].filter(Boolean) as { icon: any; label: string; href: string }[];

  return (
    <main className="relative min-h-screen overflow-hidden bg-luxe-blush text-luxe-dark flex items-center justify-center px-6 py-16">
      {/* Soft decorative wash — keeps the empty screen feeling designed, not broken */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 60rem at 15% -10%, rgba(138,107,117,0.14), transparent 55%), radial-gradient(50rem 50rem at 110% 110%, rgba(212,175,55,0.12), transparent 55%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-luxe-plum/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-bougie-champagne/10 blur-3xl" />

      <style
        dangerouslySetInnerHTML={{
          __html:
            "@keyframes lockdownFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes lockdownFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}",
        }}
      />

      <section
        className="relative z-10 w-full max-w-2xl text-center"
        style={{ animation: "lockdownFade 0.9s ease-out both" }}
      >
        {/* Logo / brand mark */}
        <div className="mb-8 flex justify-center" style={{ animation: "lockdownFloat 6s ease-in-out infinite" }}>
          {s.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.logoUrl}
              alt={company}
              className="h-20 w-20 rounded-full object-contain shadow-lg ring-1 ring-luxe-dark/10 bg-white/70 p-2"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-luxe-dark text-luxe-blush shadow-lg">
              <span className="font-serif text-3xl">{company.charAt(0)}</span>
            </div>
          )}
        </div>

        <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-luxe-plum">{eyebrow}</p>

        <h1 className="font-serif text-4xl leading-tight text-luxe-dark sm:text-5xl">{title}</h1>

        {/* Gold hairline divider */}
        <div className="mx-auto my-8 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-luxe-dark/15" />
          <span className="h-1.5 w-1.5 rounded-full bg-bougie-champagne" />
          <span className="h-px w-12 bg-luxe-dark/15" />
        </div>

        <p className="mx-auto max-w-xl whitespace-pre-line text-base leading-relaxed text-luxe-dark/70 sm:text-lg">
          {message}
        </p>

        {contacts.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {contacts.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group inline-flex items-center gap-2 rounded-full border border-luxe-dark/10 bg-white/70 px-5 py-2.5 text-sm font-medium text-luxe-dark shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-luxe-plum/40 hover:bg-white hover:shadow-md"
              >
                <Icon className="h-4 w-4 text-luxe-plum transition-colors group-hover:text-luxe-plumDark" />
                {label}
              </a>
            ))}
          </div>
        )}

        <div className="mt-12 space-y-1">
          {address && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-luxe-dark/50">
              <MapPin className="h-3.5 w-3.5" /> {address}
            </p>
          )}
          <p className="font-serif text-lg text-luxe-dark/70">— The {company} team</p>
        </div>
      </section>
    </main>
  );
}
