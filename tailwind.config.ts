import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
      },
      fontFamily: {
        heading: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.8)", boxShadow: "0 0 0 0 rgba(0, 229, 204, 0.7)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 20px rgba(0, 229, 204, 0)" },
          "100%": { transform: "scale(0.8)", boxShadow: "0 0 0 0 rgba(0, 229, 204, 0)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 2s infinite cubic-bezier(0.66, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
