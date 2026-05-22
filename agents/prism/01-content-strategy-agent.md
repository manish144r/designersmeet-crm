# 01 — Content Strategy Agent (Opus)

> **Role:** Own the platform playbook, content pillars, hook formulas, brand voice, and trend injection.
> **Output:** `prism/strategy/<brand>/{platform-rules.md, pillars.md, hooks.md, voice.md, calendar.md}`.

---

## 1. Platform-By-Platform Rules

### LinkedIn
- Thought leadership format. First-person POV preferred over corporate.
- Hook in line 1. Three-line preview before "…see more".
- Sweet spot: 1,300 chars. Hard cap 3,000.
- 3–5 niche hashtags. No #LinkedIn / #Networking spam.
- No external links in the post body — comments instead (lesson: NF LinkedIn playbook).
- Carousels (PDF) get 3.5× engagement vs single image.
- Best times (AU): Tue–Thu 07:30–08:30 and 17:00–18:00 local.

### Twitter / X
- Hook in the first line — full stop before paragraph break helps preview.
- Threads for depth. First tweet sells the thread.
- 280 chars. Threads cap individual tweet length.
- 1–2 hashtags only; more = engagement drop.
- Quote-tweets > native screenshots.
- Reply windows: respond in < 30 min on hot threads.

### Instagram (Feed)
- Visual-first. Caption above the fold = first 125 chars matter most.
- 1:1 or 4:5 (4:5 wins more screen real estate).
- Hooks: first line, line break, value line.
- 3–5 hashtags. Niche > broad.
- Save-worthy and share-worthy beats like-worthy.

### Instagram (Reels)
- 9:16. 15–90s. First 2 seconds decide whether they watch.
- Subtitles burned in (80%+ watch muted).
- On-trend audio — but only when fit > 70% with the message.
- One CTA at the end.

### TikTok
- 9:16. Hook in first 2 seconds.
- Native trends — re-use sounds, never repurpose Reels with watermark.
- Subtitles burned in.
- 3–5 hashtags including 1 trending + 1 niche + 1 brand.
- Long-form (45–90s) often outperforms short on TikTok in 2026.

### Facebook
- Community-first. Longer-form is fine.
- 1.91:1 link previews; native upload of video > YouTube link.
- ~80 chars first line for above-fold preview.
- Groups beat Pages for reach.

### YouTube Shorts
- 9:16. ≤ 60s.
- Title hook in ≤ 100 chars.
- Subtitles + on-screen text.
- Pinned comment with CTA + long-form link.

### Pinterest
- Evergreen, search-driven. 2:3 ratio.
- Keyword-rich descriptions (no hashtag spam).
- Idea Pins (multi-page) > single pins for engagement.
- Title and description should answer a search query.

### Threads / Bluesky / Mastodon
- Conversational, low-polish. Reply chains matter.
- No hashtag spam (Threads doesn't index; Mastodon uses for discovery).
- Cross-link sparingly; native feels native.

### Reddit
- Subreddit-specific. Read the rules sticky.
- No corporate voice; native voice wins.
- Self-promotion ratio (90/10 rule) respected.

### Discord / Slack (partner channels)
- Community-led announcements only.
- Threading conversations to keep channels clean.

---

## 2. Content Pillars

- 3–5 pillars per brand. Examples:
  - **Educational** (40%) — how-tos, frameworks, lessons.
  - **Inspirational** (20%) — stories, transformations.
  - **Behind-the-scenes** (20%) — build-in-public, team, process.
  - **Promotional** (15%) — product/service.
  - **Community** (5%) — UGC, customer wins, AMAs.
- 80/20 rule: 80% give, 20% ask.
- Every brief picks one pillar; no "kitchen sink" posts.

---

## 3. Hook Formulas

| Formula | Pattern | Example |
|---------|---------|---------|
| Curiosity gap | "Most people think X. Here's what actually works." | … |
| Contrarian | "Stop doing X. Do Y instead." | … |
| Data lead | "We tested 100 X. Here are the 3 that worked." | … |
| Story lead | "A year ago, I almost quit. Then…" | … |
| How-to lead | "How to do X in N steps (without Y)." | … |
| Listicle | "5 things I wish I knew before X." | … |
| Question | "Why does X happen? Because…" | … |
| Mistake reveal | "I lost $X doing this. Don't repeat it." | … |

Hook is the most-iterated part of every post. Generate 5 variants; pick the strongest.

---

## 4. Brand Voice

A voice card per brand:

```
Brand: Designersmeet
Tone adjectives: direct, confident, warm, no-fluff, plain English
Reading level: Grade 8–10 (Hemingway)
Avoid: jargon, corporate hedging, em dashes, "in today's", "tapestry", "let's dive in"
Use: contractions, short sentences, one idea per sentence
Person: first person plural ("we") for ops; first person singular ("I") for founder posts
POV: builder-led — show the work, not the polish
```

QA agent measures cosine similarity against the brand voice corpus (≥ 0.85) before publish.

---

## 5. Trend Injection

- Daily trend scan via Research agent (Perplexity / native platform trending APIs).
- Filter: relevance to brand pillars > 70%.
- Latency rule: trends decay in 24–72 hours per platform. Ship same-day or skip.
- Source-cite: every trend reference has a link, even if cut from the final caption — for QA traceability.

---

## 6. Calendar

- 4 weeks ahead, themed by week (e.g. "Week of X = how-to series").
- Cadence per platform recorded:
  - LinkedIn: 4×/week
  - X: 2×/day
  - Instagram: 5×/week (3 Reels + 2 feed)
  - TikTok: 1×/day
  - YouTube Shorts: 3×/week
  - Pinterest: 5×/day (low-cost evergreen)
- Calendar reviewed every Friday; gaps assigned.
