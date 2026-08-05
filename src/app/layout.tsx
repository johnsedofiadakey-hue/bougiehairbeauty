import type { Metadata } from "next";
import "./globals.css";
export const dynamic = 'force-dynamic';
import { readStore } from "@/lib/data-store";
import { getBaseUrl } from "@/lib/email";
import { Providers } from "@/components/Providers";

export async function generateMetadata(): Promise<Metadata> {
  let settings;
  try {
    settings = (await readStore()).settings;
  } catch (e) {}

  const title = settings?.companyName || "Bougie Hair & Beauty | Hair, Wigs, Lash, Spa & Nails";
  const description = settings?.heroSubtitle || "Braiding, wigs, lash extensions, a Japanese head spa & a full nail bar — book online in minutes.";
  // The link-preview image (WhatsApp/iMessage/Facebook/etc.) is deliberately
  // separate from the logo/favicon — a small round logo makes a poor share
  // card. Falls back to the hero photo, then the logo, if no dedicated
  // share image has been uploaded. Needs an absolute URL per the OG spec.
  const shareImagePath = settings?.ogImage || settings?.heroImage || settings?.logoUrl;
  const shareImageUrl = shareImagePath
    ? (shareImagePath.startsWith("http") ? shareImagePath : `${getBaseUrl()}${shareImagePath}`)
    : undefined;

  return {
    title,
    description,
    manifest: "/manifest.json",
    ...(settings?.logoUrl && {
      icons: {
        icon: settings.logoUrl,
        shortcut: settings.logoUrl,
        apple: settings.logoUrl,
      },
    }),
    appleWebApp: {
      capable: true,
      title: settings?.companyName || "Bougie Hair & Beauty",
      statusBarStyle: "black-translucent",
    },
    ...(shareImageUrl && {
      openGraph: {
        title,
        description,
        siteName: settings?.companyName || "Bougie Hair & Beauty",
        images: [{ url: shareImageUrl, width: 1200, height: 1200, alt: title }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [shareImageUrl],
      },
    }),
  };
}

export async function generateViewport(): Promise<any> {
  let settings;
  try {
    settings = (await readStore()).settings;
  } catch (e) {}

  return {
    themeColor: settings?.primaryColor || "#4A3B32",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings;
  try {
    settings = (await readStore()).settings;
  } catch (e) {}

  const themeSettings = settings || {
    primaryColor: '#4A3B32', // Mocha
    secondaryColor: '#E6127E', // Pink
    accentColor: '#D4AF37',
    textPrimaryColor: '#4A3B32',
    textSecondaryColor: '#8B7355', // Taupe
    fontFamily: 'Inter'
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:wght@300;400;500;600;700&family=Alex+Brush&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary: ${themeSettings.primaryColor};
            --color-secondary: ${themeSettings.secondaryColor};
            --color-accent: ${themeSettings.accentColor};
            --color-text-primary: ${themeSettings.textPrimaryColor || '#18181b'};
            --color-text-secondary: ${themeSettings.textSecondaryColor || '#71717a'};
            --font-brand: "Playfair Display", "Georgia", serif;
            --font-serif: "Playfair Display", "Georgia", serif;
            --font-body: "Poppins", sans-serif;
            --font-cursive: "Alex Brush", cursive;
          }
        `}} />
        {settings?.logoUrl && <link rel="apple-touch-icon" href={settings.logoUrl} />}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-[family-name:var(--font-body)] bg-luxe-blush text-[var(--color-text-primary)] antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
