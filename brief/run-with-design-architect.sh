#!/usr/bin/env bash
# Design Architect Aider pipeline runner.
# Usage: ./brief/run-with-design-architect.sh BRIEF-XX
#
# Steps:
#   1. Extract BRIEF-XX section from brief/aider-briefs-2026-05-21.md
#   2. Pre-build: claude --model claude-opus-4-7 → brief/design-docs/BRIEF-XX-design.md
#   3. Build:    aider  --model claude-sonnet-4-6 --read <design-doc>
#   4. Review:   claude --model claude-opus-4-7 → brief/reviews/BRIEF-XX-conformance.md
#   5. BLOCK → rerun Aider with conformance report (max 2 reruns)
#   6. BLOCK after 2 reruns → exit 1 (human escalation)
#   7. PASS → print "Pipeline complete"

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 BRIEF-XX" >&2
  exit 2
fi

BRIEF_ID="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRIEFS_FILE="$ROOT/brief/aider-briefs-2026-05-21.md"
DESIGN_DIR="$ROOT/brief/design-docs"
REVIEW_DIR="$ROOT/brief/reviews"
PRE_PROMPT="$ROOT/brief/design-architect-pre-build-prompt.md"
REVIEW_PROMPT="$ROOT/brief/design-architect-review-prompt.md"

DESIGN_DOC="$DESIGN_DIR/${BRIEF_ID}-design.md"
REVIEW_DOC="$REVIEW_DIR/${BRIEF_ID}-conformance.md"
BRIEF_TMP="$(mktemp -t "${BRIEF_ID}-brief.XXXXXX.md")"
DIFF_TMP="$(mktemp -t "${BRIEF_ID}-diff.XXXXXX.patch")"

mkdir -p "$DESIGN_DIR" "$REVIEW_DIR"

cleanup() { rm -f "$BRIEF_TMP" "$DIFF_TMP"; }
trap cleanup EXIT

# --- Step 1: extract brief section --------------------------------------------
echo "[1/5] Extracting $BRIEF_ID from $BRIEFS_FILE"
awk -v id="$BRIEF_ID" '
  $0 ~ "^## " id " " { capture=1; print; next }
  capture && /^## BRIEF-/ { exit }
  capture { print }
' "$BRIEFS_FILE" > "$BRIEF_TMP"

if [[ ! -s "$BRIEF_TMP" ]]; then
  echo "ERROR: $BRIEF_ID not found in $BRIEFS_FILE" >&2
  exit 2
fi

# --- Step 2: pre-build design doc ---------------------------------------------
echo "[2/5] Generating design doc → $DESIGN_DOC"
PRE_INPUT="$(printf '%s\n\n---\nBRIEF SECTION:\n\n%s\n' "$(cat "$PRE_PROMPT")" "$(cat "$BRIEF_TMP")")"
printf '%s' "$PRE_INPUT" | claude --model claude-opus-4-7 --print > "$DESIGN_DOC"

if [[ ! -s "$DESIGN_DOC" ]]; then
  echo "ERROR: design doc generation produced empty output" >&2
  exit 1
fi

# --- Capture base commit so the diff is reproducible across reruns ------------
BASE_REF="$(git rev-parse HEAD)"

run_aider() {
  local extra_msg="${1:-}"
  local msg="Implement $BRIEF_ID per the design doc at $DESIGN_DOC. Make all acceptance criteria pass."
  if [[ -n "$extra_msg" ]]; then
    msg="$msg

Previous conformance review identified gaps. Address every BLOCK entry below before re-submitting:

$(cat "$extra_msg")"
  fi
  aider \
    --model claude-sonnet-4-6 \
    --read "$DESIGN_DOC" \
    --yes \
    --message "$msg"
}

run_review() {
  git diff --no-color "$BASE_REF"..HEAD > "$DIFF_TMP"
  local review_input
  review_input="$(printf '%s\n\n---\nDESIGN DOC:\n\n%s\n\n---\nGIT DIFF:\n\n%s\n' \
    "$(cat "$REVIEW_PROMPT")" \
    "$(cat "$DESIGN_DOC")" \
    "$(cat "$DIFF_TMP")")"
  printf '%s' "$review_input" | claude --model claude-opus-4-7 --print > "$REVIEW_DOC"
}

verdict_of() {
  local last
  last="$(grep -E '^Overall verdict: (PASS|BLOCK)$' "$1" | tail -n 1 || true)"
  if   [[ "$last" == "Overall verdict: PASS"  ]]; then echo "PASS"
  elif [[ "$last" == "Overall verdict: BLOCK" ]]; then echo "BLOCK"
  else echo "UNKNOWN"
  fi
}

# --- Step 3: initial build ----------------------------------------------------
echo "[3/5] Running Aider build (attempt 1/3)"
run_aider ""

# --- Step 4: review + rerun loop ----------------------------------------------
RERUNS=0
MAX_RERUNS=2
while : ; do
  echo "[4/5] Running conformance review → $REVIEW_DOC"
  run_review
  VERDICT="$(verdict_of "$REVIEW_DOC")"
  echo "      verdict: $VERDICT"

  case "$VERDICT" in
    PASS)
      echo "[5/5] Pipeline complete"
      exit 0
      ;;
    BLOCK)
      if (( RERUNS >= MAX_RERUNS )); then
        echo "ERROR: still BLOCK after $MAX_RERUNS reruns — escalating to human" >&2
        echo "       see: $REVIEW_DOC" >&2
        exit 1
      fi
      RERUNS=$((RERUNS + 1))
      echo "      rerun $RERUNS/$MAX_RERUNS — feeding conformance report back to Aider"
      run_aider "$REVIEW_DOC"
      ;;
    *)
      echo "ERROR: conformance report did not end with a valid 'Overall verdict:' line" >&2
      echo "       see: $REVIEW_DOC" >&2
      exit 1
      ;;
  esac
done
