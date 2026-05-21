# DesignersMeet CRM — Persona UX Test Results (prefix)

- Target: https://designersmeet-preview.surge.sh
- Scope: full · Wall-clock: 8.0 min · Generated: 2026-05-19T20:05:04.994Z

## Totals
| Total | Pass | Fail | Skip |
|---|---|---|---|
| 10000 | 3417 (34.2%) | 395 (4.0%) | 6188 (61.9%) |

## Per-persona
| Persona | Pass | Fail | Skip |
|---|---|---|---|
| owner-admin | 978 | 114 | 908 |
| vendor | 622 | 70 | 1308 |
| client | 463 | 49 | 1488 |
| project-manager | 825 | 91 | 1084 |
| finance | 529 | 71 | 1400 |

## Per-page (route)
| Route | Pass | Fail | Skip |
|---|---|---|---|
| /contacts | 1580 | 176 | 2744 |
| /dashboard | 814 | 94 | 1592 |
| /settings | 190 | 70 | 240 |
| /forms | 110 | 18 | 372 |
| /calendar | 153 | 15 | 332 |
| /conversations | 180 | 12 | 308 |
| /signin | 390 | 10 | 600 |

## Critical failure clusters (route :: interaction, top 25)
| Route :: Interaction | Fail count | Example reason |
|---|---|---|
| /contacts :: secondary-cta-click | 37 | no loading affordance for 'secondary-cta-click' on /contacts (silent wait) |
| /dashboard :: destructive-cta-click | 32 | journey-critical affordance 'destructive-cta-click' missing on /dashboard — no destructive CTA on page |
| /contacts :: icon-button-click | 27 | no loading affordance for 'icon-button-click' on /contacts (silent wait) |
| /settings :: email-input | 20 | journey-critical affordance 'email-input' missing on /settings — no email input |
| /settings :: select-input | 20 | journey-critical affordance 'select-input' missing on /settings — no select control |
| /settings :: form-submit | 20 | journey-critical affordance 'form-submit' missing on /settings — no submit control on page |
| /contacts :: select-input | 20 | journey-critical affordance 'select-input' missing on /contacts — no select control |
| /contacts :: destructive-cta-click | 16 | journey-critical affordance 'destructive-cta-click' missing on /contacts — no destructive CTA on page |
| /dashboard :: icon-button-click | 15 | no loading affordance for 'icon-button-click' on /dashboard (silent wait) |
| /dashboard :: modal-open | 14 | no loading affordance for 'modal-open' on /dashboard (silent wait) |
| /contacts :: modal-open | 13 | no loading affordance for 'modal-open' on /contacts (silent wait) |
| /dashboard :: select-input | 12 | journey-critical affordance 'select-input' missing on /dashboard — no select control |
| /contacts :: form-submit | 11 | no loading affordance for 'form-submit' on /contacts (silent wait) |
| /contacts :: scroll | 9 | no loading affordance for 'scroll' on /contacts (silent wait) |
| /dashboard :: primary-cta-click | 9 | no loading affordance for 'primary-cta-click' on /dashboard (silent wait) |
| /contacts :: modal-cancel | 8 | journey-critical affordance 'modal-cancel' missing on /contacts — no cancel control |
| /contacts :: file-upload | 8 | journey-critical affordance 'file-upload' missing on /contacts — no file upload affordance |
| /forms :: file-upload | 8 | journey-critical affordance 'file-upload' missing on /forms — no file upload affordance |
| /forms :: form-submit | 8 | journey-critical affordance 'form-submit' missing on /forms — no submit control on page |
| /contacts :: text-input | 6 | no loading affordance for 'text-input' on /contacts (silent wait) |
| /dashboard :: secondary-cta-click | 6 | no loading affordance for 'secondary-cta-click' on /dashboard (silent wait) |
| /signin :: primary-cta-click | 5 | no loading affordance for 'primary-cta-click' on /signin (silent wait) |
| /settings :: primary-cta-click | 5 | no loading affordance for 'primary-cta-click' on /settings (silent wait) |
| /settings :: text-input | 5 | no loading affordance for 'text-input' on /settings (silent wait) |
| /signin :: secondary-cta-click | 5 | no loading affordance for 'secondary-cta-click' on /signin (silent wait) |

## Per-page optimization audit
| Route | Perf proxy | a11y viol | serious | icon-btn no-label | img no-alt | focus ring | loading | btn feedback |
|---|---|---|---|---|---|---|---|---|
| /dashboard | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /contacts | 100 | 5 | 3 | 0 | 0 | Y | N | Y |
| /contact-detail | 100 | 4 | 1 | 0 | 0 | N | N | Y |
| /vendors | 100 | 4 | 2 | 0 | 0 | Y | N | Y |
| /vendor-detail | 100 | 2 | 1 | 0 | 0 | Y | N | Y |
| /projects | 100 | 2 | 1 | 0 | 0 | Y | N | Y |
| /project-detail | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /pipelines | 100 | 3 | 2 | 0 | 0 | Y | N | Y |
| /calendar | 100 | 2 | 1 | 0 | 0 | Y | N | Y |
| /conversations | 100 | 4 | 2 | 0 | 0 | Y | N | Y |
| /workflows | 100 | 4 | 3 | 0 | 0 | Y | N | Y |
| /forms | 100 | 5 | 4 | 0 | 0 | Y | N | Y |
| /settings | 100 | 2 | 1 | 0 | 0 | Y | N | Y |
| /spec | 100 | 4 | 1 | 0 | 0 | N | N | Y |
| /onboarding | 100 | 4 | 1 | 0 | 0 | N | N | Y |
| /signin | 100 | 3 | 2 | 0 | 0 | Y | N | Y |

## Optimization opportunities
- **/dashboard**: 2 serious/critical a11y violations
- **/contacts**: 3 serious/critical a11y violations
- **/contact-detail**: 1 serious/critical a11y violations; no visible focus ring on first button
- **/vendors**: 2 serious/critical a11y violations
- **/vendor-detail**: 1 serious/critical a11y violations
- **/projects**: 1 serious/critical a11y violations
- **/project-detail**: 2 serious/critical a11y violations
- **/pipelines**: 2 serious/critical a11y violations
- **/calendar**: 1 serious/critical a11y violations
- **/conversations**: 2 serious/critical a11y violations
- **/workflows**: 3 serious/critical a11y violations
- **/forms**: 4 serious/critical a11y violations
- **/settings**: 1 serious/critical a11y violations
- **/spec**: 1 serious/critical a11y violations; no visible focus ring on first button
- **/onboarding**: 1 serious/critical a11y violations; no visible focus ring on first button
- **/signin**: 2 serious/critical a11y violations
