# DesignersMeet CRM — Persona UX Results (scheduled-critical)

- Target: https://designersmeet-preview.surge.sh · Scope: critical · Wall: 5.4m · 2026-05-20T18:05:28.376Z

## Totals (skip MUST be 0)
| Total | Pass | Fail | Blocked | Skip | Executed | Exec pass-rate |
|---|---|---|---|---|---|---|
| 3500 | 1248 (35.7%) | 21 (0.6%) | 2231 (63.7%) | 0 | 1269 | **98.3%** |

Exec pass-rate = pass / (pass+fail); blocked excluded (structural, each with an unblock path).

## Blocked breakdown (concrete reasons)
| Code | Count | Meaning / unblock condition |
|---|---|---|
| B-XJRNY | 1272 | breadth cell: interaction not in journey & not on route — coverage, no defect |
| B-ASYNC | 855 | synchronous demoStore, no in-flight — unblock: live backend latency |
| B-AUTH | 80 | IdP-less DEMO_MODE auto-auth — unblock: Render backend + VITE_DEMO_MODE=false |
| B-LOCK | 24 | affordance absent from locked page — unblock: Manish [brand-change] approval |

## Per-persona
| Persona | Pass | Fail | Blocked |
|---|---|---|---|
| owner-admin | 303 | 15 | 582 |
| vendor | 267 | 0 | 433 |
| client | 195 | 6 | 399 |
| project-manager | 264 | 0 | 436 |
| finance | 219 | 0 | 381 |

## Per-page (route)
| Route | Pass | Fail | Blocked |
|---|---|---|---|
| /contacts | 357 | 12 | 531 |
| /project-detail | 117 | 6 | 277 |
| /settings | 54 | 3 | 143 |
| /signin | 150 | 0 | 350 |
| /dashboard | 375 | 0 | 625 |
| /conversations | 72 | 0 | 128 |
| /calendar | 84 | 0 | 116 |
| /forms | 39 | 0 | 61 |

## Top fail clusters (route :: interaction)
| Cluster | Fails | Example |
|---|---|---|
| /contacts :: primary-cta-click | 3 | journey-critical affordance 'primary-cta-click' missing on /contacts — no primary CTA on page |
| /contacts :: text-input | 3 | journey-critical affordance 'text-input' missing on /contacts — no text input |
| /contacts :: email-input | 3 | journey-critical affordance 'email-input' missing on /contacts — no email input |
| /contacts :: form-submit | 3 | journey-critical affordance 'form-submit' missing on /contacts — no submit control on page |
| /settings :: tab-switch | 3 | journey-critical affordance 'tab-switch' missing on /settings — no tab control |
| /project-detail :: primary-cta-click | 3 | journey-critical affordance 'primary-cta-click' missing on /project-detail — no primary CTA on page |
| /project-detail :: text-input | 3 | journey-critical affordance 'text-input' missing on /project-detail — no text input |

## Governance
- 0 cells exercised a role-gated (persona, journey) pair that the demo build does NOT access-control (single demo admin, no RBAC). Executed (not skipped); RBAC enforcement is an owner item, not a per-cell skip.

## Per-page optimization audit
| Route | Perf | a11y | serious | icon no-label | img no-alt | focus | loading | feedback |
|---|---|---|---|---|---|---|---|---|
| /dashboard | 100 | 4 | 3 | 0 | 0 | Y | N | Y |
| /contacts | 100 | 6 | 4 | 0 | 0 | Y | N | Y |
| /contact-detail | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /vendors | 100 | 5 | 3 | 0 | 0 | Y | N | Y |
| /vendor-detail | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /projects | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /project-detail | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /pipelines | 100 | 4 | 3 | 0 | 0 | Y | N | Y |
| /calendar | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /conversations | 100 | 5 | 3 | 0 | 0 | Y | N | Y |
| /workflows | 100 | 5 | 4 | 0 | 0 | Y | N | Y |
| /forms | 100 | 6 | 5 | 0 | 0 | Y | N | Y |
| /settings | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /spec | 100 | 3 | 1 | 0 | 0 | Y | N | Y |
| /onboarding | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /signin | 100 | 4 | 3 | 0 | 0 | Y | N | Y |
