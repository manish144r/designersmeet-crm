# DesignersMeet CRM — Persona UX Results (scheduled-critical)

- Target: https://designersmeet-preview.surge.sh · Scope: critical · Wall: 5.5m · 2026-05-21T18:05:34.729Z

## Totals (skip MUST be 0)
| Total | Pass | Fail | Blocked | Skip | Executed | Exec pass-rate |
|---|---|---|---|---|---|---|
| 3500 | 1284 (36.7%) | 3 (0.1%) | 2213 (63.2%) | 0 | 1287 | **99.8%** |

Exec pass-rate = pass / (pass+fail); blocked excluded (structural, each with an unblock path).

## Blocked breakdown (concrete reasons)
| Code | Count | Meaning / unblock condition |
|---|---|---|
| B-XJRNY | 1254 | breadth cell: interaction not in journey & not on route — coverage, no defect |
| B-ASYNC | 855 | synchronous demoStore, no in-flight — unblock: live backend latency |
| B-AUTH | 80 | IdP-less DEMO_MODE auto-auth — unblock: Render backend + VITE_DEMO_MODE=false |
| B-LOCK | 24 | affordance absent from locked page — unblock: Manish [brand-change] approval |

## Per-persona
| Persona | Pass | Fail | Blocked |
|---|---|---|---|
| owner-admin | 324 | 3 | 573 |
| vendor | 267 | 0 | 433 |
| client | 210 | 0 | 390 |
| project-manager | 264 | 0 | 436 |
| finance | 219 | 0 | 381 |

## Per-page (route)
| Route | Pass | Fail | Blocked |
|---|---|---|---|
| /settings | 54 | 3 | 143 |
| /signin | 150 | 0 | 350 |
| /dashboard | 375 | 0 | 625 |
| /contacts | 378 | 0 | 522 |
| /conversations | 72 | 0 | 128 |
| /calendar | 84 | 0 | 116 |
| /forms | 39 | 0 | 61 |
| /project-detail | 132 | 0 | 268 |

## Top fail clusters (route :: interaction)
| Cluster | Fails | Example |
|---|---|---|
| /settings :: tab-switch | 3 | journey-critical affordance 'tab-switch' missing on /settings — no tab control |

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
