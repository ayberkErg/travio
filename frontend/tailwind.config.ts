import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "off-white": "var(--off-white)",
        "stone-50": "var(--stone-50)",
        "stone-100": "var(--stone-100)",
        "stone-200": "var(--stone-200)",
        "stone-500": "var(--stone-500)",
        "stone-700": "var(--stone-700)",
        ink: "var(--ink)",
        amber: "var(--amber)",
        "amber-light": "var(--amber-light)",
        "amber-mid": "var(--amber-mid)",
        "amber-dark": "var(--amber-dark)",
        teal: "var(--teal)",
        "teal-light": "var(--teal-light)",
        coral: "var(--coral)",
        "coral-light": "var(--coral-light)",
        violet: "var(--violet)",
        "violet-light": "var(--violet-light)",
        emerald: "var(--emerald)",
        "emerald-light": "var(--emerald-light)",
        sky: "var(--sky)",
        "sky-light": "var(--sky-light)",
      },
      fontFamily: {
        serif: "var(--font-serif)",
        sans: "var(--font-sans)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        pill: "9999px",
      },
      fontSize: {
        "2xs": "0.65rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 16px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.06)",
        amber: "0 4px 14px 0 rgb(232 147 10 / 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
