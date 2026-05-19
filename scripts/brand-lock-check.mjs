/**
 * Design-lock Layer 4: brand-change gate (git commit-msg hook).
 * Rejects any commit that stages a locked path unless the commit message
 * contains the override token `[brand-change]`.
 *
 * Usage: node scripts/brand-lock-check.mjs <commit-msg-file>
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OVERRIDE = "[brand-change]";

let locked = [];
try {
  locked = JSON.parse(readFileSync(join(root, "brief/locked-files.json"), "utf8")).locked || [];
} catch {
  process.exit(0); // no lock manifest -> nothing to enforce
}

const msgFile = process.argv[2];
const msg = msgFile ? readFileSync(msgFile, "utf8") : "";

let staged = "";
try {
  staged = execSync("git diff --cached --name-only", { cwd: root, encoding: "utf8" });
} catch {
  process.exit(0);
}
const stagedFiles = staged.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

const hit = stagedFiles.filter((f) =>
  locked.some((l) => (l.endsWith("/") ? f.startsWith(l) : f === l)),
);

if (hit.length > 0 && !msg.includes(OVERRIDE)) {
  console.error("\n  DESIGN LOCK — commit blocked.");
  console.error("  These staged paths are locked by brief/locked-files.json:");
  hit.forEach((f) => console.error("    - " + f));
  console.error(`\n  To intentionally change the brand/design system, include ${OVERRIDE} in the commit message.\n`);
  process.exit(1);
}
process.exit(0);
