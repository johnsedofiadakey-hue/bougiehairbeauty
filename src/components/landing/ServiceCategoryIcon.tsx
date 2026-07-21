// Hand-drawn minimal line-art icons for the service catalog's categories.
// Kept as inline SVG (not photos) so a long itemized menu stays visually
// consistent and on-brand without needing per-item photography — see
// components/landing/Services.tsx and app/booking/page.tsx.

type IconProps = { className?: string };

function WaxingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3c2.5 3.5 5 6.8 5 9.8a5 5 0 1 1-10 0C7 9.8 9.5 6.5 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9.5 14c0 1.4 1 2.3 2.2 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LashesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 14c3-4 6-5.5 9-5.5s6 1.5 9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="14" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.5 5 8M9.5 8.8l-.6-2.5M14.5 8.8l.6-2.5M18 10.5l1-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BrowsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 13c1.5-3.5 4.2-5.3 7-5.3s5.7 1.6 7 3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M4.5 16c1.3-2.2 3.4-3.5 6.2-3.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function LipsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 11c1.8-2 3.6-2.6 5-1.4 1 .9 2 1.1 3 0 1.4-1.2 3.2-.6 5 1.4-1.5 1-2.3 1.8-3.5 1.8-1 0-1.7-.6-2.5-.6-.8 0-1.5.6-2.5.6-1.2 0-2-.8-4.5-1.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6 13.2c2 2.6 10 2.6 12 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function TeethIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 5c-1.6-1.3-3.5-1.5-4.8-.3C5.8 5.9 5.5 8.2 6 10.5c.4 2 1.2 5.4 2.6 5.4.9 0 1-1.8 1.4-3 .3-.9.6-1.4 2-1.4s1.7.5 2 1.4c.4 1.2.5 3 1.4 3 1.4 0 2.2-3.4 2.6-5.4.5-2.3.2-4.6-1.2-5.8C15.5 3.5 13.6 3.7 12 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M18.5 5.5 20 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function FacialIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 4.5c3.6 0 6 2.9 6 6.8 0 4.3-2.8 8.2-6 8.2s-6-3.9-6-8.2c0-3.9 2.4-6.8 6-6.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M19 8l1.4-1M19 15l1.4 1M5 8 3.6 7M5 15l-1.4 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function SkinTagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5c.6 3.4 1.6 4.4 5 5-3.4.6-4.4 1.6-5 5-.6-3.4-1.6-4.4-5-5 3.4-.6 4.4-1.6 5-5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  "Waxing": WaxingIcon,
  "Lashes": LashesIcon,
  "Brows": BrowsIcon,
  "Lips": LipsIcon,
  "Teeth Whitening": TeethIcon,
  "Facials": FacialIcon,
  "Skin Tag Removal": SkinTagIcon,
};

export function ServiceCategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = CATEGORY_ICONS[category] || SparkleIcon;
  return <Icon className={className} />;
}
