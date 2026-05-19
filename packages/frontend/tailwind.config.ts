import type { Config } from "tailwindcss";
import { tokens } from "./tailwind.tokens";

/**
 * DesignersMeet Tailwind theme.
 * Colours, radii, shadows and fonts come exclusively from tailwind.tokens.ts,
 * which Style Dictionary generates from brief/tokens.json.
 * NEVER hand-edit colour values here — change brief/tokens.json + run `npm run tokens`.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ...tokens.colors,
        // Aliases so Codex output reads naturally:
        background: tokens.colors.background,
        foreground: tokens.colors.foreground,
        primary: {
          DEFAULT: tokens.colors.primary,
          hover: tokens.colors["primary-hover"],
          active: tokens.colors["primary-active"],
          tint: tokens.colors["primary-tint"],
          tint2: tokens.colors["primary-tint-2"],
        },
        border: tokens.colors.border,
      },
      borderColor: {
        DEFAULT: tokens.colors.border,
        strong: tokens.colors["border-strong"],
        subtle: tokens.colors["border-subtle"],
      },
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
      fontFamily: { sans: [...tokens.fontFamily.sans] },
    },
  },
  plugins: [],
};

export default config;
