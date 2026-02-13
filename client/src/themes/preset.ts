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
          DEFAULT: "var(--green-400)",
        },
        neon: {
          DEFAULT: "var(--neon-100)",
          100: "var(--neon-100)",
          300: "var(--neon-300)",
          500: "var(--neon-500)",
        },

        blue: {
          DEFAULT: "var(--blue-100)",
          100: "var(--blue-100)",
          300: "var(--blue-300)",
          500: "var(--blue-500)",
        },
        green: {
          DEFAULT: "var(--green-100)",
          100: "var(--green-100)",
          200: "var(--green-200)",
          300: "var(--green-300)",
          400: "var(--green-400)",
          500: "var(--green-500)",
          600: "var(--green-600)",
          700: "var(--green-700)",
          800: "var(--green-800)",
          900: "var(--green-900)",
          950: "var(--green-950)",
          1000: "var(--green-1000)",
        },
        yellow: {
          DEFAULT: "var(--yellow-100)",
          100: "var(--yellow-100)",
          300: "var(--yellow-300)",
          500: "var(--yellow-500)",
        },
        orange: {
          DEFAULT: "var(--orange-100)",
          100: "var(--orange-100)",
          300: "var(--orange-300)",
          500: "var(--orange-500)",
        },
        salmon: {
          DEFAULT: "var(--salmon-100)",
          100: "var(--salmon-100)",
          300: "var(--salmon-300)",
          500: "var(--salmon-500)",
        },
        red: {
          DEFAULT: "var(--red-100)",
          100: "var(--red-100)",
          300: "var(--red-300)",
          500: "var(--red-500)",
        },
        black: {
          DEFAULT: "var(--black-100)",
          100: "var(--black-100)",
        },
      },
      backgroundImage: {
        "green-gradient-100": "var(--green-gradient-100)",
        "orange-gradient-100": "var(--orange-gradient-100)",
        "red-gradient-100": "var(--red-gradient-100)",
        "multiplier-one-100": "var(--multiplier-one-100)",
        "multiplier-one-200": "var(--multiplier-one-200)",
        "multiplier-two-100": "var(--multiplier-two-100)",
        "multiplier-two-200": "var(--multiplier-two-200)",
        "multiplier-three-100": "var(--multiplier-three-100)",
        "multiplier-three-200": "var(--multiplier-three-200)",
        "multiplier-four-100": "var(--multiplier-four-100)",
        "multiplier-four-200": "var(--multiplier-four-200)",
        "multiplier-five-100": "var(--multiplier-five-100)",
        "multiplier-five-200": "var(--multiplier-five-200)",
        "point-gradient-100": "var(--point-gradient-100)",
        "multiplier-gradient-100": "var(--multiplier-gradient-100)",
        "hp-gradient-100": "var(--hp-gradient-100)",
        "moonrock-gradient-100": "var(--moonrock-gradient-100)",
        "chip-gradient-100": "var(--chip-gradient-100)",
      },
      fontFamily: {
        body: ["Rubik One", "sans"],
        glitch: ["Rubik Glitch", "sans"],
        secondary: ["VCR OSD Mono", "sans"],
        primary: ["Pixel Game", "Rubik One", "sans"],
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
