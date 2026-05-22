# NightFactory — Master Vision

> **NightFactory is a self-improving factory for building, deploying, shipping, and growing businesses. It operates through specialised agent pipelines, each trained on best practices for their domain. Every failure makes it smarter. Every build raises the quality bar. The goal: any business, built correctly, the first time, shipped, grown.**

---

## The Four Pipelines

NightFactory is one factory, four production lines. Each line owns a domain. Each line has a checklist, a roster of agents, a self-learning loop, and explicit handoffs to the others.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          NIGHTFACTORY MASTER LOOP                        │
│                                                                          │
│   STRATEGY ─→ BUILD ─→ SHIP ─→ GROW ─→ LEARN ─→ STRATEGY (repeat)        │
│                 │        │       │        │                              │
│                 ▼        ▼       ▼        ▼                              │
│              APP PL.  WEBSITE  PRISM   OPS 365                           │
│                                                                          │
│              every BLOCK, every Sev1, every win → lessons-learned.md     │
│              every Mon 09:00 → retro-runner.sh updates training files    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. App Pipeline — `agents/00..09`

**Purpose:** turn a business brief into a shipped, monitored, growing SaaS / internal tool / mobile app.

**Inputs**
- Locked brief from Design Architect (FRs / NFRs / ERD / OpenAPI / RBAC / threat model / tokens / mockups).
- Routing budget (`cost_budgets_usd`) per provider.
- Pass-score gate ≥ 95% (Aider 95-gate rule).

**Agents**
1. Design Architect (Opus 4.7) — `01-design-architect-agent.md`
2. Builder (Aider + Sonnet fallback) — `02-builder-agent.md`
3. Reviewer (Codex) — `03-reviewer-agent.md`
4. Tester (Playwright + 10k persona suite) — `04-tester-agent.md`
5. Security — `05-security-agent.md`
6. DevOps (CI/CD, deploy, rollback) — `06-devops-agent.md`
7. Platform specialisations — `08-platform-agents.md`

**Outputs**
- Production deployment of the app.
- Audit log, cost ledger, runbooks.
- Lessons logged.

**Self-learning**
- `07-self-learning-system.md` — failure → root cause → rule → retro → escalation ladder → machine-enforced guard.

**Hands off to**
- Website pipeline for the marketing site that wraps the app.
- PRISM pipeline for launch and ongoing distribution.
- Ops 365 for monitoring + growth.

---

## 2. Website Pipeline — `agents/website/`

**Purpose:** ship a brand-faithful, accessible, fast, SEO-strong website that converts.

**Inputs**
- Brand brief, content strategy, SEO brief, competitor analysis.
- Design system tokens (`brief/tokens.json`).
- Numeric success metric (organic growth × 3, conversion ≥ 2.5%).

**Agents**
1. Design Director (Opus) — `website/01-designer-agent.md`
2. Coder — `website/02-coder-agent.md`
3. Design QA — `website/03-design-qa-agent.md`
4. Performance / SEO is built into Coder + DevOps from the app pipeline.

**Outputs**
- Deployed website at owned domain.
- Lighthouse SEO ≥ 95, CWV green.
- Analytics + CMS live.

**Self-learning**
- VR baselines + design QA log dev/designer drifts; recurring drifts harden into lint/CI rules.
- CWV regressions over time → escalate to coder training.

**Hands off to**
- PRISM pipeline for distribution.
- Ops 365 for uptime / cost / SEO tracking.

---

## 3. PRISM Social Pipeline — `agents/prism/`

**Purpose:** content factory for 15+ platforms — distribute the work, grow the audience, drive inbound to the App + Website pipelines.

**Inputs**
- Brand voice card.
- Content pillars (3–5 per brand).
- Topic calendar (4 weeks ahead).
- Platform matrix + cadence.

**Agents**
1. Research (Perplexity API) — trend + competitor scan.
2. Brief (Sonnet) — per-post one-pager.
3. Content writer (Cerebras Qwen3-235B / Sonnet) — draft + per-platform variants.
4. Visual (Higgsfield / HeyGen / Seedance) — image / video.
5. QA (Haiku, Sonnet for edge cases) — `prism/02-content-qa-agent.md`.
6. Scheduler (deterministic — Postiz / Ayrshare) — queue, UTM, collision check.
7. Analytics + Learning (Sonnet) — `prism/03-analytics-learning-agent.md`.

**Outputs**
- Daily posts across LinkedIn / X / Instagram / TikTok / FB / YT Shorts / Pinterest / Threads / Bluesky / Mastodon / Reddit / Discord / Slack / Email.
- Weekly digest with top/bottom 5 and pattern updates.
- Continually refined brief templates.

**Self-learning**
- Top 20% content → patterns extracted → brief template updated → content agent retrained.
- A/B framework — one variable per test.
- Failing patterns retired automatically after threshold.

**Hands off to**
- Ops 365 for cost tracking + alerting on compliance / sentiment / virality.
- App pipeline when posts surface a product gap (roadmap-queue item).

---

## 4. Ops 365 Pipeline — `agents/ops365/`

**Purpose:** keep every business open, every dollar accountable, every metric moving. 24/7/365.

**Inputs**
- Heartbeats from all workers and scheduled tasks.
- Provider bills, audit logs, SIEM feed.
- Business KPIs (Stripe / Shopify / CRM).

**Agents**
1. Monitoring — `ops365/01-monitoring-agent.md`
2. Incident Response — `ops365/02-incident-response-agent.md`
3. Cost Control — deterministic, with circuit breakers (NF `agent-routing.json`).
4. Business Growth — `ops365/03-business-growth-agent.md`.

**Outputs**
- Always-on dashboards (Grafana / SigNoz).
- Daily KPI one-pagers per business.
- Monthly funnel audits → roadmap-queue items.
- Quarterly OKR review.

**Self-learning**
- Post-mortems blameless, logged.
- Runbook updates per incident.
- Quarterly tabletop drills produce at least one lesson each.

**Hands off to**
- App pipeline — roadmap-queue items become Phase 0 briefs.
- Website pipeline — copy / conversion fixes routed to website coder.
- PRISM pipeline — messaging tests routed to content strategy.

---

## Cross-Pipeline Dependencies

```
        ┌────────────────┐
        │  App Pipeline  │◀──── Roadmap queue (from Ops 365 / PRISM findings)
        └────────┬───────┘
                 ▼
   ┌──────────────────────┐
   │  Website Pipeline    │◀──── Brand updates (Designer-led)
   └────────┬─────────────┘
            ▼
     ┌────────────────┐
     │  PRISM Social  │◀──── Launches / promotions (from App + Website)
     └────────┬───────┘
              ▼
       ┌────────────┐
       │  Ops 365   │──── feeds back into App + Website + PRISM
       └────────────┘
```

Every pipeline produces lessons → `agents/lessons-learned.md`. Every Monday `agents/retro-runner.sh` reads that file and updates the agent training files for whichever pipeline owns the failure class.

---

## Master Self-Learning Loop

1. **Detect** — any pipeline's gate trips, any production incident, any pattern flagged by analytics.
2. **Root cause** — 24h, 5 Whys, written.
3. **Lesson** — entry in `agents/lessons-learned.md` (Date | Agent | Phase | What | Root | Rule | Verified).
4. **Rule** — added to the relevant training file under §7 of `agents/07-self-learning-system.md`.
5. **Retro** — Monday 09:00 local, `retro-runner.sh` writes the summary, names files to update.
6. **Escalate** — patterns at count ≥ 3 promoted to machine-enforced check (lint / CI / pre-commit).
7. **Verify** — Verified column flips Y on the next clean retro cycle.

---

## Operating Principles

- **Cheapest capable agent.** Free-tier first (Cerebras / Groq / OpenRouter / SambaNova); paid only when quality demands it.
- **Same brief, every pipeline.** Lock once, build everywhere.
- **Lessons over preferences.** Rules come from incidents, not from taste.
- **Designer signs off on builds.** Architect signs off on briefs. CEO signs off on strategy.
- **Daily over heroic.** Small, consistent improvements over big-bang launches.
- **Free tier preferred. Self-host when recurring spend > $50/mo.** (Gemma 4 on M2 pattern.)
- **No work that another, cheaper agent can do.** (NF AGENTS.md routing rule.)

---

## North-Star Metrics

| Pipeline | North-star |
|----------|-----------|
| App | Pass-score ≥ 95% on every release; ≤ 24h from gate-green to prod |
| Website | Lighthouse SEO ≥ 95; CWV green at 75th percentile RUM |
| PRISM | Engagement rate ≥ 1.5× platform median; inbound > paid for lead source |
| Ops 365 | 99.9% uptime per business; daily spend < daily budget; one growth lever tested per business per week |

---

## Portfolio Allocation (sync with `CLAUDE.md`)

| Business | Weight | Pipeline focus |
|----------|--------|----------------|
| ProcessBI | 35% | App (Fabric tooling), Website, PRISM (LinkedIn-led), Ops 365 |
| Designersmeet | 30% | App (this CRM), Website, PRISM, Ops 365 |
| RawFit | 15% | Website + PRISM-heavy, App later, Ops 365 |
| DentalOps | 15% | Ops 365 (deal-flow tracking), App (DD tools) — acquisition-only scope |
| AtomicSMSF | 5% | Ops 365 (compliance) — ATO-only scope |

Cycles, scheduled tasks, and growth tests allocate effort by these weights.

---

## The Bet

Most software is built by humans who forget last week's lesson. NightFactory writes the lesson down, builds the rule, machine-enforces it, and the next build cannot make the same mistake. That compound interest is the moat.
