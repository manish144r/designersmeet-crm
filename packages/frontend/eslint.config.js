import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * DesignersMeet ESLint flat config.
 * Layer 3 of the design lock: the `dm/no-raw-color` rule forbids any inline
 * hex / rgb / hsl colour literal in src TS/TSX. Colours must come from Tailwind
 * token classes or CSS custom properties — never typed by hand.
 *
 * The ONLY sanctioned hex location is the Style Dictionary output
 * (tailwind.tokens.ts + src/styles/tokens.css), both ignored below.
 */

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-fA-F])/;
const FUNC = /\b(?:rgb|rgba|hsl|hsla)\s*\(/i;

function check(context, node, raw) {
  if (typeof raw !== "string") return;
  if (HEX.test(raw) || FUNC.test(raw)) {
    context.report({
      node,
      message:
        "Raw colour literal '{{c}}' is forbidden. Use a Tailwind token class (bg-primary, text-foreground, …) or a var(--color-*).",
      data: { c: raw.trim().slice(0, 32) },
    });
  }
}

const noRawColor = {
  meta: { type: "problem", docs: { description: "Forbid inline hex/rgb/hsl colours" }, schema: [] },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === "string") check(context, node, node.value);
      },
      TemplateElement(node) {
        check(context, node, node.value?.raw ?? "");
      },
      JSXText(node) {
        // class strings sometimes land here; cheap extra net
        check(context, node, node.value ?? "");
      },
    };
  },
};

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "storybook-static/**",
      "tailwind.tokens.ts",
      "src/styles/tokens.css",
      "**/*.config.{js,ts}",
      ".storybook/**",
      "src/**/*.stories.tsx",
      "scripts/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { dm: { rules: { "no-raw-color": noRawColor } } },
    rules: {
      "dm/no-raw-color": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-empty": "warn",
    },
  },
);
