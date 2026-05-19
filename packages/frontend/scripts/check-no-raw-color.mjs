/**
 * Design-lock Layer 3b: CSS colour guard.
 * ESLint does not parse .css, so this script scans every CSS file under src
 * (except the generated styles/tokens.css) for raw hex / rgb / hsl literals.
 * Exits non-zero on the first violation so `npm run lint` fails the build.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { globSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-fA-F])/;
const FUNC = /\b(?:rgb|rgba|hsl|hsla)\s*\(/i;
const IGNORE = ["src/styles/tokens.css"];

let files = [];
try {
  files = globSync("src/**/*.css", { cwd: root }).filter((f) => !IGNORE.includes(f.replace(/\\/g, "/")));
} catch {
  files = [];
}

let violations = 0;
for (const rel of files) {
  const text = readFileSync(join(root, rel), "utf8");
  text.split(/\r?\n/).forEach((line, i) => {
    const code = line.replace(/\/\*.*?\*\//g, "");
    if (HEX.test(code) || FUNC.test(code)) {
      violations++;
      console.error(`  ${rel}:${i + 1}  raw colour -> ${line.trim().slice(0, 80)}`);
    }
  });
}

if (violations > 0) {
  console.error(`\n[design-lock] ${violations} raw colour literal(s) in CSS. Use var(--color-*).`);
  process.exit(1);
}
console.log(`[design-lock] CSS colour guard: ${files.length} file(s) clean.`);
