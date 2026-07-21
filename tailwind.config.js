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
      },
      fontFamily: {
        brand: ["var(--font-brand)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
