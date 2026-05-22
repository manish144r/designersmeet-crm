#!/usr/bin/env bash
# agents/retro-runner.sh
# Weekly retro: read lessons-learned.md, group by agent and phase, surface top patterns,
# write a dated summary, and print which training files probably need updating.
#
# Usage:
#   bash agents/retro-runner.sh                # run today's retro
#   bash agents/retro-runner.sh 2026-05-22     # run a back-dated retro
#
# Exit codes:
#   0 — summary written
#   1 — lessons-learned.md missing
#   2 — no entries found

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LESSONS="${SCRIPT_DIR}/lessons-learned.md"
TODAY="${1:-$(date +%Y-%m-%d)}"
OUT="${SCRIPT_DIR}/retro-summary-${TODAY}.md"

if [ ! -f "$LESSONS" ]; then
  echo "ERROR: $LESSONS not found." >&2
  exit 1
fi

# Each lesson entry starts with "## YYYY-MM-DD —"
ENTRIES=$(grep -c '^## [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}' "$LESSONS" || true)
if [ "$ENTRIES" -eq 0 ]; then
  echo "No lesson entries found in $LESSONS." >&2
  exit 2
fi

# Count failures by Agent.
AGENT_COUNTS=$(grep -E '^\| Agent \|' "$LESSONS" \
  | sed -E 's/.*Agent \| //; s/ \|.*//' \
  | tr ',' '\n' | sed 's/^ *//; s/ *$//' \
  | grep -E '^[0-9]+' \
  | sort | uniq -c | sort -rn || true)

# Count failures by Phase.
PHASE_COUNTS=$(grep -E '^\| Phase \|' "$LESSONS" \
  | sed -E 's/.*Phase \| //; s/ \|.*//' \
  | sort | uniq -c | sort -rn || true)

# Count failures by Severity.
SEV_COUNTS=$(grep -E '^\| Severity \|' "$LESSONS" \
  | sed -E 's/.*Severity \| //; s/ \|.*//' \
  | sort | uniq -c | sort -rn || true)

# "Top recurring patterns" — group lesson titles by first 3 significant words.
TITLES=$(grep -E '^## [0-9]{4}-[0-9]{2}-[0-9]{2} — ' "$LESSONS" \
  | sed -E 's/^## [0-9]{4}-[0-9]{2}-[0-9]{2} — //' || true)

# Identify which agent files need updating based on top agents.
TRAINING_FILES_NEEDING_UPDATE=$(echo "$AGENT_COUNTS" \
  | awk '$1 >= 2 {print $2}' \
  | while read -r agent; do
      ls "${SCRIPT_DIR}"/${agent}-*.md 2>/dev/null || true
    done || true)

{
  echo "# Retro Summary — ${TODAY}"
  echo
  echo "_Source: \`agents/lessons-learned.md\` (${ENTRIES} entries total)._"
  echo
  echo "## Failures by Agent"
  echo
  if [ -n "$AGENT_COUNTS" ]; then
    echo '```'
    echo "$AGENT_COUNTS"
    echo '```'
  else
    echo "_No agent-tagged failures._"
  fi
  echo
  echo "## Failures by Phase"
  echo
  if [ -n "$PHASE_COUNTS" ]; then
    echo '```'
    echo "$PHASE_COUNTS"
    echo '```'
  else
    echo "_No phase-tagged failures._"
  fi
  echo
  echo "## Failures by Severity"
  echo
  if [ -n "$SEV_COUNTS" ]; then
    echo '```'
    echo "$SEV_COUNTS"
    echo '```'
  else
    echo "_No severity-tagged failures._"
  fi
  echo
  echo "## Lesson titles (newest first)"
  echo
  echo "$TITLES" | sed 's/^/- /'
  echo
  echo "## Training updates likely needed"
  echo
  if [ -n "$TRAINING_FILES_NEEDING_UPDATE" ]; then
    echo "Agents with 2+ logged failures should be audited this week:"
    echo
    echo "$TRAINING_FILES_NEEDING_UPDATE" | sed 's|.*/agents/|- agents/|'
  else
    echo "_No agent has 2+ failures in the log — no audit required this week._"
  fi
  echo
  echo "---"
  echo "_Action: for every Agent in the list above, walk its training file and confirm a"
  echo "check exists that would have caught the failure. If not, add it, push, log the_"
  echo "_change as a new lesson entry. See agents/07-self-learning-system.md._"
} > "$OUT"

echo "Wrote $OUT"
echo
echo "Training update needed in:"
if [ -n "$TRAINING_FILES_NEEDING_UPDATE" ]; then
  echo "$TRAINING_FILES_NEEDING_UPDATE" | sed 's|.*/agents/|  agents/|'
else
  echo "  (none — no agent has 2+ failures)"
fi
