# 00 — PRISM Social Pipeline Master Checklist
> Content factory for 15+ platforms. Brief → AI draft → human review → asset → adapt → schedule → distribute → analyse → learn.
> Binary pass/fail per phase. Agent ownership per row.

---

## Phase 0 — STRATEGY

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 0.1 | Platform matrix filled | Strategy | Audience × tone × format × frequency per platform |
| 0.2 | Content pillars set | Strategy | 3–5 pillars per brand; 80/20 educational/promotional split |
| 0.3 | Topic calendar | Strategy | 4 weeks ahead minimum, themed by week |
| 0.4 | Brand voice locked | Strategy | Tone adjectives + reading level + banned phrases |
| 0.5 | Success metric | Ops | Numeric per platform (e.g. LI eng-rate ≥ 4%, IG reach ≥ X, click-through ≥ Y) |
| 0.6 | Compliance baseline | QA | FTC disclosure rules, banned hashtags per platform, brand-safe topics |
| 0.7 | Asset library exists | Visual | Logo lockups, font files, colour tokens — ready for Higgsfield/HeyGen |

Exit gate: strategy doc committed to `prism/strategy/<brand>/v1.md`.

---

## Phase 1 — CREATION

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 1.1 | Brief produced | Brief | One-pager per post: pillar, angle, hook, CTA, platforms, due date |
| 1.2 | AI draft generated | Content writer | Long-form source draft (1 per topic), copy variants per platform |
| 1.3 | Visual brief generated | Visual | Image/video spec — ratio, duration, on-brand prompts |
| 1.4 | Asset generated | Visual (Higgsfield / HeyGen / Seedance) | Output passes brand-asset check |
| 1.5 | Caption + hashtags drafted | Content writer | Per platform; respects char limits and hashtag rules |
| 1.6 | Human review (or QA agent) | QA | Brand voice + compliance pass |

Exit gate: post bundle (text + asset + per-platform variants) staged in `prism/queue/staging/`.

---

## Phase 2 — PLATFORM ADAPTATION

Each piece adapted to platform spec:

| Platform | Char limit (caption) | Image ratio | Video length | Hashtags |
|----------|----------------------|-------------|--------------|----------|
| LinkedIn | 3,000 (sweet ~1,300) | 1.91:1 or 1:1 | ≤ 10 min | 3–5 niche |
| X / Twitter | 280 | 16:9 / 1:1 | ≤ 2:20 | 1–2 |
| Instagram feed | 2,200 (first 125 above fold) | 1:1 or 4:5 | ≤ 90s (Reels ≤ 90s) | 3–5 |
| Instagram Reels | 2,200 | 9:16 | 15–90s | 3–5 |
| TikTok | 2,200 | 9:16 | 7–90s preferred | 3–5 native trends |
| Facebook | 63,206 (best ~80) | 1.91:1 | ≤ 240 min | optional |
| YouTube Shorts | 100 (title) + 5,000 (desc) | 9:16 | ≤ 60s | tags in desc |
| Pinterest | 500 (desc) | 2:3 | ≤ 60s | keyword-rich, no hashtags |
| Threads | 500 | 1:1 / 4:5 | ≤ 5 min | none |
| Bluesky | 300 | 1:1 / 16:9 | n/a | minimal |
| Mastodon | 500 | 16:9 | ≤ 41s | minimal, content warning where appropriate |
| Reddit | sub-dependent | per sub | per sub | community-led, no spam |
| Discord | 2,000 | any | ≤ 25MB | community-led |
| Slack (partner channels) | 40,000 | any | ≤ 1GB | n/a |
| Email digest | n/a | 1.91:1 hero | ≤ 30s | n/a |

Exit gate: every platform variant exists or is explicitly skipped with reason.

---

## Phase 3 — SCHEDULING

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 3.1 | Posts queued in scheduler | Scheduler | Postiz / Ayrshare / Buffer — one slot per (piece × platform) |
| 3.2 | Optimal post times applied | Scheduler | Per-platform per-audience-timezone heatmap |
| 3.3 | UTM tags applied | Scheduler | `utm_source` per platform, `utm_campaign` per series |
| 3.4 | Cross-poster collisions checked | Scheduler | Same exact caption on > 1 platform = flag |
| 3.5 | Approval label set | QA | `READY-TO-PUBLISH` |

Exit gate: scheduler shows the next 7 days fully booked or intentionally empty.

---

## Phase 4 — DISTRIBUTION

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 4.1 | First 60 min monitored | Analytics | Engagement velocity recorded |
| 4.2 | Reply to early comments | Engagement | < 30 min on top platforms |
| 4.3 | Amplify top performers | Strategy | If engagement velocity > 2× baseline → boost / cross-post / DM thread |
| 4.4 | Crisis check | QA | Negative sentiment spike → pause campaign |

---

## Phase 5 — ANALYTICS

| # | Check | Cadence | Owner |
|---|-------|---------|-------|
| 5.1 | Engagement rate, reach, follower delta, click-through, conversion | Daily | Analytics |
| 5.2 | Top 5 / Bottom 5 of the week | Weekly | Analytics |
| 5.3 | Funnel: post → click → land → convert | Weekly | Analytics |
| 5.4 | Competitor top posts | Weekly | Strategy |
| 5.5 | Platform algorithm changes | Weekly | Strategy |

---

## Phase 6 — LEARNING LOOP

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 6.1 | Top 20% content analysed | Analytics | Winning patterns extracted (hook style, format, time, length) |
| 6.2 | Brief template updated | Strategy | Winning patterns added; failing patterns retired |
| 6.3 | Content agent retrained | Strategy + Content | Prompt + few-shot examples refreshed |
| 6.4 | Lessons logged | Ops | `agents/lessons-learned.md` |

---

## Agent Roster

| Agent | Role | Model preference |
|-------|------|------------------|
| Research | Trends + competitor scan | Perplexity API (Night Factory routing) |
| Brief | One-pager per post | Sonnet |
| Content writer | Draft + per-platform variants | Cerebras Qwen3-235B (free) or Sonnet (premium) |
| Visual | Image/video gen | Higgsfield / HeyGen / Seedance |
| QA | Brand voice + compliance | Haiku (cheap, fast) |
| Scheduler | Queue + UTM + collision check | Deterministic script (Postiz/Ayrshare API) |
| Analytics | Metrics + weekly digest | Haiku for write-up; raw via platform APIs |
| Learning | Pattern extraction + template update | Sonnet (reasoning) |

---

## CI / Automation Gates

- `ci/brand-voice` — embedding cosine similarity to brand voice corpus ≥ 0.85
- `ci/compliance` — banned-word scan, FTC disclosure check
- `ci/asset-spec` — image dimensions, video duration match platform spec
- `ci/link-check` — every URL 200 OK
- `ci/grammar` — zero spelling errors via languagetool
- Approval label `READY-TO-PUBLISH` required to leave staging
