# DesignersMeet CRM — Persona UX Results (postfix4)

- Target: https://designersmeet-preview.surge.sh · Scope: full · Wall: 15.5m · 2026-05-19T21:21:41.639Z

## Totals (skip MUST be 0)
| Total | Pass | Fail | Blocked | Skip | Executed | Exec pass-rate |
|---|---|---|---|---|---|---|
| 10000 | 3810 (38.1%) | 0 (0.0%) | 6190 (61.9%) | 0 | 3810 | **100.0%** |

Exec pass-rate = pass / (pass+fail); blocked excluded (structural, each with an unblock path).

## Blocked breakdown (concrete reasons)
| Code | Count | Meaning / unblock condition |
|---|---|---|
| B-XJRNY | 3510 | breadth cell: interaction not in journey & not on route — coverage, no defect |
| B-ASYNC | 2470 | synchronous demoStore, no in-flight — unblock: live backend latency |
| B-AUTH | 120 | IdP-less DEMO_MODE auto-auth — unblock: Render backend + VITE_DEMO_MODE=false |
| B-LOCK | 90 | affordance absent from locked page — unblock: Manish [brand-change] approval |

## Per-persona
| Persona | Pass | Fail | Blocked |
|---|---|---|---|
| owner-admin | 762 | 0 | 1238 |
| vendor | 762 | 0 | 1238 |
| client | 762 | 0 | 1238 |
| project-manager | 762 | 0 | 1238 |
| finance | 762 | 0 | 1238 |

## Per-page (route)
| Route | Pass | Fail | Blocked |
|---|---|---|---|
| /signin | 300 | 0 | 700 |
| /dashboard | 570 | 0 | 930 |
| /settings | 135 | 0 | 365 |
| /contacts | 1890 | 0 | 2610 |
| /conversations | 180 | 0 | 320 |
| /calendar | 210 | 0 | 290 |
| /forms | 195 | 0 | 305 |
| /project-detail | 330 | 0 | 670 |

## Top fail clusters (route :: interaction)
| Cluster | Fails | Example |
|---|---|---|

## Governance
- 2800 cells exercised a role-gated (persona, journey) pair that the demo build does NOT access-control (single demo admin, no RBAC). Executed (not skipped); RBAC enforcement is an owner item, not a per-cell skip.

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
