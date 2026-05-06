import type { Config } from "tailwindcss";

// DesignersMeet design tokens — lifted from research/designersmeet-crm.html
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1E2761",
          dark: "#151d4a",
          light: "#2a3578",
        },
        gold: {
          DEFAULT: "#FFD700",
          hover: "#e6c200",
        },
        ice: {
          DEFAULT: "#CADCFC",
          dim: "#8ea4c8",
        },
        bg: "#0d1117",
        card: "#161b22",
        cardHover: "#1c2333",
        borderc: "#30363d",
        textc: "#e6edf3",
        textDim: "#8b949e",
        statusGreen: "#2ea043",
        statusAmber: "#d29922",
        statusRed: "#f85149",
        statusBlue: "#58a6ff",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04)",
        focusGold: "0 0 0 2px rgba(255,215,0,.15)",
      },
    },
  },
  plugins: [],
};

export default config;
