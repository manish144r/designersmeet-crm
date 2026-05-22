# 03 — Analytics + Learning Agent

> **Role:** Turn platform metrics into a tighter content brief every week. PRISM gets smarter on its own.
> **Output:** `prism/analytics/<brand>/weekly-YYYY-WW.md` + updates to `prism/strategy/<brand>/pillars.md` and brief templates.

---

## 1. Metrics Tracked (per post, per platform)

| Metric | Definition | Source |
|--------|------------|--------|
| Impressions | Times shown | Platform API |
| Reach | Unique viewers | Platform API |
| Engagement rate | (likes + comments + shares + saves) / reach | Computed |
| Saves | Saves / bookmarks | Platform API |
| Shares | Reshares / retweets | Platform API |
| Click-through rate | clicks / impressions | UTM + GA4 / Plausible |
| Follower delta | net followers in the 24h after post | Platform API |
| Conversion | downstream event (signup, purchase) attributed via UTM | GA4 / server-side |

Stored in `prism/analytics/<brand>/raw/posts.parquet` (or Supabase `prism_post_metrics`).

---

## 2. Weekly Digest

`prism/analytics/<brand>/weekly-YYYY-WW.md` contains:

### Top 5 — what worked
- Post id, platform, primary metric, why it worked (hook style, hour, format, length).

### Bottom 5 — what didn't
- Same structure plus *root cause hypothesis*.

### Pattern analysis
- Cross-cut by hook style × platform.
- Cross-cut by post time × platform.
- Cross-cut by format (single image / carousel / video).
- Cross-cut by length (short / medium / long).

### Funnel
- Post → click → land → convert.
- Largest drop-off identified.
- One hypothesis to fix it next week.

### Brief template diff
- Patterns added to `prism/strategy/<brand>/pillars.md` or `hooks.md`.
- Patterns retired.
- Strategy agent retrained with new few-shot examples (commit SHA logged).

---

## 3. Content Brief Update Rules

Add a pattern to the brief template when:
- It's appeared in the top 5 ≥ 2 weeks in a row.
- It's beaten the platform median engagement by ≥ 1.5×.
- The sample size is ≥ 6 posts.

Retire a pattern when:
- It's appeared in the bottom 5 ≥ 3 weeks in a row.
- Its engagement < platform median × 0.5.

Each change recorded as a commit on `prism/strategy/<brand>/CHANGELOG.md`.

---

## 4. A/B Framework

- One variable per test. Examples: hook style, image type, post time, caption length, CTA verb.
- Minimum detectable effect (MDE) set in advance.
- Sample size: at least 10 posts per arm.
- Test runs no longer than 4 weeks.
- Winner promoted to the brief template; loser archived with reason.

Test plan committed to `prism/experiments/<id>.md` with:
- hypothesis
- variable
- arms
- MDE
- duration
- stop criteria
- final verdict + delta

---

## 5. Competitive Intelligence

- Weekly competitor scan (Research agent → Perplexity API):
  - Top 5 posts per competitor.
  - Cross-cut by format and topic.
- Gap analysis: topics they cover that we don't (and vice versa).
- Threat alerts: messaging convergence — if a competitor's voice drifts toward ours, flag for strategy review.

---

## 6. Crisis / Anomaly Detection

- **Negative sentiment spike** (> 2σ vs baseline on a single post) → pause the campaign; route to QA + Strategy.
- **Engagement velocity collapse** (top platform's average engagement drops > 30% week-over-week) → emergency strategy review.
- **Algorithm change rumours** — Strategy agent scans platform blogs + creator forums weekly; flags within 24h.

---

## 7. Reporting Cadence

- **Daily**: dashboard refresh (totals only).
- **Weekly**: digest committed every Monday 09:00 local.
- **Monthly**: pillar-level review; recalibrate the 80/20 split.
- **Quarterly**: voice card refresh based on what actually performed.

---

## 8. Lessons Loop (cross-pipeline)

Every PRISM incident (compliance miss, voice drift, dead link in production, sentiment spike) logs to `agents/lessons-learned.md` with `Agent = PRISM` and `Phase = <Strategy|Creation|QA|Schedule|Distribution|Analytics>`. `retro-runner.sh` surfaces patterns and points at this file for the rule update.

---

## 9. Analytics Self-Check

- [ ] All metrics ingested for the week
- [ ] Top 5 / Bottom 5 logged
- [ ] Funnel drop-off identified
- [ ] Pattern analysis written
- [ ] Brief template diff applied (and committed)
- [ ] A/B tests checkpointed
- [ ] Competitor scan filed
- [ ] Crisis dashboards green
