# Handover Note — Bougie Hair & Beauty Website + Booking System

Last updated: 2026-07-21. Written mid-session so any agent (or human) can pick this up cold. **All 8 tracked tasks are now complete** — see §7 for status and §6 for what's genuinely still open (this is now a "here's where things stand" doc, not just a mid-flight snapshot). This codebase has NOT been pushed anywhere — it's a local git repo only, one commit, no remote.

## 1. What we're building

A website + online booking system for **Bougie Hair & Beauty**, a real salon at 41 Crouch Street, Colchester, UK. Full spec is in [`bougie-hair-beauty-project-brief.md`](bougie-hair-beauty-project-brief.md) — read that first for business context (five departments: Hair braiding/extensions, Wigs/frontals, Lash extensions, Head spa, Nails; 130 services in [`services.json`](services.json); deposit/booking policies; open questions for the client).

**This is being built as a standalone project** — new repo, new Firebase project, new Stripe account, all separate from any other project. The client explicitly asked that nothing link back to a prior project (see §2).

## 2. Where this codebase came from — important context

The starting point was a downloaded template at `~/Downloads/cosmetology-main` (a generic "beauty-studio" Next.js template, apparently built for a *different, real* Ghanaian business called "LOÙ Beauty Hub" — it had that business's actual Firebase project credentials, logo (with the LOU wordmark baked into the image), Paystack payment integration, GH₵ currency, and Ghana phone formats hardcoded into it).

**The user's explicit instruction:** make sure nothing from that original project carries over — no shared git history, no shared Firebase project, no leftover branding/credentials. This session has been systematically decoupling the template from its origin and rebranding it for Bougie. This is why so much of the work so far has been "find every place the old brand/region leaked in and replace it," not just normal feature dev.

**Verify this is still true before trusting old context**: run `grep -rniE "loubeautyhub|LOÙ|paystack|GH₵|cosmetologysystem|ghana|accra|stormglide" --include="*.ts" --include="*.tsx" --include="*.json" .` from the repo root (excluding `node_modules`, `package-lock.json`, `docs/`) — should return nothing. If it does, that's a regression, fix it before anything else.

## 3. Real architecture (discovered, not assumed — read this before changing data-layer code)

The template *looks* like it has three possible data layers, but only one is real:

- **Prisma + PostgreSQL** (`prisma/schema.prisma`, `prisma/seed.js`) — **was dead code**, zero API routes imported `@prisma/client`. **Already deleted** this session (see §4, task 6). Don't reintroduce it without a reason.
- **Firestore** — not used at all, despite the original project brief assuming Firestore. Don't assume it exists.
- **A single JSON document in Firebase Cloud Storage** (`app-state/store.json`) — **this is the actual live data store**. Read/written via [`src/lib/data-store.ts`](../src/lib/data-store.ts) (`readStore()` / `updateStore()`), backed by [`src/lib/firebase-admin.ts`](../src/lib/firebase-admin.ts). It has optimistic-concurrency handling with a documented history of a real race-condition bug (see the comment in `firebase-admin.ts`) — don't casually rewrite the retry logic without understanding why `autoRetry: false` is set.

**Auth is a hybrid**, not pure Firestore/Phone-OTP as the original brief assumed:
- Firebase Auth handles **phone OTP** verification (client-side, then `admin.auth().verifyIdToken()` server-side in [`src/lib/auth.ts`](../src/lib/auth.ts)).
- **NextAuth** (credentials provider, JWT strategy) issues the actual session on top of that — see `authOptions` in the same file. Admin/staff login is separate: email+password checked against the same JSON store's `users` array via bcrypt.

All 15 API routes under `src/app/api/` use `data-store.ts`, confirmed via grep — none use Prisma. This was confirmed with the user (see decision log below) and is the accepted architecture going forward — **don't migrate to real Firestore or Postgres unless the user asks again**.

## 4. What's been done this session (in order)

1. Copied the template's files (excluding `.git`, `node_modules`, `.next`) into this repo, restructured so the Next.js app lives at the repo root and the planning docs (`bougie-hair-beauty-project-brief.md`, `services.json`) live in `docs/`.
2. **Stripped the original client's live Firebase credentials** — `src/lib/firebase.ts` and `firebase-admin.ts` now read from `process.env.NEXT_PUBLIC_FIREBASE_*` instead of hardcoded values; `apphosting.yaml` env values replaced with `REPLACE_WITH_NEW_*` placeholders.
3. Surveyed and catalogued every Paystack/Ghana/old-brand reference (grep sweep).
4. **Paystack → Stripe**: `src/app/api/payments/paystack/initialize/route.ts` deleted, replaced with `src/app/api/payments/stripe/checkout/route.ts` (creates a Stripe Checkout Session in GBP, same "simulated" dev fallback behavior as before when `STRIPE_SECRET_KEY` is unset). Added `stripe` npm package. Renamed `paystackPublicKey` → `stripePublishableKey` and `momoNumber`/`momoName` → `bankDetails`/`bankAccountName` across `default-data.ts`, both settings API routes, the admin settings page, and the booking page.
   - **Important caveat**: the booking page's deposit flow was *already* a manual/DIY flow before this session touched it — it never actually called the payment-init endpoint. It just shows bank/policy details and requires a checkbox acknowledgment; a human manually verifies the deposit was paid. The new Stripe checkout route exists and is real, but **it is not yet wired into the booking page** (no redirect-to-Stripe-Checkout, no webhook to flip booking status). This is a genuine feature gap, not a bug — see §6 open item.
5. **Removed unused Prisma/Postgres scaffolding** entirely (`prisma/` directory, `src/lib/prisma.ts`, package.json deps/scripts, `DATABASE_URL` from `apphosting.yaml`).
6. **Rebranded defaults** in `src/lib/default-data.ts` and across ~15 components/pages: company name, contact info (real values from the brief: `bougiehairuk@gmail.com`, `07770 375859`, `41 Crouch Street, Colchester`), currency GH₵→£, color palette (blush pink `#F9DCE8` / espresso brown `#3E1D10` / hot pink `#E6127E` — read off the client's flyers, **not client-approved yet**, see brief §2), font Playfair Display/Outfit → **Inter** (per global CLAUDE.md standard — Satoshi wasn't used since it needs self-hosting and wasn't worth the risk this session).
   - **Deleted the old LOU-branded logo/icon files** (`public/logo.jpg`, `icon-192x192.png`, `icon-512x512.png`, `lou_beauty_hero_bg.png`) — the logo image had "LOÙ BEAUTY HUB" literally baked into the pixels. `logoUrl` now defaults to empty string; layout/footer/navbar all already handle a missing logo gracefully (fall back to text). **Bougie has no real logo yet** — this is an open item, see §6.
   - Left the other stock photos (`beauty_hero_bg.png`, `service_hair.png`, `service_nails.png`, `service_skin.png`) in place as generic placeholders — they have *fictional* brand props baked in (e.g. "AURA STUDIO" signage, "MAISON LUNA" bottle label) but aren't tied to any real business, so this was judged lower-stakes than the actual LOU logo. Still mismatched to Bougie's real aesthetic/services (spa/skincare photos, not braiding/nails) — real photos are pending from the client per the brief.
   - **Also found and deleted `src/app/icon.png` and `src/app/favicon.ico`** — these weren't caught by the initial `public/` sweep because Next.js App Router auto-detects reserved filenames (`icon.png`, `favicon.ico`) directly inside `src/app/` and uses them as the site favicon *regardless of what `layout.tsx`'s `metadata.icons` says*. Both were confirmed (by actually opening the image data) to have the same LOÙ Beauty Hub wordmark baked in. **Lesson for future sweeps**: a text/grep-only search will never catch branding baked into image pixels — you have to open image files with the Read tool to check them, not just grep filenames/text.
   - Renamed Ghana-specific phone helpers `normalizeGhanaPhone`/`stripGhanaPrefix` (+233 format) to `normalizeUKPhone`/`stripUKPrefix` (+44 format) in `src/lib/utils.ts`, updated both call sites (`src/app/portal/page.tsx`, `src/app/booking/page.tsx`).
   - Replaced fabricated Ghana-flavored testimonials in `src/components/landing/Testimonials.tsx` with placeholder UK-appropriate ones matching Bougie's actual services (braids/lash/nails instead of balayage/skin treatments) — still placeholder, not real reviews.
7. **In progress**: rebuilding `defaultServices` in `default-data.ts` from `docs/services.json`. A conversion script was written and run (scratchpad: `build-services.js`, output `defaultServices.generated.ts`), producing all 130 services / 23 categories correctly, and **this has already been spliced into `src/lib/default-data.ts`** (confirmed: brace-balanced, tail of file intact, old Waxing/Lashes/Brows/Lips/Teeth/Facials/Skin-Tag placeholder catalog is gone). What's left for this task:
   - "Starting" price-type services get a description prefix ("Starting price — final cost confirmed after consultation.") — done in the generated data.
   - Durations missing from `services.json` default to 60min (0min for the hair-extension add-ons category, since those aren't standalone appointments) — done, but **not client-confirmed**; several are flagged in the brief as likely-wrong placeholders carried over from the old booking system (Frontal Replacement Only = 10min, Wig Making = 1min, Wig Customisation = 5min, Japanese Head Spa = unspecified). These went into the seed data as-is with FLAG notes preserved in the `description` field — do not silently "fix" these numbers without the client's input.
   - **Not yet done**: actually running the app to confirm the seeded services render correctly in the admin panel and public Services page (no dev server has been started yet this session — `npm install` hasn't even been run against the edited `package.json`).
   - **Not yet done**: category→icon mapping in `src/components/landing/ServiceCategoryIcon.tsx` still only has entries for the old template's categories (Waxing/Lashes/Brows/Lips/Teeth Whitening/Facials/Skin Tag Removal) — none of Bougie's 23 real category names match, so every category will render the generic sparkle-icon fallback. Not broken, just visually flat. Worth a small enhancement pass (e.g. substring-match "Nail"/"Wig"/"Lash"/"Spa"/braid keywords to relevant icons) but was deferred as lower priority than getting the data right.

## 5. Decisions made with the user this session (don't re-litigate without cause)

- **Keep the template's Prisma+NextAuth framing** was the user's answer to an early question — but this was superseded once we discovered Prisma was dead code (see §3). The *actual* decision, confirmed after that discovery, was: **keep the Firebase-Storage-JSON-blob store, delete Prisma** (not migrate to real Firestore, not stand up real Postgres). This is settled — don't re-ask unless something changes materially.
- **Paystack → Stripe, currency → GBP, full UK rebrand**: explicitly requested ("swap everything to fit for the UK", "Swap Paystack for Stripe", "Swap currency/defaults to GBP").
- User wants **no linkage whatsoever** to the original template's source project — new repo, new Firebase account/project, new Stripe account. This has been the guiding constraint all session; see §2.

## 6. Open items / things to flag to the client (from the brief, still unresolved)

These are pre-existing open questions from `bougie-hair-beauty-project-brief.md` §8 — repeating the important ones here so they aren't lost:

1. **No real logo or brand hex codes** — current palette is estimated from flyer photos, needs client sign-off.
2. **Stripe Checkout isn't wired into the booking flow** — the route exists (`src/app/api/payments/stripe/checkout/route.ts`) but nothing calls it yet. The booking page still uses the old manual "bank transfer + policy acknowledgment" flow. Building the real redirect + webhook + booking-status-flip flow is a distinct, non-trivial feature task — flagged to the user as such, not yet scheped.
3. **Several service durations are known-placeholder values** carried over from the old booking system (see §4.7) — need real numbers from the client.
4. **Deposit is currently a flat 20% calculation in the booking UI** (`depositEstimate()` in `src/app/booking/page.tsx`) — the brief specifies a flat **£20** deposit, not a percentage. This wasn't changed this session (business-logic decision, not a rebrand/cleanup item) — flag to user before shipping.
5. Lash set naming mismatch, wig service durations, Japanese Head Spa duration, Boho/Goddess vs Fulani/Lemonade category overlap, nail service naming — all still open per the brief, unchanged.
6. `bougiehairuk.com` relationship (existing shop vs. new site domain) — still unconfirmed.
7. **Category→icon mapping wasn't done** — `src/components/landing/ServiceCategoryIcon.tsx` still only has hand-drawn icons for the old template's categories (Waxing/Lashes/Brows/Lips/Teeth Whitening/Facials/Skin Tag Removal). None of Bougie's 23 real category names match, so every category currently renders the generic sparkle-icon fallback. Not broken, just visually flat — a good small next task (e.g. substring-match "Nail"/"Wig"/"Lash"/"Spa"/braid keywords to a handful of new icons).
8. **`npm audit`**: started this session at 17 vulnerabilities (11 moderate, 5 high, 1 critical), all transitive deps of `firebase-admin`/`@google-cloud/storage`. Ran the non-breaking `npm audit fix`, which got it down to **10 moderate**, all still transitive deps of `firebase-admin` itself (fixing those fully would need `npm audit fix --force`, which bumps `firebase-admin` across a breaking major version — not done, since that needs actual testing against real Firebase credentials that don't exist yet). Re-run `npm audit` after the new Firebase project is wired up and real integration testing is possible.

## 7. Task list — final status (all complete)

1. ✅ Copy template into project directory, no git history
2. ✅ Strip original client's Firebase credentials
3. ✅ Survey template for all Ghana/Paystack/branding touch points
4. ✅ Replace Paystack with Stripe
5. ✅ Rebrand defaults to Bougie Hair & Beauty / GBP
6. ✅ Remove unused Prisma/Postgres scaffolding
7. ✅ **Rebuild defaultServices from services.json** — `npm install` run (had to correct the `stripe` package version, guessed `^18.6.0` didn't exist, corrected to `^22.3.2`), `npx tsc --noEmit` passes clean, dev server started and the booking page was screenshotted/verified live: all 23 categories present with correct option counts and correct "from £X" minimums matching `services.json` exactly. No console errors beyond a pre-existing unrelated Node `url.parse()` deprecation warning. Dev server was stopped after verification.
   - Along the way, fixed a real bug introduced by the credential-stripping in task 2: `src/lib/firebase-admin.ts`'s `storage.bucket(STORAGE_BUCKET)` call is **synchronous at module-import time** — passing `undefined` (or even `""`) throws before any caller's `try/catch` around `readStore()` can catch it, which broke every single page (they all import `data-store.ts` → `firebase-admin.ts` transitively). Fixed by falling back to a non-empty placeholder string (`"unconfigured-bucket.appspot.com"`) that doesn't point at any real project — the *real* failure (bucket doesn't exist) now correctly surfaces later as an awaited, catchable error inside `readStore()`/`updateStore()`, restoring the graceful-degradation behavior the pages were already designed around. **If you touch `firebase-admin.ts` again, remember this constructor validates eagerly — don't reintroduce a throw or an empty string at module scope.**
   - Created `.env.example` (not committed as a secret — it's all blank placeholders) documenting every env var the app needs; created a local-only `.env.local` with just a dev `NEXTAUTH_SECRET`/`NEXTAUTH_URL` so the dev server could boot without a real Firebase project (this file is gitignored, not committed).
   - Category-icon enhancement (mapping Bougie's 23 category names to relevant icons instead of the generic sparkle fallback) was **not done** — still a valid nice-to-have, not blocking.
8. ✅ **Init fresh git repo (no remote)** — `git init` run, `.gitignore` updated to also exclude `.claude/settings.local.json` (session-local tool permissions, shouldn't be versioned — `.claude/launch.json` *is* committed since it's real project config for the dev-server-launch skill). Staged everything, then **found two more LOU-branded image files that the earlier `public/` sweep missed** (`src/app/icon.png`, `src/app/favicon.ico` — see §4.6 above), deleted them before committing. Ran a secret-scan grep over the staged diff (API-key/token/password patterns) — clean. Single initial commit made (`b8bb7cd`). **No remote configured** — confirmed via `git remote -v` (empty output). Do not add one until the user gives you a real new repo URL.

## 8. Practical notes for continuing

- Working directory: `/Users/truth/Developer/project 399` (note the space in the path — always quote it in shell commands).
- No `node_modules` installed yet this session — run `npm install` before trying to run/typecheck.
- No dev server has been started yet — do that before claiming anything "works."
- The user's global CLAUDE.md standards apply: no truncated code, full copy-paste-ready blocks, clean/minimalist/lively UI, Satoshi/Inter fonts (we used Inter), B2B SaaS/Blue Ocean framing doesn't really apply here (this is a local salon site, not B2B SaaS) — use judgment, that instruction was written for a different kind of project.
- When creating the new Firebase project and Stripe account, all `REPLACE_WITH_NEW_*` placeholders in `apphosting.yaml` and empty env vars need real values — grep for `REPLACE_WITH_NEW` to find them all.
