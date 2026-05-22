# Design Architecture Agent — Specification

**Model:** `claude-opus-4-7`
**Role:** Brief-to-design translator and build conformance reviewer for the Aider pipeline.
**Status:** Required gate on every UI brief. No exceptions.

---

## Why this agent exists

Aider (claude-sonnet-4-6) is a fast, literal coding agent. It has zero product intuition. A brief that reads "wire the modal" leaves Aider to invent contracts, names, error states, and acceptance behaviour — which it does inconsistently. The Design Architect Agent removes that gap by producing a fully specified design doc before Aider touches code, and verifying the diff matches the spec after.

The agent fires at two points in the pipeline. Both are mandatory.

---

## Point 1 — Pre-build (design doc generation)

**Input**
- A single BRIEF section extracted from `brief/aider-briefs-2026-05-21.md`.
- The system prompt at `brief/design-architect-pre-build-prompt.md`.

**Output**
- `brief/design-docs/BRIEF-XX-design.md` containing exactly five sections:

  1. **Data Model** — every entity touched, full Zod-equivalent shape, status enums, IDs. Source of truth is `packages/shared/`; reuse existing schemas where present and call out new ones.
  2. **Frontend Interaction Spec** — table form. One row per interactive element. Columns: `Element`, `Trigger`, `Validation`, `API Call`, `Success Path`, `Error Path`.
  3. **Component Wiring Map** — hooks, stores, and external libs each component depends on. Naming convention: `useMutation(postX)`, `useUIStore.openModal()`, `toast from sonner`, etc. Must name files and exports.
  4. **Acceptance Criteria** — numbered, binary (pass/fail), independently verifiable. No vague verbs ("works", "looks right"). Use "renders", "calls", "shows toast with text ‹X›", "navigates to ‹route›", "disables submit until ‹condition›".
  5. **Playwright Test Stubs** — one `test('AC-N: ...')` block per AC. Stubs name selectors, expected calls, and assertions. Implementation may be left as `// TODO` but selectors and assertions must be concrete.

**Hard rules baked into the prompt**
- No "TBD" anywhere.
- Every UI element has a defined action.
- Every API call has full contract: method, path, request body, response shape, error codes.
- Every AC is binary.

**Worked example:** `brief/design-docs/BRIEF-EXAMPLE-design.md` (Settings → Invite Users).

---

## Point 2 — Post-build (conformance review)

**Input**
- The design doc from Point 1 (`brief/design-docs/BRIEF-XX-design.md`).
- The git diff produced by Aider for the same brief (`git diff --no-color <base>..HEAD`).
- The system prompt at `brief/design-architect-review-prompt.md`.

**Output**
- `brief/reviews/BRIEF-XX-conformance.md` containing:
  - One block per AC: `AC-N: PASS` or `AC-N: BLOCK` with exact `file:line` and `found vs expected` when BLOCK.
  - No remediation suggestions — only gap reporting. Fixes are Aider's job, not the reviewer's.
  - Final line, exactly one of: `Overall verdict: PASS` or `Overall verdict: BLOCK`.

**Decoration vs wiring**
A button that renders but doesn't call the specified mutation is BLOCK. A toast that exists but with wrong copy is BLOCK. The bar is "wired and exact", not "looks plausible in the diff".

---

## Loop control on BLOCK

The orchestrator (`brief/run-with-design-architect.sh`) handles the loop:

```
build → review
  ├── PASS → done
  └── BLOCK
        ├── rerun_count < 2 → feed conformance report back to Aider, rerun build, re-review
        └── rerun_count == 2 → exit 1, human escalation
```

- Max **2 reruns** per brief (3 total Aider invocations).
- Each rerun gets the full latest conformance report as additional context.
- Human escalation = non-zero exit; the orchestrator does not auto-merge a blocked brief.

---

## Pipeline rules

1. **No brief goes to Aider without a design doc.** The orchestrator script enforces this — Aider is invoked only after `brief/design-docs/BRIEF-XX-design.md` exists.
2. **No build merges without conformance PASS.** A BLOCK verdict means the diff is rejected. After 2 reruns without PASS, the brief escalates to a human; the diff stays unmerged.
3. **The design doc is the contract.** Conflicts between brief and design doc are resolved by the design doc once it's accepted. The brief is the prompt; the design doc is the spec.

---

## Invocation

Single command runs the full pipeline for one brief:

```bash
./brief/run-with-design-architect.sh BRIEF-XX
```

The script handles brief extraction, both Claude calls, the Aider call, the rerun loop, and final exit codes.
