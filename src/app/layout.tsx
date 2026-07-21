import type { Metadata } from "next";
import "./globals.css";
export const dynamic = 'force-dynamic';
import { readStore } from "@/lib/data-store";
import { Providers } from "@/components/Providers";

export async function generateMetadata(): Promise<Metadata> {
  let settings;
  try {
    settings = (await readStore()).settings;
  } catch (e) {}

  return {
    title: settings?.companyName || "Bougie Hair & Beauty | Hair, Wigs, Lash, Spa & Nails",
    description: settings?.heroSubtitle || "Braiding, wigs, lash extensions, a Japanese head spa & a full nail bar — book online in minutes.",
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
  };
}

export async function generateViewport(): Promise<any> {
  let settings;
  try {
    settings = (await readStore()).settings;
  } catch (e) {}

  return {
    themeColor: settings?.primaryColor || "#E6127E",
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
    primaryColor: '#E6127E',
    secondaryColor: '#F9DCE8',
    accentColor: '#3E1D10',
    textPrimaryColor: '#3E1D10',
    textSecondaryColor: '#6B5850',
    fontFamily: 'Inter'
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary: ${themeSettings.primaryColor};
            --color-secondary: ${themeSettings.secondaryColor};
            --color-accent: ${themeSettings.accentColor};
            --color-text-primary: ${themeSettings.textPrimaryColor || '#18181b'};
            --color-text-secondary: ${themeSettings.textSecondaryColor || '#71717a'};
            --font-brand: "Inter", sans-serif;
            --font-body: "Inter", sans-serif;
          }
        `}} />
        {settings?.logoUrl && <link rel="apple-touch-icon" href={settings.logoUrl} />}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-[family-name:var(--font-body)] bg-[var(--color-secondary)] text-[var(--color-text-primary)] antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
