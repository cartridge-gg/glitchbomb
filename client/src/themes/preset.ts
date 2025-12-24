import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import twAnimate from "tailwindcss-animate";

export const preset: Partial<Config> = {
  darkMode: "selector",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--green-100)",
          100: "var(--green-100)",
          500: "var(--green-500)",
          800: "var(--green-800)",
          900: "var(--green-900)",
        },
        green: {
          DEFAULT: "var(--green-100)",
          100: "var(--green-100)",
          500: "var(--green-500)",
          800: "var(--green-800)",
          900: "var(--green-900)",
        },
        neon: {
          DEFAULT: "var(--neon-100)",
          100: "var(--neon-100)",
          300: "var(--neon-300)",
          500: "var(--neon-500)",
        },
        orange: {
          DEFAULT: "var(--orange-100)",
          100: "var(--orange-100)",
          900: "var(--orange-900)",
        },
        red: {
          DEFAULT: "var(--red-100)",
          100: "var(--red-100)",
          900: "var(--red-900)",
        },
      },
      backgroundImage: {
        "green-100": "var(--green-gradient-100)",
        "orange-100": "var(--orange-gradient-100)",
        "red-100": "var(--red-gradient-100)",
      },
      fontFamily: {
        body: ["Rubik One", "sans"],
        secondary: ["VCR OSD Mono", "sans"],
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        "2xs": "10px",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "100% 0" },
          "20%": { backgroundPosition: "-100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [twAnimate],
};
