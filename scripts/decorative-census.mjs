#!/usr/bin/env node
// Decorative-element census across packages/frontend/src/pages/*.tsx.
//
// For each page, walks the source TSX for every node that would render an
// interactive-looking DOM element (button, a, role=button, cursor-pointer)
// and classifies its current wiring state:
//   - WIRED         has onClick / href / to= / data-onclick handler in source
//   - DECORATIVE    none of the above + not aria-disabled / data-disabled
//   - DISABLED      aria-disabled="true" / data-disabled / disabled attribute
//
// Outputs outputs/decorative-element-census-<STAMP>.csv with one row per
// detected element. Source-text grep is intentionally simple + conservative:
// the goal is a HIGH-RECALL census, then the persona UAT probe verifies
// behaviour at runtime against the deployed app.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = resolve(HERE, "../packages/frontend/src/pages");
const OUT_DIR = resolve(HERE, "../outputs");
const STAMP = process.env.STAMP ?? "2026-05-20";

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Match opening tags for "interactive-looking" elements. Crude but exhaustive.
// JSX is structured enough that a regex over balanced angle-brackets works for
// the census; the persona UAT probe is the runtime ground truth.
const TAG_RE = /<((?:button|a|div|span|li)\b)([^>]*?)>/gis;
const CURSOR_POINTER_RE = /\bcursor-pointer\b/;
const ON_CLICK_RE = /\bonClick=/;
const ON_KEY_RE = /\bonKeyDown=|\bonKeyUp=|\bonKeyPress=/;
const HREF_RE = /\shref=/;
const TO_RE = /\sto=\{|\sto="\//;
const ROLE_BUTTON_RE = /role=["']button["']/;
const DATA_DISABLED_RE = /data-disabled|aria-disabled|\sdisabled\b/;
const DATA_DEMO_INTERACTIVE_RE = /data-demo-interactive/;

function classify(tagName, attrs, body) {
  const looksInteractive =
    tagName === "button" ||
    tagName === "a" ||
    ROLE_BUTTON_RE.test(attrs) ||
    CURSOR_POINTER_RE.test(attrs) ||
    DATA_DEMO_INTERACTIVE_RE.test(attrs);
  if (!looksInteractive) return null;

  const wired =
    ON_CLICK_RE.test(attrs) ||
    ON_KEY_RE.test(attrs) ||
    HREF_RE.test(attrs) ||
    TO_RE.test(attrs);
  const disabled = DATA_DISABLED_RE.test(attrs);

  if (wired) return "WIRED";
  if (disabled) return "DISABLED";
  return "DECORATIVE";
}

function labelFromAttrs(attrs) {
  const aria = attrs.match(/aria-label=["']([^"']+)["']/);
  if (aria) return aria[1].slice(0, 60);
  const title = attrs.match(/title=["']([^"']+)["']/);
  if (title) return title[1].slice(0, 60);
  const role = attrs.match(/role=["']([^"']+)["']/);
  return role ? `role:${role[1]}` : "";
}

function scanPage(file) {
  const src = readFileSync(file, "utf8");
  const rows = [];
  let m;
  while ((m = TAG_RE.exec(src)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] ?? "";
    const verdict = classify(tag, attrs, "");
    if (!verdict) continue;
    const lineNum = src.slice(0, m.index).split("\n").length;
    const label = labelFromAttrs(attrs);
    const className = (attrs.match(/className=["']([^"']{0,80})/)?.[1] ?? "").replace(/\s+/g, " ");
    rows.push({
      page: basename(file),
      line: lineNum,
      tag,
      label,
      classHint: className,
      verdict,
    });
  }
  return rows;
}

function main() {
  const files = readdirSync(PAGES_DIR)
    .filter((f) => /^\d{2}-.+\.tsx$/.test(f))
    .sort()
    .map((f) => resolve(PAGES_DIR, f));

  const all = [];
  for (const f of files) all.push(...scanPage(f));

  const header = ["page", "line", "tag", "label", "classHint", "verdict", "expected_action", "proposed_fix"];
  const rows = all.map((r) => {
    const expected =
      r.classHint.includes("cursor-pointer") && r.tag === "div"
        ? "navigate/switch-pane"
        : r.tag === "a"
        ? "navigate"
        : r.label.toLowerCase().includes("collapse")
        ? "wired-via-SidebarCollapseLayer"
        : "fire onClick";
    const fix =
      r.verdict === "WIRED"
        ? "OK"
        : r.verdict === "DISABLED"
        ? "OK (intentionally inert)"
        : r.classHint.includes("cursor-pointer") && r.tag === "div"
        ? "wire onClick to swap pane / route / set active"
        : r.tag === "button"
        ? "wire onClick OR add data-disabled=true with explanatory tooltip"
        : "wire handler or mark data-disabled";
    return [r.page, r.line, r.tag, r.label, r.classHint, r.verdict, expected, fix];
  });

  const csv = [header.join(",")]
    .concat(rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")))
    .join("\n");
  const outPath = resolve(OUT_DIR, `decorative-element-census-${STAMP}.csv`);
  writeFileSync(outPath, csv);

  // Per-page summary
  const byPage = new Map();
  for (const r of all) {
    const a = byPage.get(r.page) ?? { WIRED: 0, DECORATIVE: 0, DISABLED: 0 };
    a[r.verdict]++;
    byPage.set(r.page, a);
  }
  const summary = [];
  summary.push(`# Decorative element census — ${STAMP}`);
  summary.push(`Source: ${PAGES_DIR}`);
  summary.push(`Files scanned: ${files.length}`);
  summary.push(`Total interactive-looking elements: ${all.length}`);
  summary.push("");
  summary.push(`| Page | Wired | Decorative | Disabled |`);
  summary.push(`|------|-------|------------|----------|`);
  let totalDec = 0;
  for (const [pg, a] of [...byPage.entries()].sort()) {
    summary.push(`| ${pg} | ${a.WIRED} | ${a.DECORATIVE} | ${a.DISABLED} |`);
    totalDec += a.DECORATIVE;
  }
  summary.push("");
  summary.push(`**Total decorative: ${totalDec}**`);
  writeFileSync(resolve(OUT_DIR, `decorative-element-census-${STAMP}.md`), summary.join("\n"));

  console.log(`Wrote ${outPath} (${all.length} rows)`);
  console.log(`Total decorative across ${files.length} pages: ${totalDec}`);
}

main();
