import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-primary",
    "text-primary",
    "border-primary",
    "bg-primary/10",
    "bg-primary/20",
    "bg-primary/90",
    "hover:bg-primary/90",
    "hover:text-primary",
    "hover:border-primary",
    "focus:ring-primary",
    "focus:border-primary",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10B981",
        "accent-green": "#13ec5b",
        "background-light": "#F9FAFB",
        "background-dark": "#0A0A0A",
        "surface-dark": "#171717",
        "card-dark": "#1A1A1A",
        "text-dark-primary": "#FFFFFF",
        "text-dark-secondary": "#A1A1AA",
        "text-primary-dark": "#FFFFFF",
        "text-secondary-dark": "#A3A3A3",
        "border-dark": "rgba(255, 255, 255, 0.15)",
        "border-dark-light": "rgba(255, 255, 255, 0.15)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["Inter", "Sora", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
      },
    },
  },
  plugins: [],
};
export default config;

