import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "0",
        none: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        full: "0",
      },
      colors: {
        "42-black": "#1B1B1B",
        "42-white": "#FFFFFF",
        "42-navy": "#173D7A",
        "42-near-black": "#202026",
        "42-dark-gray": "#29292E",
        "42-mid-gray": "#5B5B60",
        "42-light-gray": "#E3E3E3",
        "42-teal": "#00BABC",
        "42-cg-blue": "#04809F",
        "42-green": "#2DD57A",
        "42-pink": "#EC3391",
        "42-purple": "#7300FF",
        // Design System 42 — namespace 'ft' para Shadcn/ui compat
        ft: {
          black: "#1B1B1B",
          white: "#FFFFFF",
          navy: "#173D7A",
          nearblack: "#202026",
          darkgray: "#29292E",
          teal: "#00BABC",
          cgblue: "#04809F",
          green: "#2DD57A",
          pink: "#EC3391",
        },
        // Semantic Design Tokens (ADR-105.1) — Paleta "Sleek" + "Minimalist"
        // Nomeação: bg-surface-*, text-content-*, border-accent-*, text-status-*
        surface: {
          base: "#1B1B1B",        // Fundo primário (black institucional)
          panel: "#202026",       // Fundo elevado (near-black)
          raised: "#29292E",      // Fundo mais elevado (dark-gray)
          hover: "#35353C",       // Hover subtle (um pouco acima de raised)
        },
        content: {
          primary: "#F2F2F2",     // Texto principal (branco suave)
          secondary: "#A8A8B3",   // Texto secundário (cinza médio)
          muted: "#6E6E78",       // Texto mutado/desabilitado (cinza escuro)
        },
        accent: {
          teal: "#00BABC",        // Ênfase teal
          navy: "#173D7A",        // Ênfase navy
        },
        status: {
          error: "#EC3391",       // Pink para erros
          success: "#2DD57A",     // Green para sucesso
          warning: "#FFB800",     // Laranja para avisos (padrão)
        },
      },
      fontFamily: {
        sans: ["Futura PT", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
