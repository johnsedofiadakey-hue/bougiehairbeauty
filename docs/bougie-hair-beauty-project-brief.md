# Bougie Hair & Beauty — Website & Booking System Project Brief

Prepared as a build spec for implementation (template customization + booking system). Pairs with `services.json` in this same folder, which holds the full structured service catalog for seeding the booking system.

---

## 1. Business Overview

| | |
|---|---|
| **Business name** | Bougie Hair & Beauty |
| **Location** | 41 Crouch Street, Colchester |
| **Phone** | 07770 375859 |
| **Email** | bougiehairuk@gmail.com |
| **Instagram** | @bougiehair_ |
| **TikTok** | @bougiehairuk |
| **Existing shop link** | www.bougiehairuk.com |

Bougie Hair & Beauty is a full-service salon offering hair braiding/extensions, wig construction and installation, lash extensions, a head spa treatment, and a full nail bar (pedicure, manicure, acrylic, BIAB, shellac). This is broader than a typical "hair braiding" business — the site and booking system need to support five distinct service departments.

**Open question for client:** is `bougiehairuk.com` the existing e-commerce store for hair bundles, separate from the new booking site? Confirm whether the new build lives on that domain, a subdomain, or a separate domain that links out to the shop.

---

## 2. Branding

The client did not supply a logo file or exact brand hex codes — the label rows in the request ("Your logo / Your business name / Branding colors") were placeholders to be filled in, not actual assets. **Action needed:** request the logo file and official hex codes from the client before final styling.

In the meantime, here's the palette read directly off the two price-list flyers, usable as a placeholder/starting point:

| Swatch | Approx. hex | Used for |
|---|---|---|
| Blush pink | `#F9DCE8` | Page backgrounds |
| Deep espresso brown | `#3E1D10` | Headings, bordered boxes, primary text on light backgrounds |
| Hot pink / magenta | `#E6127E` | Script accents, "pricelist" wordmark, highlight text |
| Black | `#000000` | Body copy |
| White | `#FFFFFF` | Text on dark brown, card backgrounds |

Two distinct flyer styles were used across the source material (a soft script/serif "Extensions Pricelist" look, and a bold sans + neon-script "Braids Pricelist" look with a butterfly motif). Recommend picking **one** cohesive style for the live site rather than mixing both — flag this as a design decision for the client.

---

## 3. Technical Architecture

| Layer | Choice |
|---|---|
| **Hosting** | Firebase Hosting (entire site + booking system) |
| **Auth (booking)** | Firebase Authentication — Phone OTP (client verifies via SMS code before confirming a booking) |
| **Database** | Firestore (implied by Firebase stack — confirm vs. Realtime Database) |
| **Backend logic** | Firebase Cloud Functions (booking writes, deposit handling, triggering emails, admin actions) |
| **Transactional email** | Brevo — booking confirmations, reminders, prep-instruction emails, admin notifications |
| **Payments** | Stripe — collects the £20 deposit; official Firebase Extension available for direct Firestore/Cloud Functions integration |
| **Admin portal** | Custom admin dashboard (see §3.1) — owner manages bookings, services/prices, availability |
| **Logo / brand assets** | To be provided by client |
| **Photography** | Stock images to be provided by client later — build with placeholders now |

### 3.1 Payments (Stripe)

- **Provider:** Stripe, GBP currency. Chosen as the UK-standard gateway with a first-party Firebase integration (see below).
- **Integration path:** Firebase Extension **"Run Payments with Stripe"** (`firestore-stripe-payments`) — writes a payment doc to Firestore, the extension calls Stripe, and syncs status back to Firestore automatically. Avoids hand-rolling webhook plumbing.
- **Flow:** Stripe Checkout (hosted payment page) or Stripe Elements (embedded card form) for the £20 deposit at the end of the booking flow, after phone OTP verification and before the booking is marked confirmed.
- **Webhooks:** Cloud Function listens for `checkout.session.completed` / `payment_intent.succeeded` to flip the booking's status from `pending_payment` to `confirmed` in Firestore, then triggers the Brevo confirmation email. Booking should NOT be considered confirmed until Stripe confirms payment — avoids double-booking a slot on an abandoned checkout.
- **Refunds:** Deposit is stated as non-refundable per policy (§7) — admin portal should still expose a manual "refund via Stripe" action for the rare case the owner chooses to override this (no-show disputes, goodwill, etc.).
- **Keys/environments:** use Stripe test mode keys through development, live keys only in production; store secret key in Firebase Functions config/Secret Manager, never in client code.
- **PCI compliance:** handled by Stripe (Checkout/Elements never let card data touch your own servers) — no extra compliance burden on this build.
- **Open item:** if any service ever needs full payment (not just a deposit) up front — e.g. the "Hair Included Frontal Ponytail" at £280, or nail services under £20 where a flat £20 deposit wouldn't make sense — confirm with the client whether deposit amount should scale per-service or stay a flat £20 across the board.

### 3.2 Admin Portal Requirements

- Auth-gated (owner/staff login — likely also Firebase Auth, email+password or separate admin role)
- View/manage bookings: see upcoming appointments, client contact info, service booked, comments/design notes, deposit status
- Manage availability: block off dates/times, set working hours
- Manage service catalog: edit services, prices, durations, notes without a code deploy (should read from the same Firestore collection seeded by `services.json`)
- Manually confirm/adjust price for "starting at" services once the client's comment/design request has been reviewed
- Trigger or review Brevo email notifications tied to a booking (confirmation, reminder, drop-off reminder for wig/hair lead-time rules)
- Mark deposits as paid/refunded (via Stripe — see §3.1), cancel or reschedule bookings

**Open question:** should the admin portal also manage stock/image uploads for the gallery, or is that handled separately once stock images are provided?

---

## 4. Site Structure (proposed pages)

1. **Home** — hero image/video, intro, featured services, booking CTA, Instagram/TikTok feed or gallery teaser
2. **Services** — organized by department (Hair, Wigs, Lash, Spa, Nails), pulling from `services.json`; each service shows duration, price, and notes
3. **Booking** — the booking flow itself (see §5)
4. **Gallery / Portfolio** — photos of finished work, organized by category
5. **About** — the stylist/salon story
6. **Policies / FAQ** — deposit policy, prep instructions, drop-off rules for hair/wig services, cancellation policy
7. **Contact** — address, map embed, phone, email, social links
8. **Shop** (optional) — either an embedded store or a link out to bougiehairuk.com, pending the open question in §1

---

## 5. Service Catalog Summary

Full structured data is in `services.json` (130 services across 23 categories, ready to seed a database). Departments:

1. **Hair Extensions (Add-on Pricing)** — 3–6 piece extension add-on, £14–£25
2. **Box Braids · Knotless · Twists** — matrix priced by size (Small/Medium/Large/Jumbo) × length (Shoulder/Mid Back/Waist/Butt-Knee), £50–£125
3. **Boho · Goddess Braids** — £75–£175
4. **Corn Rows & Specialty Styles** — Fulani, Lemonade, Island Twist, Natural Cornrows, Locs, French Curls, Kinky/Mini Twist, Wig Revamp — £35–£100+, several "starting at" prices
5. **Extras & Add-ons** — Curls, Beads, Under Wig Cornrows, Natural Hair Twist, Blow Dry, Extra Small Parts — £5–£35
6. **Wigs & Frontal Services** — Frontal Ponytail, Custom Frontal Unit, Frontal/Closure Replacement, Wig Making, Wig Customisation, Closure Sew In, Custom U/V/Half Wig — £25–£280, several with drop-off/lead-time requirements
7. **Lash Extensions** — Bougie Set, Glam Set, Luxe Set, Foreign Infills, Infills — £30–£50
8. **Spa** — Japanese Head Spa — £50 (duration unconfirmed)
9. **Nails** — 14 sub-categories covering Spring Luxe Pedicure, BIAB (hand & toe), Fullsets, Infills, Shellac, Gel, Acrylic toes, Deluxe/Spa Pedicure, Manicure, Removal, Custom Designs — roughly 70 individual services, £10–£75

### Booking-system implications of the catalog

- **Pricing types vary**: most services are fixed price, but several are `"starting"` prices (design/length dependent) that need a comment box for the client to describe what they want, and the final price confirmed manually rather than charged automatically.
- **Add-ons are separate from services**: Extensions pricing and the Extras & Add-ons category should be selectable *alongside* a braid/twist booking, not booked as standalone appointments.
- **Lead-time rules**: several wig/frontal services require hair or closures to be dropped off 5–10 days before the appointment, with a £10 late fee. The booking flow should be able to attach a rule like this per-service (e.g., a warning banner + a required acknowledgment checkbox at checkout).
- **Deposit**: £20 non-refundable deposit confirmed for hair bookings. Confirm with client whether this applies uniformly to lash, spa, wig, and nail bookings too, or if it's hair-only.

---

## 6. Booking Flow Requirements

1. Client selects a **department** (Hair / Wigs / Lash / Spa / Nails)
2. Client selects a **service** — duration and price shown, plus any notes (e.g. "price does not include removal")
3. If applicable, client selects **add-ons** (extensions pieces, curls, beads, blow dry, etc.)
4. Client picks **date/time** against real availability
5. If the service carries prep requirements (freshly washed hair, no product, hair drop-off lead time), show them clearly before confirming
6. Client enters contact details and **comment box** (required for "starting price" / custom design services)
7. Client verifies their phone number via **Firebase Phone Auth (OTP/SMS code)** before the booking is confirmed
8. **£20 deposit** collected via **Stripe Checkout/Elements** (see §3.1) — booking is held as `pending_payment` until Stripe confirms the charge
9. Stripe webhook (via Cloud Function) flips the booking to `confirmed` in Firestore, which triggers a **Brevo** transactional email with confirmation + prep instructions (and a drop-off reminder for wig/hair lead-time services)
10. Admin portal (see §3.2) reflects the new booking in real time for the owner to manage

---

## 7. Policies (as stated by client)

- Hair extensions are **not included** in braid/twist pricing unless stated
- Hair must be washed and blow-dried before a hair appointment
- £20 **non-refundable deposit** required to secure a booking
- Appointment only — currently booked via WhatsApp/DM (the new site replaces this)
- Prices may vary depending on hair length and thickness
- Foreign lash infills require ≥50% existing lashes remaining, or it's charged as a full set
- Wig/closure hair must be dropped off 5 days before the appointment (10 days if ordering hair from the salon), or a £10 fee applies

---

## 8. Open Questions / Items Needing Client Input

Flagging these rather than guessing, since they affect real pricing/content accuracy:

1. **Logo & brand colors** — no logo file or hex codes were provided; palette in §2 is estimated from the flyers and needs client sign-off.
2. **`bougiehairuk.com` relationship** — is this the domain for the new site, or a separate existing shop to link to?
3. **Deposit scope** — does the £20 deposit apply to lash, spa, wig, and nail bookings, or hair only?
4. **Lash naming mismatch** — "Bougie Set" is described in the source text as "Roman," and "Luxe Set" is described as "the queen set." Likely leftover copy from renaming the sets — confirm final names/descriptions.
5. **Wig service durations** — "Frontal Replacement Only" (10 min), "Wig Making" (1 min), and "Wig Customisation" (5 min) look like placeholder durations carried over from the old booking system rather than real appointment lengths. Confirm actual time needed for each.
6. **Japanese Head Spa duration** — not specified in the source material.
7. **Boho/Goddess vs. Fulani/Lemonade overlap** — the braids flyer groups "Boho · Goddess · Fulani · Lemonade" under one heading, but only Boho and Goddess have a pricing table there; Fulani and Lemonade are priced separately (as "starting at") under Corn Rows & Specialty Styles. Confirm this isn't a duplicate/conflicting listing.
8. **Nail service copy** — the nail menu currently uses generic names like "Spring Luxe Pedicure" pulled from the client's existing VDIT booking system export. Confirm whether to keep this naming or rebrand it to match Bougie Hair & Beauty's voice.
9. ~~**Payment provider**~~ — **Resolved: Stripe.** Firebase + Brevo cover hosting/auth/email, but not payments. Stripe is the standard UK choice (1.5% + 20p per online transaction, no monthly fee) and has an official Firebase Extension ("Run Payments with Stripe") that integrates directly with Firestore/Cloud Functions — the natural fit for this stack. (Note: Paystack, used in Ghana, is owned by Stripe but serves African markets only — not usable for UK transactions.)
10. **Database choice** — confirm Firestore vs. Realtime Database for the Firebase project.
11. **Admin auth model** — confirm login method for staff/owner (email+password via Firebase Auth, custom claims for admin role, etc.) and whether multiple staff accounts are needed.
12. *(Message was cut off after "the company" — flag with client in case there was a follow-up point about the company/entity name, registration, or similar that didn't come through.)*

---

## 9. Files in This Package

- `bougie-hair-beauty-project-brief.md` — this document
- `services.json` — full structured service catalog (23 categories, 130 services) with `name`, `duration_minutes`, `price_gbp`, `price_type` (fixed/starting), and `notes` per service — ready to seed the booking system's service data
