import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Manrope", "sans-serif"],
        accent: ["Cinzel", "serif"],
      },
      colors: {
        "royal-plum": "#5D1824",
        "raw-silk": "#F5F2EB",
        "zari-gold": "#D4AF37",
        "silk-border": "#E5E0D8",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        primary: {
          DEFAULT: "#5D1824",
          foreground: "#F5F2EB",
        },

        secondary: {
          DEFAULT: "#F5F2EB",
          foreground: "#2A2A2A",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "#D4AF37",
          foreground: "#2A2A2A",
        },

        destructive: {
          DEFAULT: "#8B0000",
          foreground: "#F5F2EB",
        },

        border: "#E5E0D8",
        input: "#E5E0D8",
        ring: "#D4AF37",
      },

      boxShadow: {
        card: "0 4px 20px -2px rgba(93, 24, 36, 0.08)",
        "card-hover": "0 10px 30px -4px rgba(93, 24, 36, 0.12)",
        dropdown: "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
      },

      borderRadius: {
        lg: "8px",
        md: "4px",
        sm: "2px",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
