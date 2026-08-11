// Bougie Hair & Beauty placeholder palette, read off the client's two
// price-list flyers (see docs/bougie-hair-beauty-project-brief.md §2) — no
// logo file or official hex codes were supplied yet, so this is a starting
// point pending client sign-off. primaryColor is the hot-pink/magenta script
// accent from the flyers, used sparingly for CTAs/active states; secondaryColor
// is the dominant wallpaper (warm ivory, not pink, so pink reads as an accent
// rather than the whole site's background); accentColor is a warm gold/champagne
// used for small details, dividers and icon chips; textPrimaryColor keeps the
// deep espresso brown from the flyers for headings; textSecondaryColor is a
// muted derivative of that brown for lower-emphasis copy.
export const defaultSettings = {
  id: 1,
  companyName: "Bougie Hair & Beauty",
  logoUrl: "/logo.png",
  // Shown as the preview image when a link to the site is shared on social
  // media / messaging apps (WhatsApp, iMessage, Facebook, etc.) — distinct
  // from the logo/favicon, since a small round logo makes a poor share-card
  // image. Falls back to the hero photo, then the logo, if unset.
  ogImage: "",
  primaryColor: "#E6127E",
  secondaryColor: "#FAF3E7",
  accentColor: "#D4AF37",
  textPrimaryColor: "#3E1D10",
  textSecondaryColor: "#6B5850",
  fontFamily: "Inter",
  heroTitle: "Hair, Wigs, Lashes, Spa & Nails — All Under One Roof",
  heroSubtitle: "Braiding, wigs, lash extensions, a Japanese head spa & a full nail bar — book online in minutes.",
  heroImage: "/hero_model_2.jpg",
  heroVideoUrl: "",
  heroMediaType: "image",
  // The Hero's floating stats widget — kept genuinely editable rather than
  // hardcoded, since made-up numbers ("500+ clients", "15+ stylists") would
  // be a false claim for a real, currently solo-run studio. Defaults are
  // deliberately true today (5 real departments, 130 real services) rather
  // than impressive-sounding placeholders.
  heroStatOneValue: "5",
  heroStatOneLabel: "Specialties",
  heroStatTwoValue: "130+",
  heroStatTwoLabel: "Treatments",
  heroStatThreeValue: "100%",
  heroStatThreeLabel: "Personalised Care",
  // Single-stylist team page (/stylists) — Bougie is currently a solo studio,
  // so this is one real card, not a fabricated "our team" grid. Photo starts
  // blank (renders a placeholder) until the client uploads a real one.
  stylistName: "Bougie Hair & Beauty",
  stylistTitle: "Owner & Lead Specialist",
  stylistBio: "Hair braiding, wigs, lash extensions, head spa & nails — every appointment at Bougie is done personally, start to finish.",
  stylistImage: "",
  // "Our Story" — the short homepage teaser plus the full elaborated
  // version on the dedicated /about page. aboutBody supports blank-line
  // separated paragraphs. Placeholder copy — swap for the client's own voice
  // once supplied.
  aboutHeading: "Our Story",
  aboutImage: "/service_hair.png",
  aboutIntro: "Bougie Hair & Beauty is a full-service salon in the heart of Colchester, built around care, craft, and confidence.",
  aboutBody: "Bougie Hair & Beauty brings hair braiding, wig construction, lash extensions, a Japanese head spa, and a full nail bar together under one roof at 41 Crouch Street, Colchester.\n\nWhether you're booking a fresh set of knotless braids, a custom frontal unit, a lash refresh, or a full nail bar visit, every appointment is built around the same standard of care and craft.",
  aboutBadgeNumber: "5",
  aboutBadgeLabel: "Service Departments — Hair, Wigs, Lash, Spa & Nails",
  contactEmail: "bougiehairuk@gmail.com",
  contactPhone: "07770 375859",
  address: "41 Crouch Street, Colchester",
  // Derived from contactPhone (no separate WhatsApp number was supplied) —
  // confirm with the client whether WhatsApp bookings should route elsewhere.
  whatsappNumber: "447770375859",
  instagramUrl: "https://instagram.com/bougiehair_",
  facebookUrl: "",
  tiktokUrl: "https://tiktok.com/@bougiehairuk",
  youtubeUrl: "",
  twitterUrl: "",
  currencySymbol: "£",
  stripePublishableKey: "",
  // Stripe Checkout isn't wired into the booking flow yet, so a deposit
  // requirement doesn't charge online — it shows the policy below and bank
  // transfer instructions instead, and the appointment is confirmed pending
  // manual deposit verification by the salon.
  requireDeposit: false,
  bankDetails: "",
  bankAccountName: "",
  bookingPolicy: "A £20 non-refundable deposit is required to secure your appointment. This deposit will be deducted from the total cost of your service.\n\nHair extensions are not included in braid/twist pricing unless stated. Please arrive with hair freshly washed and blow-dried.\n\nPrices may vary depending on hair length and thickness.\n\nFor wig, frontal, or closure services: hair or closures must be dropped off at least 5 days before your appointment (10 days if ordering hair from the salon), or a £10 late fee applies.\n\nForeign lash infills require at least 50% of your existing lashes to remain — otherwise the service will be charged as a full set.\n\nBy booking an appointment with us, you acknowledge and agree to this policy.",
  enableOTP: true,
  // Firebase email-link (passwordless) sign-in — a second portal login
  // option alongside phone+OTP, using the same Firebase-verified identity
  // path (see src/lib/auth.ts). Independent toggle from enableOTP since a
  // salon may want one, both, or neither.
  enableEmailLink: true,
  // Site lockdown / maintenance mode. When lockdownEnabled is true, the whole
  // public site is replaced by a branded "we're taking a break" screen (see
  // components/landing/Lockdown.tsx); the admin panel and login stay open.
  // Copy is editable in Admin → Settings → Site Lockdown. (A SITE_LOCKDOWN env
  // var provides the same lock independently of this stored flag, for when the
  // store itself is unavailable.)
  lockdownEnabled: false,
  lockdownEyebrow: "A moment, please",
  lockdownTitle: "We're taking a short break",
  lockdownMessage:
    "Our website is having a little pampering of its own. We'll be back and booking beautiful appointments very soon.\n\nIn the meantime, we'd still love to hear from you — reach us directly using the details below.",
  updatedAt: new Date(0).toISOString(),
};

// Full catalog seeded from docs/services.json (Bougie Hair & Beauty's
// braid/wig/lash/spa/nail price lists — 130 services, 23 categories). Several
// entries carry a 'Starting price' description where docs/services.json
// marks price_type: starting (design/length-dependent, final price confirmed
// manually) — see docs/bougie-hair-beauty-project-brief.md §5. Durations
// missing from the source flyers default to 60min pending client
// confirmation (flagged per-service where the brief calls out a placeholder).
export const defaultServices = [
  { id: "hair-extensions-add-on-pricing--3-pieces", name: "3 Pieces", description: "", price: 14, duration: 0, category: "Hair Extensions (Add-on Pricing)", image: "", materials: [] },
  { id: "hair-extensions-add-on-pricing--4-pieces", name: "4 Pieces", description: "", price: 18, duration: 0, category: "Hair Extensions (Add-on Pricing)", image: "", materials: [] },
  { id: "hair-extensions-add-on-pricing--5-pieces", name: "5 Pieces", description: "", price: 22, duration: 0, category: "Hair Extensions (Add-on Pricing)", image: "", materials: [] },
  { id: "hair-extensions-add-on-pricing--6-pieces", name: "6 Pieces", description: "", price: 25, duration: 0, category: "Hair Extensions (Add-on Pricing)", image: "", materials: [] },
  { id: "box-braids-knotless-twists--small-shoulder-length", name: "Small — Shoulder Length", description: "", price: 85, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--small-mid-back-length", name: "Small — Mid Back Length", description: "", price: 95, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--small-waist-length", name: "Small — Waist Length", description: "", price: 110, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--small-buttknee-length", name: "Small — Butt/Knee Length", description: "", price: 125, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--medium-shoulder-length", name: "Medium — Shoulder Length", description: "", price: 75, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--medium-mid-back-length", name: "Medium — Mid Back Length", description: "", price: 85, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--medium-waist-length", name: "Medium — Waist Length", description: "", price: 95, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--medium-buttknee-length", name: "Medium — Butt/Knee Length", description: "", price: 110, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--large-shoulder-length", name: "Large — Shoulder Length", description: "", price: 65, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--large-mid-back-length", name: "Large — Mid Back Length", description: "", price: 75, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--large-waist-length", name: "Large — Waist Length", description: "", price: 85, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--large-buttknee-length", name: "Large — Butt/Knee Length", description: "", price: 95, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--jumbo-shoulder-length", name: "Jumbo — Shoulder Length", description: "", price: 50, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--jumbo-mid-back-length", name: "Jumbo — Mid Back Length", description: "", price: 60, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--jumbo-waist-length", name: "Jumbo — Waist Length", description: "", price: 70, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "box-braids-knotless-twists--jumbo-buttknee-length", name: "Jumbo — Butt/Knee Length", description: "", price: 80, duration: 60, category: "Box Braids · Knotless · Twists", image: "", materials: [] },
  { id: "boho-goddess-braids--boho-braids-medium-length", name: "Boho Braids — Medium Length", description: "", price: 130, duration: 60, category: "Boho · Goddess Braids", image: "", materials: [] },
  { id: "boho-goddess-braids--boho-braids-waist-length", name: "Boho Braids — Waist Length", description: "", price: 150, duration: 60, category: "Boho · Goddess Braids", image: "", materials: [] },
  { id: "boho-goddess-braids--boho-braids-bum-length", name: "Boho Braids — Bum Length", description: "", price: 175, duration: 60, category: "Boho · Goddess Braids", image: "", materials: [] },
  { id: "boho-goddess-braids--goddess-braids-small-length", name: "Goddess Braids — Small Length", description: "", price: 110, duration: 60, category: "Boho · Goddess Braids", image: "", materials: [] },
  { id: "boho-goddess-braids--goddess-braids-medium-length", name: "Goddess Braids — Medium Length", description: "", price: 90, duration: 60, category: "Boho · Goddess Braids", image: "", materials: [] },
  { id: "boho-goddess-braids--goddess-braids-large-length", name: "Goddess Braids — Large Length", description: "", price: 75, duration: 60, category: "Boho · Goddess Braids", image: "", materials: [] },
  { id: "corn-rows-specialty-styles--fulani-braids", name: "Fulani Braids", description: "Starting price — final cost confirmed after consultation.", price: 95, duration: 60, category: "Corn Rows & Specialty Styles", image: "", materials: [] },
  { id: "corn-rows-specialty-styles--lemonade-braids", name: "Lemonade Braids", description: "Starting price — final cost confirmed after consultation.", price: 85, duration: 60, category: "Corn Rows & Specialty Styles", image: "", materials: [] },
  { id: "corn-rows-specialty-styles--island-twist", name: "Island Twist", description: "Starting price — final cost confirmed after consultation.", price: 90, duration: 60, category: "Corn Rows & Specialty Styles", image: "", materials: [] },
  { id: "corn-rows-specialty-styles--natural-cornrows", name: "Natural Cornrows", description: "Starting price — final cost confirmed after consultation.", price: 35, duration: 60, category: "Corn Rows & Specialty Styles", image: "", materials: [] },
  { id: "corn-rows-specialty-styles--invisible-locs-crochet-locs", name: "Invisible Locs / Crochet Locs", description: "Starting price — final cost confirmed after consultation.", price: 85, duration: 60, category: "Corn Rows & Specialty Styles", image: "", materials: [] },
  { id: "corn-rows-specialty-styles--french-curls", name: "French Curls", description: "Starting price — final cost confirmed after consultation.", price: 100, duration: 60, category: "Corn Rows & Specialty Styles", image: "", materials: [] },
  { id: "corn-rows-specialty-styles--kinky-twist-medium", name: "Kinky Twist (Medium)", description: "", price: 80, duration: 60, category: "Corn Rows & Specialty Styles", image: "", materials: [] },
  { id: "corn-rows-specialty-styles--mini-twist", name: "Mini Twist", description: "Starting price — final cost confirmed after consultation.", price: 70, duration: 60, category: "Corn Rows & Specialty Styles", image: "", materials: [] },
  { id: "corn-rows-specialty-styles--wig-revamp-styling", name: "Wig Revamp & Styling", description: "", price: 45, duration: 60, category: "Corn Rows & Specialty Styles", image: "", materials: [] },
  { id: "extras-add-ons--curls-add-on", name: "Curls Add-on", description: "", price: 15, duration: 60, category: "Extras & Add-ons", image: "", materials: [] },
  { id: "extras-add-ons--beads", name: "Beads", description: "", price: 5, duration: 60, category: "Extras & Add-ons", image: "", materials: [] },
  { id: "extras-add-ons--under-wig-cornrows", name: "Under Wig Cornrows", description: "", price: 25, duration: 60, category: "Extras & Add-ons", image: "", materials: [] },
  { id: "extras-add-ons--natural-hair-twist", name: "Natural Hair Twist", description: "", price: 35, duration: 60, category: "Extras & Add-ons", image: "", materials: [] },
  { id: "extras-add-ons--blow-dry", name: "Blow Dry", description: "", price: 10, duration: 60, category: "Extras & Add-ons", image: "", materials: [] },
  { id: "extras-add-ons--extra-small-parts", name: "Extra Small Parts", description: "", price: 15, duration: 60, category: "Extras & Add-ons", image: "", materials: [] },
  { id: "wigs-frontal-services--frontal-ponytail", name: "Frontal Ponytail", description: "Client provides: 1 bundle for a bun (14–16in), 2 bundles for a ponytail, 14–16in 13x6 HD frontal only. No transparent lace / dense frontals. Hair must be freshly washed and completely product-free.", price: 80, duration: 240, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "wigs-frontal-services--hair-included-frontal-ponytail", name: "Hair Included Frontal Ponytail", description: "Includes ponytail installation, 2x20in bundles (longer lengths available as paid add-on), 14in 13x6 HD frontal only. Hair must be freshly washed and completely product-free.", price: 280, duration: 240, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "wigs-frontal-services--custom-frontal-unit", name: "Custom Frontal Unit", description: "Includes bleaching, wig construction (bundles + frontal sewn onto dome mesh cap), customisation, installation, styling. Head measurements required. Hair must be sent 5 days before appointment or a £10 fee applies. If purchasing hair from the salon, book slot a minimum of 10 days in advance. (Source listing was titled 'Costum Frontal Unit' — likely a typo for 'Custom'.)", price: 100, duration: 180, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "wigs-frontal-services--frontal-replacement-with-installation", name: "Frontal Replacement With Installation", description: "Replacement of frontal/closure unit + installation. Wig/bundle revamp available as a separate add-on.", price: 85, duration: 180, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "wigs-frontal-services--pre-made-frontalclosure-factory-made", name: "Pre-Made Frontal/Closure (Factory Made)", description: "Includes install, bleaching knots, plucking, basic styling.", price: 65, duration: 180, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "wigs-frontal-services--frontal-replacement-only", name: "Frontal Replacement Only", description: "Frontal replacement only. Wig revamp available as add-on. FLAG: 10-minute duration seems too short for the described work — confirm actual time needed with client.", price: 25, duration: 10, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "wigs-frontal-services--wig-making-non-contact", name: "Wig Making (Non-Contact)", description: "Fits to exact head size. Lace/V/half wig, bundles or bundles+closure sewn onto dome mesh cap. Head measurements required. Drop off hair 5 days before pick-up. FLAG: 1-minute duration is almost certainly a placeholder/booking-slot artifact from the old system, not the real turnaround time — confirm real duration and whether £60 is a deposit or the full price.", price: 60, duration: 1, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "wigs-frontal-services--wig-customisation", name: "Wig Customisation", description: "Includes bleaching, plucking, basic styling. Choose a slot 5 days prior to pick-up time. Hair must be sent 5 days before appointment or a £10 fee applies. FLAG: 5-minute duration likely a placeholder — confirm real duration.", price: 45, duration: 5, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "wigs-frontal-services--closure-sew-in", name: "Closure Sew In", description: "Book for any type of closure sew in. Includes cornrows, weaving net, bleaching, plucking, lace installation/hair left out, basic styling. Client provides closure of chosen size + minimum 3 bundles. Closure must be dropped off 5 days before appointment or a £10 fee applies.", price: 90, duration: 300, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "wigs-frontal-services--custom-uvhalf-wig", name: "Custom U/V/Half Wig", description: "Construction of a U/V/half wig unit using client head measurements; installation and styling included; wig is reusable. Includes construction, cornrows, blending natural hair into extensions, basic styling. Hair must be dropped off 5 days before appointment. If ordering hair from the salon's collection, book a minimum of 10 days prior.", price: 75, duration: 120, category: "Wigs & Frontal Services", image: "", materials: [] },
  { id: "lash-extensions--bougie-set", name: "Bougie Set", description: "Dramatic mega-volume wispy set, up to 25MM. FLAG: source description refers to this style as 'Roman' — confirm correct service name/description with client.", price: 50, duration: 150, category: "Lash Extensions", image: "", materials: [] },
  { id: "lash-extensions--glam-set", name: "Glam Set", description: "Soft, natural everyday look with a subtle doll-eye effect. Not a cat-eye look — switching to cat-eye mid-appointment may change the price.", price: 50, duration: 150, category: "Lash Extensions", image: "", materials: [] },
  { id: "lash-extensions--foreign-infills", name: "Foreign Infills", description: "For infills on lash sets not originally done by Bougie Hair & Beauty. Client must have at least 50% of lashes remaining, otherwise charged as a full set.", price: 40, duration: 90, category: "Lash Extensions", image: "", materials: [] },
  { id: "lash-extensions--luxe-set", name: "Luxe Set", description: "Cat-eye volume set for an everyday look, up to 20MM. FLAG: source description refers to this style as 'the queen set' — confirm correct service name/description with client.", price: 50, duration: 150, category: "Lash Extensions", image: "", materials: [] },
  { id: "lash-extensions--infills", name: "Infills", description: "Infills for Bougie Hair & Beauty's own lash work.", price: 30, duration: 90, category: "Lash Extensions", image: "", materials: [] },
  { id: "spa--japanese-head-spa", name: "Japanese Head Spa", description: "FLAG: duration not specified in source material — confirm with client.", price: 50, duration: 60, category: "Spa", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-biab-on-natural-nails-with-french-tips", name: "Spring Luxe Pedicure — BIAB on Natural Nails with French Tips", description: "Price does not include removal.", price: 70, duration: 75, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-french-tips-2-big-toes-acrylic-or-biab", name: "Spring Luxe Pedicure — French Tips, 2 Big Toes Acrylic (or BIAB)", description: "Price does not include removal.", price: 61, duration: 60, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-gel-colour", name: "Spring Luxe Pedicure — Gel Colour", description: "Price does not include removal or Acrylic/BIAB on toe nails.", price: 50, duration: 50, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-gel-colour-2-big-toes-acrylic-or-biab", name: "Spring Luxe Pedicure — Gel Colour, 2 Big Toes Acrylic (or BIAB)", description: "Price does not include removal.", price: 56, duration: 55, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-no-colour", name: "Spring Luxe Pedicure — No Colour", description: "Price does not include removal or Acrylic/BIAB on toe nails.", price: 40, duration: 40, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-with-french-tips", name: "Spring Luxe Pedicure — With French Tips", description: "Price does not include removal or Acrylic/BIAB on toe nails.", price: 55, duration: 55, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-fullset-acrylic-or-biab-with-1-colour", name: "Spring Luxe Pedicure — Fullset Acrylic (or BIAB) with 1 Colour", description: "Price does not include removal.", price: 70, duration: 80, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-fullset-biabacrylic-french-tips", name: "Spring Luxe Pedicure — Fullset BIAB/Acrylic French Tips", description: "Price does not include removal.", price: 75, duration: 80, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-infill-acrylic-or-biab-with-1-colour", name: "Spring Luxe Pedicure — Infill Acrylic (or BIAB) with 1 Colour", description: "", price: 65, duration: 75, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-spring-luxe-pedicure--spring-luxe-pedicure-infill-acrylic-or-biab-with-french-tips", name: "Spring Luxe Pedicure — Infill Acrylic (or BIAB) with French Tips", description: "", price: 70, duration: 80, category: "Nails — Spring Luxe Pedicure", image: "", materials: [] },
  { id: "nails-biab-for-hand-nails--biab-extension-1-colour", name: "BIAB Extension 1 Colour", description: "Available for short and medium length only.", price: 39, duration: 60, category: "Nails — BIAB for Hand Nails", image: "", materials: [] },
  { id: "nails-biab-for-hand-nails--biab-extension-french-tips", name: "BIAB Extension French Tips", description: "", price: 44, duration: 60, category: "Nails — BIAB for Hand Nails", image: "", materials: [] },
  { id: "nails-biab-for-hand-nails--biab-infill-1-colour", name: "BIAB Infill 1 Colour", description: "", price: 34, duration: 45, category: "Nails — BIAB for Hand Nails", image: "", materials: [] },
  { id: "nails-biab-for-hand-nails--biab-infill-french-tips", name: "BIAB Infill French Tips", description: "", price: 39, duration: 60, category: "Nails — BIAB for Hand Nails", image: "", materials: [] },
  { id: "nails-biab-for-hand-nails--biab-on-natural-nails-1-colour", name: "BIAB on Natural Nails 1 Colour", description: "", price: 34, duration: 45, category: "Nails — BIAB for Hand Nails", image: "", materials: [] },
  { id: "nails-biab-for-hand-nails--biab-on-natural-nails-with-french-tips", name: "BIAB on Natural Nails with French Tips", description: "", price: 39, duration: 45, category: "Nails — BIAB for Hand Nails", image: "", materials: [] },
  { id: "nails-biab-for-toe-nails--2-big-toes-biab-and-1-gel-colour", name: "2 Big Toes BIAB and 1 Gel Colour", description: "", price: 29, duration: 30, category: "Nails — BIAB for Toe Nails", image: "", materials: [] },
  { id: "nails-biab-for-toe-nails--2-big-toes-biab-french-tips", name: "2 Big Toes BIAB French Tips", description: "", price: 34, duration: 45, category: "Nails — BIAB for Toe Nails", image: "", materials: [] },
  { id: "nails-biab-for-toe-nails--biab-overlay-toe-nails-1-colour", name: "BIAB Overlay Toe Nails 1 Colour", description: "", price: 34, duration: 45, category: "Nails — BIAB for Toe Nails", image: "", materials: [] },
  { id: "nails-biab-for-toe-nails--biab-overlay-with-french-tips", name: "BIAB Overlay with French Tips", description: "", price: 39, duration: 45, category: "Nails — BIAB for Toe Nails", image: "", materials: [] },
  { id: "nails-biab-for-toe-nails--fullset-biab-toe-1-colour", name: "Fullset BIAB Toe 1 Colour", description: "", price: 39, duration: 45, category: "Nails — BIAB for Toe Nails", image: "", materials: [] },
  { id: "nails-biab-for-toe-nails--fullset-biab-toes-with-french-tips", name: "Fullset BIAB Toes with French Tips", description: "", price: 44, duration: 60, category: "Nails — BIAB for Toe Nails", image: "", materials: [] },
  { id: "nails-biab-for-toe-nails--infill-biab-1-colour", name: "Infill BIAB 1 Colour", description: "", price: 34, duration: 45, category: "Nails — BIAB for Toe Nails", image: "", materials: [] },
  { id: "nails-biab-for-toe-nails--infill-biab-french-tips", name: "Infill BIAB French Tips", description: "", price: 39, duration: 60, category: "Nails — BIAB for Toe Nails", image: "", materials: [] },
  { id: "nails-fullset-1-colour-shortmedium-length--acrylic-fullset-1-colour", name: "Acrylic Fullset 1 Colour", description: "For short/medium length.", price: 35, duration: 45, category: "Nails — Fullset 1 Colour (Short/Medium Length)", image: "", materials: [] },
  { id: "nails-fullset-1-colour-shortmedium-length--removal-and-new-fullset-1-colour", name: "Removal and New Fullset 1 Colour", description: "", price: 40, duration: 60, category: "Nails — Fullset 1 Colour (Short/Medium Length)", image: "", materials: [] },
  { id: "nails-fullset-french-tips-shortmedium-length--fullset-french-tips", name: "Fullset French Tips", description: "For short/medium length.", price: 40, duration: 60, category: "Nails — Fullset French Tips (Short/Medium Length)", image: "", materials: [] },
  { id: "nails-fullset-french-tips-shortmedium-length--fullset-french-tips-with-removal", name: "Fullset French Tips with Removal", description: "For short/medium length.", price: 45, duration: 60, category: "Nails — Fullset French Tips (Short/Medium Length)", image: "", materials: [] },
  { id: "nails-fullset-designs-medium-to-xxl-length--fullset-designs", name: "Fullset Designs", description: "Starting price — final cost confirmed after consultation. Price varies by design. Client leaves design/length details in the comment box when booking.", price: 40, duration: 75, category: "Nails — Fullset Designs (Medium to XXL Length)", image: "", materials: [] },
  { id: "nails-fullset-designs-medium-to-xxl-length--removal-and-fullset-designs", name: "Removal and Fullset Designs", description: "Starting price — final cost confirmed after consultation. Price varies by design. Client leaves design/length details in the comment box when booking.", price: 45, duration: 90, category: "Nails — Fullset Designs (Medium to XXL Length)", image: "", materials: [] },
  { id: "nails-infill-one-colour-shortmedium-length--infill-1-gel-colour", name: "Infill 1 Gel Colour", description: "For gel colour infill, not colour powder.", price: 30, duration: 45, category: "Nails — Infill One Colour (Short/Medium Length)", image: "", materials: [] },
  { id: "nails-infill-one-colour-shortmedium-length--infill-changing-colour-powder", name: "Infill Changing Colour Powder", description: "", price: 35, duration: 45, category: "Nails — Infill One Colour (Short/Medium Length)", image: "", materials: [] },
  { id: "nails-infill-one-colour-shortmedium-length--infill-keep-the-same-colour-powder", name: "Infill Keep the Same Colour Powder", description: "", price: 30, duration: 45, category: "Nails — Infill One Colour (Short/Medium Length)", image: "", materials: [] },
  { id: "nails-infill-with-french-tips-shortmedium-length--infill-french-changing-colour-powder-base", name: "Infill French Changing Colour Powder Base", description: "", price: 40, duration: 60, category: "Nails — Infill with French Tips (Short/Medium Length)", image: "", materials: [] },
  { id: "nails-infill-with-french-tips-shortmedium-length--infill-french-keep-same-colour-powder", name: "Infill French Keep Same Colour Powder", description: "", price: 35, duration: 60, category: "Nails — Infill with French Tips (Short/Medium Length)", image: "", materials: [] },
  { id: "nails-shellac-on-hand--shellac-french-tips-on-natural-nails", name: "Shellac French Tips on Natural Nails", description: "", price: 28, duration: 30, category: "Nails — Shellac on Hand", image: "", materials: [] },
  { id: "nails-shellac-on-hand--shellac-french-tips-with-acrylic-or-biab-removal", name: "Shellac French Tips with Acrylic (or BIAB) Removal", description: "", price: 33, duration: 30, category: "Nails — Shellac on Hand", image: "", materials: [] },
  { id: "nails-shellac-on-hand--shellac-french-tips-with-old-shellac-removal", name: "Shellac French Tips with Old Shellac Removal", description: "", price: 31, duration: 30, category: "Nails — Shellac on Hand", image: "", materials: [] },
  { id: "nails-shellac-on-hand--shellac-on-natural-nails", name: "Shellac on Natural Nails", description: "", price: 23, duration: 30, category: "Nails — Shellac on Hand", image: "", materials: [] },
  { id: "nails-shellac-on-hand--shellac-one-colour-with-acrylic-or-biab-removal", name: "Shellac One Colour with Acrylic (or BIAB) Removal", description: "", price: 28, duration: 45, category: "Nails — Shellac on Hand", image: "", materials: [] },
  { id: "nails-shellac-on-hand--shellac-with-gel-removal", name: "Shellac with Gel Removal", description: "", price: 26, duration: 30, category: "Nails — Shellac on Hand", image: "", materials: [] },
  { id: "nails-shellacgel-on-toes--french-gel-on-toes", name: "French Gel on Toes", description: "", price: 28, duration: 30, category: "Nails — Shellac/Gel on Toes", image: "", materials: [] },
  { id: "nails-shellacgel-on-toes--french-gel-on-toes-with-acrylic-or-biab-removal", name: "French Gel on Toes with Acrylic (or BIAB) Removal", description: "", price: 33, duration: 30, category: "Nails — Shellac/Gel on Toes", image: "", materials: [] },
  { id: "nails-shellacgel-on-toes--french-gel-on-toes-with-old-gel-removal", name: "French Gel on Toes with Old Gel Removal", description: "", price: 31, duration: 30, category: "Nails — Shellac/Gel on Toes", image: "", materials: [] },
  { id: "nails-shellacgel-on-toes--gel-one-colour-on-toes-with-gel-removal", name: "Gel One Colour on Toes with Gel Removal", description: "", price: 26, duration: 30, category: "Nails — Shellac/Gel on Toes", image: "", materials: [] },
  { id: "nails-shellacgel-on-toes--gel-toes-with-acrylic-or-biab-removal", name: "Gel Toes with Acrylic (or BIAB) Removal", description: "", price: 28, duration: 30, category: "Nails — Shellac/Gel on Toes", image: "", materials: [] },
  { id: "nails-shellacgel-on-toes--new-gel-on-toe-nails", name: "New Gel on Toe Nails", description: "", price: 23, duration: 30, category: "Nails — Shellac/Gel on Toes", image: "", materials: [] },
  { id: "nails-acrylic-on-toes--fullset-on-toes-1-colour", name: "Fullset on Toes 1 Colour", description: "Price does not include removal.", price: 39, duration: 45, category: "Nails — Acrylic on Toes", image: "", materials: [] },
  { id: "nails-acrylic-on-toes--fullset-toe-french-tips", name: "Fullset Toe French Tips", description: "Price does not include removal.", price: 44, duration: 45, category: "Nails — Acrylic on Toes", image: "", materials: [] },
  { id: "nails-acrylic-on-toes--infill-toe-french-tips", name: "Infill Toe French Tips", description: "Price does not include removal.", price: 39, duration: 45, category: "Nails — Acrylic on Toes", image: "", materials: [] },
  { id: "nails-acrylic-on-toes--infill-toe-nails-one-colour", name: "Infill Toe Nails One Colour", description: "Price does not include removal.", price: 34, duration: 45, category: "Nails — Acrylic on Toes", image: "", materials: [] },
  { id: "nails-acrylic-on-toes--shellac-1-colour-2-big-toe-acrylic", name: "Shellac 1 Colour, 2 Big Toe Acrylic", description: "Price does not include removal.", price: 29, duration: 30, category: "Nails — Acrylic on Toes", image: "", materials: [] },
  { id: "nails-acrylic-on-toes--shellac-french-tips-two-big-toes-acrylic", name: "Shellac French Tips, Two Big Toes Acrylic", description: "Price does not include removal.", price: 34, duration: 45, category: "Nails — Acrylic on Toes", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--deluxe-pedicure-gel-colour", name: "Deluxe Pedicure — Gel Colour", description: "Price does not include removal or Acrylic/BIAB on toe nails.", price: 50, duration: 50, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--deluxe-pedicure-no-colour", name: "Deluxe Pedicure — No Colour", description: "Price does not include removal or Acrylic/BIAB on toe nails.", price: 40, duration: 45, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--deluxe-pedicure-with-french-tips", name: "Deluxe Pedicure — With French Tips", description: "Price does not include removal or Acrylic/BIAB on toe nails.", price: 55, duration: 60, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--pedicure-gel-french-tips-2-big-toes-acrylic-or-biab", name: "Pedicure — Gel French Tips, 2 Big Toes Acrylic (or BIAB)", description: "Price does not include removal.", price: 51, duration: 60, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--pedicure-shellac-french-tips", name: "Pedicure — Shellac French Tips", description: "Price does not include removal.", price: 45, duration: 45, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--pedicure-2-big-toes-acrylic-1-gel-colour", name: "Pedicure — 2 Big Toes Acrylic, 1 Gel Colour", description: "Price does not include removal.", price: 46, duration: 60, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--pedicure-fullset-acrylic-or-biab-with-1-colour", name: "Pedicure — Fullset Acrylic (or BIAB) with 1 Colour", description: "Price does not include removal.", price: 60, duration: 75, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--pedicure-fullset-biabacrylic-french-tips", name: "Pedicure — Fullset BIAB/Acrylic French Tips", description: "Price does not include removal.", price: 65, duration: 75, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--pedicure-infill-acrylic-or-biab-with-1-colour", name: "Pedicure — Infill Acrylic (or BIAB) with 1 Colour", description: "", price: 55, duration: 70, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--pedicure-infill-acrylic-or-biab-with-french-tips", name: "Pedicure — Infill Acrylic (or BIAB) with French Tips", description: "", price: 60, duration: 75, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--spa-pedicure-1-gel-colour", name: "Spa Pedicure — 1 Gel Colour", description: "Price does not include removal.", price: 40, duration: 45, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-pedicure-deluxe-spa--spa-pedicure-no-colour", name: "Spa Pedicure — No Colour", description: "Price does not include removal.", price: 30, duration: 30, category: "Nails — Pedicure (Deluxe & Spa)", image: "", materials: [] },
  { id: "nails-manicure--manicure-with-biab-1-colour", name: "Manicure with BIAB 1 Colour", description: "BIAB on natural nail, no extension.", price: 49, duration: 60, category: "Nails — Manicure", image: "", materials: [] },
  { id: "nails-manicure--manicure-with-biab-french-tips", name: "Manicure with BIAB French Tips", description: "On natural nails, no extension.", price: 54, duration: 60, category: "Nails — Manicure", image: "", materials: [] },
  { id: "nails-manicure--manicure-with-shellac-1-colour", name: "Manicure with Shellac 1 Colour", description: "", price: 38, duration: 40, category: "Nails — Manicure", image: "", materials: [] },
  { id: "nails-manicure--manicure-with-shellac-french-tips", name: "Manicure with Shellac French Tips", description: "", price: 43, duration: 40, category: "Nails — Manicure", image: "", materials: [] },
  { id: "nails-manicure--regular-manicure-no-colour", name: "Regular Manicure No Colour", description: "", price: 20, duration: 25, category: "Nails — Manicure", image: "", materials: [] },
  { id: "nails-removal-only--acrylic-or-biab-removal-only", name: "Acrylic (or BIAB) Removal Only", description: "", price: 12, duration: 15, category: "Nails — Removal Only", image: "", materials: [] },
  { id: "nails-removal-only--gel-removal-only", name: "Gel Removal Only", description: "", price: 10, duration: 10, category: "Nails — Removal Only", image: "", materials: [] },
  { id: "nails-custom-nails--fullset-or-infill-with-special-designs", name: "Fullset (or Infill) with Special Designs", description: "Starting price — final cost confirmed after consultation. Price and timing vary by design/length. Client leaves design, length, and any special requirements in the comment box when booking.", price: 40, duration: 75, category: "Nails — Custom Nails", image: "", materials: [] },
];

// No real stock data supplied yet — starts empty rather than inventing
// quantities; the admin can add inventory items via the Admin > Inventory UI.
export const defaultInventory: any[] = [];

// No seeded accounts. This is a live production deployment: the real owner
// account already lives in the store, and fabricating a login here — the
// old `admin123` admin was committed in plaintext-equivalent form, a genuine
// security hole — must never happen. If the store is ever wiped, accounts are
// (re)created through the admin UI, not resurrected from source.
export const defaultUsers: any[] = [];

// No fabricated clients. Real clients are created when they book / verify via
// Firebase; the store is the single source of truth.
export const defaultClients: any[] = [];

export const defaultStore = {
  settings: defaultSettings,
  services: defaultServices,
  inventory: defaultInventory,
  users: defaultUsers,
  clients: defaultClients,
  staff: [
    {
      id: "solo-staff-id",
      userId: "solo-owner-id",
      bio: "Braiding, wig, lash, spa & nail specialist at Bougie Hair & Beauty.",
      specialties: "Hair, Wigs, Lash, Spa, Nails",
      isActive: true,
    },
  ],
  appointments: [],
  formulations: [],
  portfolio: [],
  pushSubscriptions: [],
};
