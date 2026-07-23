/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-primary)",
          secondary: "var(--color-secondary)",
          accent: "var(--color-accent)",
          textPrimary: "var(--color-text-primary)",
          textSecondary: "var(--color-text-secondary)",
        },
        bougie: {
          cream: "#FAFAF7", // Alabaster/Warm Ivory
          espresso: "#4A3B32", // Toned down: Softer Mocha/Truffle
          pink: "#E6127E", // Company's Signature Pink
          rose: "#F28CBA", // Mid-tone soft pink
          blush: "#FDF5F8", // Extremely light blush pink for backgrounds
          taupe: "#8B7355", // Warm Taupe
          champagne: "#D4AF37", // Champagne Gold
        },
        luxe: {
          blush: "#FBF3F4", // The soft background color from mockup
          plum: "#8A6B75", // The button and accent color
          plumDark: "#745862", // Hover state for plum
          dark: "#2C2A2A", // The main text color
          sand: "#EAE0DF", // Light borders and cards
        },
      },
      fontFamily: {
        brand: ["var(--font-brand)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
