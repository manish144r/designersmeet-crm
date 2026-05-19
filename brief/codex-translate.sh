#!/usr/bin/env bash
# Codex fidelity pass: translate each brief/mockups/<slug>.html into a React TSX
# page. Codex is the SOLE LLM in this loop. Parallel batches of 4.
set -u
ROOT="C:/Users/smani/CompanyWorkspaces/Designersmeet/crm-app/.claude/worktrees/heuristic-shockley-16d49b"
MOCK="$ROOT/brief/mockups"
OUT="$ROOT/packages/frontend/src/pages"
LOG="$ROOT/brief/.codex-log"
DATE="2026-05-19"
PER_CALL_TIMEOUT="${PER_CALL_TIMEOUT:-460}"
mkdir -p "$OUT" "$LOG"

SLUGS="${SLUGS:-01-signin 02-onboarding 03-dashboard 04-contacts 05-contact-detail 06-vendors 07-vendor-detail 08-projects-board 09-project-detail 10-pipelines 11-calendar 12-conversations 13-workflows 14-forms 15-settings 16-spec-sheet}"

build_prompt() {
  local slug="$1" pf="$2" extra="${3:-}"
  {
    cat <<EOF
Translate this HTML mockup into a React TypeScript functional component (TSX + Tailwind). Match the mockup exactly: same DOM structure, same visual layout, identical spacing/typography. Map all CSS to Tailwind utility classes from the project's design tokens. STRICT COLOR RULES: Indigo 600 (#4F46E5) ONLY on primary CTA buttons, active sidebar nav item, active tab indicators, and key-success status badges. Everywhere else: white (#FFFFFF) surfaces, off-white (#FAFAFA) sidebar background, slate (#0F172A) text. NO inline hex codes — use Tailwind classes from the token system (bg-primary, text-foreground, etc.). Use shadcn/ui Button/Card/Input/Tabs/Dialog where they fit. Default export named after the mockup slug in PascalCase. Header comment: "Generated from brief/mockups/${slug}.html via Codex fidelity pass ${DATE}. Do not hand-edit." Output: pure TSX, no markdown fences. HTML follows:
EOF
    cat "$MOCK/$slug.html"
    [ -n "$extra" ] && printf '\n\n%s\n' "$extra"
  } > "$pf"
}

post() {
  awk '/^```/{f=!f;next}{print}' "$1" \
   | awk 'BEGIN{s=0} s==0 && /^(import |\/\*|\/\/|export |const |function |type |interface |"use)/ {s=1} s==1{print}'
}

valid() { # $1=file : has export default AND last non-empty char is }
  [ -f "$1" ] || return 1
  grep -q "export default" "$1" || return 1
  [ "$(wc -c < "$1")" -gt 250 ] || return 1
  [ "$(awk 'NF{l=$0} END{gsub(/[[:space:]]/,"",l); print substr(l,length(l),1)}' "$1")" = "}" ]
}

translate() {
  local slug="$1"
  local pf="$LOG/$slug.prompt.txt" raw="$LOG/$slug.raw.txt" dst="$OUT/$slug.tsx"
  if valid "$dst"; then echo "SKIP $slug (already valid)"; return; fi
  local attempt=1
  while [ $attempt -le 3 ]; do
    build_prompt "$slug" "$pf"
    : > "$raw"
    timeout "$PER_CALL_TIMEOUT" codex exec --sandbox read-only --skip-git-repo-check \
      -C "$ROOT/packages/frontend" -o "$raw" - < "$pf" > "$LOG/$slug.codex.$attempt.log" 2>&1
    post "$raw" > "$dst"
    if valid "$dst"; then echo "OK   $slug a$attempt ($(wc -l < "$dst") lines)"; return; fi
    attempt=$((attempt+1))
  done
  echo "FAIL $slug"
}

i=0
for slug in $SLUGS; do
  translate "$slug" &
  i=$((i+1))
  [ $((i % 4)) -eq 0 ] && wait
done
wait
echo "=== codex-translate done ==="
for s in $SLUGS; do valid "$OUT/$s.tsx" && echo "  valid: $s" || echo "  MISSING/INVALID: $s"; done
