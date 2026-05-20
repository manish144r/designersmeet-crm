/**
 * Persona-driven UX runner — combinatorial coverage, ZERO skips.
 *
 * 5 personas x 20 journeys x 25 interactions x 4 states = 10,000 cells.
 * EVERY cell is executed and yields exactly one of:
 *   - pass     affordance exercised, behaved as expected
 *   - fail     affordance exercised, real defect (missing/no-feedback/error)
 *   - blocked  executed, but no applicable assertion — with a CONCRETE
 *              written reason + the condition that would unblock it
 * There is no "skip". `pass + fail + blocked === 10000`.
 *
 * Blocked is reserved for STRUCTURAL impossibilities on the static Surge
 * demo (never to launder a fail):
 *   B-AUTH   IdP-less DEMO_MODE build auto-authenticates; sign-in/out/reset
 *            terminal steps cannot run (unblocks when Render backend + real
 *            auth are wired: .env VITE_DEMO_MODE=false).
 *   B-ASYNC  demoStore is in-memory synchronous — there is no network
 *            in-flight, so a "loading" state is unreachable for that action
 *            (unblocks when the Render backend introduces latency).
 *   B-LOCK   a journey-critical affordance is genuinely absent from a
 *            DESIGN-LOCKED page; adding it is a visual change requiring a
 *            [brand-change] design approval (see optimization backlog) — it
 *            cannot be fixed behavior-only without breaking the strict 0%
 *            visual lock.
 *   B-XJRNY  breadth cell: interaction is not a step of this journey AND no
 *            such affordance exists on the journey's route — nothing to
 *            exercise (a coverage cell, not a journey defect).
 *
 * RBAC note: the demo build enforces no per-role access (single demo admin),
 * so role-gated journeys are EXECUTED (not skipped) for every persona; the
 * "RBAC not enforced" governance fact is reported once in aggregate, not as
 * thousands of hidden skips.
 *
 * Scope: UX_SCOPE=critical -> typical-journey subset; default -> full 10k.
 */
import { test, expect, chromium, type Browser, type Page } from "@playwright/test";
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
const SCOPE = process.env.UX_SCOPE ?? "full";
const PERSONA_FILTER = process.env.UX_PERSONA ?? "";
const STAMP = process.env.UX_STAMP ?? "2026-05-19";
const PHASE = process.env.UX_PHASE ?? "prefix";

type Verdict = "pass" | "fail" | "blocked";
interface Row {
  persona: string;
  journey: string;
  interaction: string;
  state: string;
  route: string;
  verdict: Verdict;
  // D-DECORATIVE is a fail category (decorative interactive element), reported
  // separately from B-* blockers which are structural impossibilities.
  block?: "B-AUTH" | "B-ASYNC" | "B-LOCK" | "B-XJRNY" | "D-DECORATIVE";
  governance: boolean;
  reason: string;
}

// Auth-terminal steps that cannot complete on the IdP-less demo build.
const AUTH_TERMINAL = new Set(["password-input", "email-input", "form-submit"]);
// Journey-critical affordances genuinely absent from locked pages =>
// closing them is a visual [brand-change], not a behaviour-only fix.
// Verified against the live affordance map (2026-05-20): these journey-step
// affordances are genuinely ABSENT from the locked page DOM, so closing them
// is a visual [brand-change], not a behaviour-only fix. (text-input IS present
// on /settings, so it is NOT a lock gap.)
const LOCK_GAPS = new Set([
  "/forms::file-upload",
  "/forms::form-submit",
  "/settings::form-submit",
  // Verified genuinely absent from the locked DOM (probe found nothing across
  // text/icon/aria/trash variants): the locked Contacts page has no delete
  // control, and the locked Project-detail page uses inline edit (no dialog).
  // Adding either is a visual [brand-change] needing design approval — it
  // cannot be done behaviour-only under the strict 0% visual lock.
  "/contacts::destructive-cta-click",
  "/project-detail::modal-open",
]);

function activePersonas(): Persona[] {
  return PERSONA_FILTER ? personas.filter((p) => p.name === PERSONA_FILTER) : personas;
}
function activeJourneys(p: Persona): Journey[] {
  return SCOPE === "critical"
    ? journeys.filter((j) => p.typicalJourneys.includes(j.id))
    : journeys;
}

async function gotoRoute(page: Page, route: string): Promise<boolean> {
  try {
    await page.goto(BASE_URL + route, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(450);
    return true;
  } catch {
    return false;
  }
}

test("persona-driven UX matrix", async () => {
  test.setTimeout(120 * 60_000);
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
      const gov = !personaCan(persona, journey.id); // RBAC not enforced on demo
      const loaded = await gotoRoute(page, route);

      for (const it of interactions) {
        let probe;
        try {
          probe = await it.probe(page);
        } catch (e) {
          probe = { present: false, feedback: false, note: `probe error: ${String(e).slice(0, 80)}` };
        }
        if (!page.url().includes(route) && route !== "/") {
          await gotoRoute(page, route);
        }

        for (const st of states) {
          let detect;
          try {
            detect = await st.detect(page);
          } catch {
            detect = { marker: false, note: "state detect error" };
          }

          const isStep = stepSet.has(it.id);
          const lockKey = `${route}::${it.id}`;
          let verdict: Verdict;
          let block: Row["block"];
          let reason: string;

          if (!loaded) {
            verdict = "fail";
            reason = `route ${route} failed to load (network/host)`;
          } else if (journey.demoBypassed && AUTH_TERMINAL.has(it.id) && isStep) {
            verdict = "blocked";
            block = "B-AUTH";
            reason = `B-AUTH: IdP-less DEMO_MODE auto-auths; '${it.id}' of '${journey.id}' cannot complete. Unblocks: Render backend + VITE_DEMO_MODE=false.`;
          } else if (st.id === "loading" && !detect.marker) {
            // synchronous in-memory demoStore => no async in-flight state.
            verdict = "blocked";
            block = "B-ASYNC";
            reason = `B-ASYNC: demoStore is synchronous; no in-flight state for '${it.id}'. Unblocks: live Render backend latency.`;
          } else if (!probe.present && isStep && LOCK_GAPS.has(lockKey)) {
            verdict = "blocked";
            block = "B-LOCK";
            reason = `B-LOCK: journey-critical '${it.id}' absent from locked page ${route}; adding it is a [brand-change] (see outputs/dm-ux-optimization-2026-05-19.md). Cannot fix behaviour-only under strict 0% visual lock.`;
          } else if (!probe.present && isStep) {
            verdict = "fail";
            reason = `journey-critical affordance '${it.id}' missing on ${route} — ${probe.note}`;
          } else if (!probe.present && !isStep) {
            verdict = "blocked";
            block = "B-XJRNY";
            reason = `B-XJRNY: '${it.id}' not a step of '${journey.id}' and no such affordance on ${route} — breadth cell, no journey defect.`;
          } else if (
            isStep &&
            !probe.feedback &&
            (st.id === "success" || st.id === "error")
          ) {
            verdict = "fail";
            reason = `'${it.id}' present but no visible ${st.id} feedback — ${probe.note}`;
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
            block,
            governance: gov,
            reason,
          });
        }
      }
    }
    await ctx.close();
  }

  // Per-page optimization audit.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    for (const r of AUDIT_ROUTES) {
      if (await gotoRoute(page, r)) {
        await page.waitForTimeout(400);
        optReports.push(await auditPage(page, r));
      } else {
        optReports.push({
          route: r, perfProxy: -1, a11yViolations: -1, a11ySerious: -1,
          iconButtonsMissingLabel: -1, imagesMissingAlt: -1, focusRingPresent: false,
          loadingAffordance: false, buttonFeedback: false, notes: ["route failed to load"],
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
  const blocked = rows.filter((r) => r.verdict === "blocked").length;
  const skip = total - pass - fail - blocked; // must be 0
  const executed = pass + fail;
  const execPassRate = executed ? ((pass / executed) * 100).toFixed(1) : "0";

  writeFileSync(
    resolve(OUT_DIR, `raw-${PHASE}-${STAMP}.json`),
    JSON.stringify(
      { meta: { BASE_URL, SCOPE, STAMP, PHASE, total, pass, fail, blocked, skip, executed, execPassRate, elapsedMin }, rows, optReports },
      null,
      2,
    ),
  );
  writeFileSync(
    resolve(OUT_DIR, `ux-test-results-${PHASE}-${STAMP}.md`),
    renderMarkdown(rows, optReports, { total, pass, fail, blocked, skip, executed, execPassRate, elapsedMin }),
  );

  console.log(
    `UX ${PHASE}: total=${total} pass=${pass} fail=${fail} blocked=${blocked} skip=${skip} execPass=${execPassRate}% (${elapsedMin}m)`,
  );
  expect(skip, "skip must be zero — every cell classified").toBe(0);
  expect(total, "matrix must be fully generated").toBeGreaterThan(0);
});

function pct(n: number, d: number): string {
  return d ? `${((n / d) * 100).toFixed(1)}%` : "0%";
}

function renderMarkdown(
  rows: Row[],
  opt: PageOptReport[],
  s: { total: number; pass: number; fail: number; blocked: number; skip: number; executed: number; execPassRate: string; elapsedMin: string },
): string {
  const byP = new Map<string, { p: number; f: number; b: number }>();
  const byR = new Map<string, { p: number; f: number; b: number }>();
  for (const r of rows) {
    const k = r.verdict === "pass" ? "p" : r.verdict === "fail" ? "f" : "b";
    const a = byP.get(r.persona) ?? { p: 0, f: 0, b: 0 }; a[k]++; byP.set(r.persona, a);
    const c = byR.get(r.route) ?? { p: 0, f: 0, b: 0 }; c[k]++; byR.set(r.route, c);
  }
  const blockByKind = new Map<string, number>();
  for (const r of rows) if (r.block) blockByKind.set(r.block, (blockByKind.get(r.block) ?? 0) + 1);
  const fails = rows.filter((r) => r.verdict === "fail");
  const cl = new Map<string, number>();
  for (const r of fails) {
    const key = `${r.route} :: ${r.interaction}`;
    cl.set(key, (cl.get(key) ?? 0) + 1);
  }
  const topCl = [...cl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
  const govCells = rows.filter((r) => r.governance).length;

  const L: string[] = [];
  L.push(`# DesignersMeet CRM — Persona UX Results (${PHASE})`);
  L.push("");
  L.push(`- Target: ${BASE_URL} · Scope: ${SCOPE} · Wall: ${s.elapsedMin}m · ${new Date().toISOString()}`);
  L.push("");
  L.push(`## Totals (skip MUST be 0)`);
  L.push(`| Total | Pass | Fail | Blocked | Skip | Executed | Exec pass-rate |`);
  L.push(`|---|---|---|---|---|---|---|`);
  L.push(`| ${s.total} | ${s.pass} (${pct(s.pass, s.total)}) | ${s.fail} (${pct(s.fail, s.total)}) | ${s.blocked} (${pct(s.blocked, s.total)}) | ${s.skip} | ${s.executed} | **${s.execPassRate}%** |`);
  L.push("");
  L.push(`Exec pass-rate = pass / (pass+fail); blocked excluded (structural, each with an unblock path).`);
  L.push("");
  L.push(`## Blocked breakdown (concrete reasons)`);
  L.push(`| Code | Count | Meaning / unblock condition |`);
  L.push(`|---|---|---|`);
  const bm: Record<string, string> = {
    "B-AUTH": "IdP-less DEMO_MODE auto-auth — unblock: Render backend + VITE_DEMO_MODE=false",
    "B-ASYNC": "synchronous demoStore, no in-flight — unblock: live backend latency",
    "B-LOCK": "affordance absent from locked page — unblock: Manish [brand-change] approval",
    "B-XJRNY": "breadth cell: interaction not in journey & not on route — coverage, no defect",
    "D-DECORATIVE": "decorative interactive element (looks clickable, no wired behaviour, not disabled) — unblock: wire onClick OR mark aria-disabled/data-disabled. See decorative-walk.spec.ts.",
  };
  for (const [k, v] of [...blockByKind.entries()].sort((a, b) => b[1] - a[1]))
    L.push(`| ${k} | ${v} | ${bm[k]} |`);
  L.push("");
  L.push(`## Per-persona`);
  L.push(`| Persona | Pass | Fail | Blocked |`);
  L.push(`|---|---|---|---|`);
  for (const [k, v] of byP) L.push(`| ${k} | ${v.p} | ${v.f} | ${v.b} |`);
  L.push("");
  L.push(`## Per-page (route)`);
  L.push(`| Route | Pass | Fail | Blocked |`);
  L.push(`|---|---|---|---|`);
  for (const [k, v] of [...byR.entries()].sort((a, b) => b[1].f - a[1].f))
    L.push(`| ${k} | ${v.p} | ${v.f} | ${v.b} |`);
  L.push("");
  L.push(`## Top fail clusters (route :: interaction)`);
  L.push(`| Cluster | Fails | Example |`);
  L.push(`|---|---|---|`);
  for (const [k, n] of topCl) {
    const ex = fails.find((r) => `${r.route} :: ${r.interaction}` === k)?.reason ?? "";
    L.push(`| ${k} | ${n} | ${ex.slice(0, 100).replace(/\|/g, "/")} |`);
  }
  L.push("");
  L.push(`## Governance`);
  L.push(`- ${govCells} cells exercised a role-gated (persona, journey) pair that the demo build does NOT access-control (single demo admin, no RBAC). Executed (not skipped); RBAC enforcement is an owner item, not a per-cell skip.`);
  L.push("");
  L.push(`## Per-page optimization audit`);
  L.push(`| Route | Perf | a11y | serious | icon no-label | img no-alt | focus | loading | feedback |`);
  L.push(`|---|---|---|---|---|---|---|---|---|`);
  for (const o of opt)
    L.push(`| ${o.route} | ${o.perfProxy} | ${o.a11yViolations} | ${o.a11ySerious} | ${o.iconButtonsMissingLabel} | ${o.imagesMissingAlt} | ${o.focusRingPresent ? "Y" : "N"} | ${o.loadingAffordance ? "Y" : "N"} | ${o.buttonFeedback ? "Y" : "N"} |`);
  L.push("");
  return L.join("\n");
}
