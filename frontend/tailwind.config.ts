import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Design Tokens (ADR-107.1) — Paleta MSN/Discord reskin
        // Nomeação: bg-surface-*, text-content-*, border-accent-*, text-status-*
        surface: {
          base: "#150e1f",        // Fundo da janela
          deep: "#120b1a",        // Rail de navegação
          panel: "#1a1226",       // Sidebar de contatos
          raised: "#241833",      // Inputs, avatares inativos, bolha "deles"
          hover: "#2b1c3d",       // Menu de status, hovers
          chat: "#170f22",        // Janela de chat (header/footer)
        },
        content: {
          primary: "#f1ecf7",     // Texto principal
          secondary: "#a89fb5",   // Subtítulos, última msg (sólido ≈ alpha)
          muted: "#7d7490",       // Timestamps, @login
          onAccent: "#1a1020",    // Texto sobre pink/cyan
        },
        accent: {
          primary: "#ff5fa2",     // Pink (principal, ex-teal)
          primaryDeep: "#c23f7f", // Pink escuro (gradiente)
          secondary: "#35c3dd",   // Cyan (ex-navy)
        },
        status: {
          online: "#3ee08a",      // Verde (pulso animado)
          away: "#ffcc4d",        // Amarelo (Ausente)
          busy: "#ff4d6d",        // Pink (Ocupado)
          invisible: "#6b6478",   // Cinza (Invisível)
          offline: "#4a4358",     // Cinza escuro (Offline)
          error: "#ff4d6d",       // Pink para erros
          success: "#3ee08a",     // Verde para sucesso
          warning: "#ffcc4d",     // Amarelo para avisos
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
