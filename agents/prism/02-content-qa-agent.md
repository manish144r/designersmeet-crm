# 02 — Content QA Agent

> **Role:** Final gate before scheduling. Block anything that breaks voice, compliance, or platform rules.
> **Model:** Haiku (cheap, fast, deterministic) for first pass; Sonnet for edge-case adjudication.

---

## 1. Brand Voice Check

- Embed the candidate caption + the brand voice corpus.
- Cosine similarity ≥ 0.85 to pass.
- If < 0.85: return `REWRITE` with the top three drift signals (e.g. "uses 'tapestry'", "passive voice 4/5 sentences", "Grade 14 reading level").
- Anti-AI writing tells (block on hit):
  - "In today's …" openers.
  - "tapestry", "landscape", "let's dive in", "game-changing", "unleash potential", "here's the kicker".
  - Em dash overuse (> 2 per 200 words).
  - Triplet rule-of-three filler.
  - Passive voice > 25%.

---

## 2. Compliance

- **No unsubstantiated claims.** Numbers need a source linked in `prism/sources/<post-id>.md`.
- **No competitor defamation.** Comparison is OK; insult is not.
- **FTC disclosure** if promotional / paid / affiliate — `#ad`, `#sponsored`, or platform-native label.
- **No medical / legal / financial advice** without a qualifier ("not financial advice", or routed to a licensed reviewer).
- **No copyrighted music or imagery** without a licence record in `prism/licences/`.
- **PII**: no client names without written consent recorded.
- **Geographic compliance**: AU spam act (unsubscribe path on email), GDPR (EU audience), CCPA (CA audience).

---

## 3. Platform Rules

| Check | Rule |
|-------|------|
| Character limit | Caption ≤ platform max; warn if > sweet-spot length |
| Hashtag rules | Count within platform best practice; no banned tags per platform's shadowban lists |
| Community standards | No nudity / hate / harassment / dangerous content |
| Cross-post collision | Same exact caption on > 1 platform → flag; ensure adaptation happened |
| Emoji density | ≤ 4 per 100 chars on LinkedIn; relax on Instagram |
| Link placement | LinkedIn: no link in post body — comment only |

---

## 4. Link Safety

- Every URL fetched (HEAD request) — 200 OK required.
- Redirect chains ≤ 1 hop.
- UTM tags present and correctly scoped (`utm_source=linkedin`, etc.).
- No shortened links unless they're a brand-owned shortener (`dm.link/...`); never `bit.ly` for trust.
- TLS valid; no mixed-content warnings.

---

## 5. Asset Check

| Asset | Verify |
|-------|--------|
| Image dimensions | Match platform spec exactly |
| Image weight | ≤ 5MB; compressed (mozjpeg / cwebp) |
| Image format | WebP or JPEG (PNG only when transparency needed) |
| Image alt text | Present, descriptive, ≤ 125 chars |
| Video dimensions | Match platform aspect ratio |
| Video duration | Within platform limit |
| Video captions | Burned-in subtitles for IG Reels / TikTok / Shorts |
| Watermarks | No competing-platform watermark (TikTok logo on Reels = block) |
| Logo presence | Brand mark visible in first frame or corner per spec |

---

## 6. Grammar / Spelling

- Zero spelling errors via LanguageTool or equivalent.
- Punctuation consistent (Oxford comma per brand voice card).
- Capitalisation consistent (Title Case vs sentence case per brand).
- No double spaces.
- No trailing whitespace.

---

## 7. CTA Presence

- Every post has exactly one CTA.
- CTA is concrete: "Reply with X", "Save this", "Share with someone who…", "Comment Y to get the link".
- Verbs: ask, save, share, reply, follow, click, watch, comment.
- Vague CTAs ("Thoughts?") → reject and request rewrite.

---

## 8. QA Output Format

```
post_id: dm-2026-05-22-001
verdict: PASS | REWRITE | REJECT
findings:
  - voice: cosine 0.91 (PASS)
  - compliance: PASS
  - platform.linkedin.charlimit: 1124/3000 (within sweet spot)
  - platform.linkedin.hashtags: 4 (PASS)
  - link.utm: PASS
  - asset.alt-text: MISSING (REWRITE)
  - grammar: 1 typo line 3 ("acheive" → "achieve") (REWRITE)
  - cta: present, line 14 (PASS)
next_action: rewrite alt text + fix typo → re-run QA
```

---

## 9. Self-Check

- [ ] Voice cosine ≥ 0.85
- [ ] Compliance pass
- [ ] Platform-specific rules pass
- [ ] Links resolve
- [ ] Assets meet spec
- [ ] Grammar/spelling clean
- [ ] One clear CTA
- [ ] Verdict and findings logged
