import type { Config } from "tailwindcss";

/**
 * Tokens alignés sur design/DESIGN-SYSTEM.md ("Fiche technique éditoriale").
 * Couleurs en var(--token) pour rester identiques aux maquettes .html de design/.
 * Rayons : "sharp" = rounded-sm (2px), "small" = rounded-md (6px) — déjà les valeurs
 * par défaut de Tailwind, pas de surcharge nécessaire.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "brand-dark": "var(--brand-dark)",
        accent: "var(--accent)",

        "ink-1": "var(--ink-1)",
        "ink-2": "var(--ink-2)",
        "text-soft": "var(--text-soft)",
        "text-weak": "var(--text-weak)",

        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        "line-soft": "var(--line-soft)",

        section: "var(--section)",
        surface: "var(--surface)",
        paper: "var(--paper)",
        "paper-soft": "var(--paper-soft)",
        zebra: "var(--zebra)",

        success: "var(--success)",
        "success-bg": "var(--success-bg)",
        warning: "var(--warning)",
        "warning-bg": "var(--warning-bg)",
        danger: "var(--danger)",
        "danger-hover": "var(--danger-hover)",
        "danger-bg": "var(--danger-bg)",
        info: "var(--info)",
        "info-bg": "var(--info-bg)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
