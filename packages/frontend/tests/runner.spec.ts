/**
 * Persona-driven UX runner — combinatorial coverage.
 *
 * Generates the full 5 personas x 20 journeys x 25 interactions x 4 states =
 * 10,000 (persona, journey, interaction, state) matrix and drives Playwright
 * through it against the deployed Surge URL.
 *
 * Execution strategy (honest + bounded, documented for the report):
 *  - One browser context per persona (5 contexts).
 *  - ONE navigation per (persona, journey) -> the journey's primary route
 *    (~100 navigations). The 25x4 interaction/state checks then run against
 *    that loaded page as fast DOM probes (count/fill/press), reflecting real
 *    cumulative user behaviour within a journey.
 *  - If a probe navigates away, the route is restored before continuing.
 *
 * Classification per tuple:
 *  - skip(role)        persona's role lacks permission for the journey
 *  - skip(demo)        journey structurally needs an IdP/server the static
 *                      Surge preview does not have (sign-in/out/reset)
 *  - skip(n/a)         interaction not applicable to this page AND not a
 *                      declared step of the journey
 *  - fail(missing)     interaction IS a declared step of the journey but the
 *                      affordance is absent  -> real UX gap
 *  - fail(no-feedback) affordance present but produced no visible response in
 *                      a state where the user expects feedback
 *  - fail(state)       a reachable state has no DOM marker (silent UX)
 *  - pass              affordance present and behaved as expected
 *
 * Scope: UX_SCOPE=critical runs the ~500 critical-path subset (daily schtask);
 * default runs the full 10k (weekly). UX_PERSONA=<name> shards by persona.
 */
import { test, expect, chromium, type Browser } from "@playwright/test";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { personas, personaCan, type Persona } from "./personas/index.js";
import { journeys, type Journey } from "./journeys/index.js";
import { interactions } from "./interactions/index.js";
import { states } from "./states/index.js";
import { auditPage, AUDIT_ROUTES, type PageOptReport } from "./optimization/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "ux-results");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.UX_BASE_URL ?? "https://designersmeet-preview.surge.sh";
const SCOPE = process.env.UX_SCOPE ?? "full"; // full | critical
const PERSONA_FILTER = process.env.UX_PERSONA ?? "";
const STAMP = process.env.UX_STAMP ?? "2026-05-19";
const PHASE = process.env.UX_PHASE ?? "prefix";

type Verdict = "pass" | "fail" | "skip";
interface Row {
  persona: string;
  journey: string;
  interaction: string;
  state: string;
  route: string;
  verdict: Verdict;
  reason: string;
}

const AUTH_STEP = new Set(["password-input", "email-input"]);

function activePersonas(): Persona[] {
  let ps = personas;
  if (PERSONA_FILTER) ps = ps.filter((p) => p.name === PERSONA_FILTER);
  if (SCOPE === "critical") return ps; // all personas, fewer journeys below
  return ps;
}
function activeJourneys(p: Persona): Journey[] {
  if (SCOPE === "critical") {
    return journeys.filter((j) => p.typicalJourneys.includes(j.id));
  }
  return journeys;
}

test("persona-driven UX matrix", async () => {
  test.setTimeout(90 * 60_000); // hard 90-min cap; runner self-batches under it
  const rows: Row[] = [];
  const optReports: PageOptReport[] = [];
  const browser: Browser = await chromium.launch();
  const startedAt = Date.now();

  for (const persona of activePersonas()) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    for (const journey of activeJourneys(persona)) {
      const route = journey.route;
      const stepSet = new Set(journey.steps);

      // Permission gate first — emit the full state grid as skip(role).
      if (!personaCan(persona, journey.id)) {
        for (const it of interactions)
          for (const st of states)
            rows.push({
              persona: persona.name,
              journey: journey.id,
              interaction: it.id,
              state: st.id,
              route,
              verdict: "skip",
              reason: `role '${persona.role}' not permitted for journey '${journey.id}'`,
            });
        continue;
      }

      try {
        await page.goto(BASE_URL + route, { waitUntil: "domcontentloaded", timeout: 20_000 });
        await page.waitForTimeout(450);
      } catch {
        for (const it of interactions)
          for (const st of states)
            rows.push({
              persona: persona.name,
              journey: journey.id,
              interaction: it.id,
              state: st.id,
              route,
              verdict: "fail",
              reason: `route ${route} failed to load`,
            });
        continue;
      }

      for (const it of interactions) {
        let probe;
        try {
          probe = await it.probe(page);
        } catch (e) {
          probe = { present: false, feedback: false, note: `probe error: ${String(e).slice(0, 80)}` };
        }
        // Restore route if a probe navigated away.
        if (!page.url().includes(route) && route !== "/") {
          await page.goto(BASE_URL + route, { waitUntil: "domcontentloaded" }).catch(() => {});
          await page.waitForTimeout(250);
        }

        for (const st of states) {
          let detect;
          try {
            detect = await st.detect(page);
          } catch {
            detect = { marker: false, note: "state detect error" };
          }

          const isStep = stepSet.has(it.id);
          const authBlocked = journey.demoBypassed && (AUTH_STEP.has(it.id) || it.id === "form-submit");

          let verdict: Verdict;
          let reason: string;

          if (authBlocked) {
            verdict = "skip";
            reason = `demo deploy has no IdP/server — '${journey.id}' cannot complete (${it.id})`;
          } else if (!probe.present && isStep) {
            verdict = "fail";
            reason = `journey-critical affordance '${it.id}' missing on ${route} — ${probe.note}`;
          } else if (!probe.present) {
            verdict = "skip";
            reason = `'${it.id}' n/a on ${route} — ${probe.note}`;
          } else if (isStep && !probe.feedback && (st.id === "success" || st.id === "error")) {
            verdict = "fail";
            reason = `'${it.id}' present but no visible feedback in '${st.id}' — ${probe.note}`;
          } else if (st.id === "loading" && isStep && !detect.marker) {
            verdict = "fail";
            reason = `no loading affordance for '${it.id}' on ${route} (silent wait)`;
          } else {
            verdict = "pass";
            reason = `${probe.note}; state:${detect.note}`;
          }

          rows.push({
            persona: persona.name,
            journey: journey.id,
            interaction: it.id,
            state: st.id,
            route,
            verdict,
            reason,
          });
        }
      }
    }
    await ctx.close();
  }

  // Per-page optimization audit (once per route).
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    for (const r of AUDIT_ROUTES) {
      try {
        await page.goto(BASE_URL + r, { waitUntil: "domcontentloaded", timeout: 20_000 });
        await page.waitForTimeout(500);
        optReports.push(await auditPage(page, r));
      } catch {
        optReports.push({
          route: r,
          perfProxy: -1,
          a11yViolations: -1,
          a11ySerious: -1,
          iconButtonsMissingLabel: -1,
          imagesMissingAlt: -1,
          focusRingPresent: false,
          loadingAffordance: false,
          buttonFeedback: false,
          notes: ["route failed to load for audit"],
        });
      }
    }
    await ctx.close();
  }
  await browser.close();

  const elapsedMin = ((Date.now() - startedAt) / 60000).toFixed(1);
  const total = rows.length;
  const pass = rows.filter((r) => r.verdict === "pass").length;
  const fail = rows.filter((r) => r.verdict === "fail").length;
  const skip = rows.filter((r) => r.verdict === "skip").length;

  writeFileSync(
    resolve(OUT_DIR, `raw-${PHASE}-${STAMP}.json`),
    JSON.stringify({ meta: { BASE_URL, SCOPE, STAMP, PHASE, total, pass, fail, skip, elapsedMin }, rows, optReports }, null, 2),
  );

  const md = renderMarkdown(rows, optReports, { total, pass, fail, skip, elapsedMin });
  writeFileSync(resolve(OUT_DIR, `ux-test-results-${PHASE}-${STAMP}.md`), md);

  console.log(`UX matrix ${PHASE}: total=${total} pass=${pass} fail=${fail} skip=${skip} (${elapsedMin}m)`);
  // The suite is a measurement instrument: it must always produce a report.
  // It does not assert pass==total (the report is the deliverable). It only
  // fails the test job if it could not produce any rows.
  expect(total).toBeGreaterThan(0);
});

function pct(n: number, d: number): string {
  return d ? `${((n / d) * 100).toFixed(1)}%` : "0%";
}

function renderMarkdown(
  rows: Row[],
  opt: PageOptReport[],
  s: { total: number; pass: number; fail: number; skip: number; elapsedMin: string },
): string {
  const byPersona = new Map<string, { p: number; f: number; s: number }>();
  const byPage = new Map<string, { p: number; f: number; s: number }>();
  for (const r of rows) {
    const a = byPersona.get(r.persona) ?? { p: 0, f: 0, s: 0 };
    a[r.verdict === "pass" ? "p" : r.verdict === "fail" ? "f" : "s"]++;
    byPersona.set(r.persona, a);
    const b = byPage.get(r.route) ?? { p: 0, f: 0, s: 0 };
    b[r.verdict === "pass" ? "p" : r.verdict === "fail" ? "f" : "s"]++;
    byPage.set(r.route, b);
  }
  const failRows = rows.filter((r) => r.verdict === "fail");
  const critKinds = new Map<string, number>();
  for (const r of failRows) {
    const key = `${r.route} :: ${r.interaction}`;
    critKinds.set(key, (critKinds.get(key) ?? 0) + 1);
  }
  const topCrit = [...critKinds.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);

  const L: string[] = [];
  L.push(`# DesignersMeet CRM — Persona UX Test Results (${process.env.UX_PHASE ?? "prefix"})`);
  L.push("");
  L.push(`- Target: ${process.env.UX_BASE_URL ?? "https://designersmeet-preview.surge.sh"}`);
  L.push(`- Scope: ${process.env.UX_SCOPE ?? "full"} · Wall-clock: ${s.elapsedMin} min · Generated: ${new Date().toISOString()}`);
  L.push("");
  L.push(`## Totals`);
  L.push(`| Total | Pass | Fail | Skip |`);
  L.push(`|---|---|---|---|`);
  L.push(`| ${s.total} | ${s.pass} (${pct(s.pass, s.total)}) | ${s.fail} (${pct(s.fail, s.total)}) | ${s.skip} (${pct(s.skip, s.total)}) |`);
  L.push("");
  L.push(`## Per-persona`);
  L.push(`| Persona | Pass | Fail | Skip |`);
  L.push(`|---|---|---|---|`);
  for (const [k, v] of byPersona) L.push(`| ${k} | ${v.p} | ${v.f} | ${v.s} |`);
  L.push("");
  L.push(`## Per-page (route)`);
  L.push(`| Route | Pass | Fail | Skip |`);
  L.push(`|---|---|---|---|`);
  for (const [k, v] of [...byPage.entries()].sort((a, b) => b[1].f - a[1].f))
    L.push(`| ${k} | ${v.p} | ${v.f} | ${v.s} |`);
  L.push("");
  L.push(`## Critical failure clusters (route :: interaction, top 25)`);
  L.push(`| Route :: Interaction | Fail count | Example reason |`);
  L.push(`|---|---|---|`);
  for (const [k, n] of topCrit) {
    const ex = failRows.find((r) => `${r.route} :: ${r.interaction}` === k)?.reason ?? "";
    L.push(`| ${k} | ${n} | ${ex.slice(0, 110).replace(/\|/g, "/")} |`);
  }
  L.push("");
  L.push(`## Per-page optimization audit`);
  L.push(`| Route | Perf proxy | a11y viol | serious | icon-btn no-label | img no-alt | focus ring | loading | btn feedback |`);
  L.push(`|---|---|---|---|---|---|---|---|---|`);
  for (const o of opt)
    L.push(
      `| ${o.route} | ${o.perfProxy} | ${o.a11yViolations} | ${o.a11ySerious} | ${o.iconButtonsMissingLabel} | ${o.imagesMissingAlt} | ${o.focusRingPresent ? "Y" : "N"} | ${o.loadingAffordance ? "Y" : "N"} | ${o.buttonFeedback ? "Y" : "N"} |`,
    );
  L.push("");
  L.push(`## Optimization opportunities`);
  for (const o of opt)
    if (o.notes.length) L.push(`- **${o.route}**: ${o.notes.join("; ")}`);
  L.push("");
  return L.join("\n");
}
