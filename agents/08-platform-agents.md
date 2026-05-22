# 08 — Platform Agents

> **Role:** Platform-specific specialisations of the builder/reviewer/tester loop.
> **Triggers:** any time the target is not a generic responsive web app.

---

## 1. Mobile (generic — applies to iOS + Android)

### Build rules
- Touch targets ≥ 44×44 pt (Apple HIG) / 48×48 dp (Material).
- Hit slop on small icons.
- **Offline-first**: every read goes through a cache; every write goes through a queue with retry + idempotency-key.
- Background sync uses platform APIs (BackgroundTasks on iOS, WorkManager on Android) — never a custom timer.
- Battery: no polling tighter than 30s; no wake locks unless documented.
- Network: assume flaky. Exponential backoff. Pause queue on `airplane mode`.
- Storage: encrypted at rest (Keychain / Keystore).
- Crash reporting (Sentry / Crashlytics) wired before public TestFlight / internal track.

### App store checklist (both stores)
- [ ] Privacy policy URL live
- [ ] Data-collection declarations match code
- [ ] Permissions strings (camera, mic, location) explain *why*
- [ ] Onboarding does not gate behind unnecessary permissions
- [ ] In-app purchases use platform IAP (never web payment for digital goods)
- [ ] Accessibility: VoiceOver / TalkBack passes a manual screen-read
- [ ] Dynamic type / font scaling respected
- [ ] Dark mode supported
- [ ] Localisation: English + at least one secondary market locale
- [ ] App icon, screenshots, preview video meet store spec

### Tests
- Detox (RN) / XCUITest / Espresso for E2E.
- Network condition tests: 3G, offline, flaky.
- Foreground / background / killed transitions.

---

## 2. iOS (Apple-specific)

### HIG essentials
- Navigation patterns: tab bar, navigation bar, modal — pick one per flow.
- Sheets, popovers, alerts have native equivalents — do not roll your own.
- SF Symbols for icons; respect weight/scale.
- Dynamic Type honoured (test at largest accessibility size).
- Safe areas: no content under the home indicator / dynamic island.

### Build & sign
- Xcode project under source control (use `xcodegen` or Tuist to keep the `.xcodeproj` deterministic).
- SwiftLint + SwiftFormat in CI.
- Code signing: automatic in dev, manual in CI with App Store Connect API key (rotated quarterly).
- Provisioning profiles in Apple Developer portal; never committed.
- Build numbers monotonically increasing (CI sets from run id).

### Distribution
- TestFlight internal first (the dev team).
- TestFlight external second (≤ 100 users) — feedback gathered for ≥ 3 days.
- App Store submission: phased release (1d → 2d → 5d → 10d → 20d → 50d → 100%).
- Privacy nutrition labels match SDK behaviour. Audited before submission.

---

## 3. Windows (desktop)

### Packaging
- **MSIX** preferred for new apps. Auto-update via Microsoft Store or sideload server.
- Installer is single, signed, idempotent. No "next next next" deviations.
- Files under `%LOCALAPPDATA%\<App>\` for user data, `%PROGRAMFILES%\<App>\` for binaries (read-only).
- No writes to `Program Files` at runtime.

### Code signing
- EV certificate from a Microsoft-accepted CA.
- Sign every `.exe`, `.dll`, `.msix`. Verify with `signtool verify /pa`.
- Timestamp the signature (RFC3161) so it doesn't expire when the cert does.

### Defender compatibility
- Avoid patterns that look malicious: encoded PowerShell command lines, scheduled tasks created via `schtasks /create` with unusual paths.
- Submit the signed binary to Microsoft for false-positive analysis if Defender flags it.
- NF lesson: scheduled tasks (e.g. `NF-DM-UX-Tests`) use plain cmdlets, absolute paths, no encoded commands (`scripts/dm-ux-run.ps1` pattern).
- Anti-tamper / WDAC compatibility tested before broad rollout.

### Updates
- Differential updates where possible (MSIX bundles).
- Update channel selectable (stable / beta).
- Rollback supported.

---

## 4. Linux (desktop / CLI)

### Packaging
- **AppImage** for portable single-file distribution.
- **Snap** or **Flatpak** for store-style distribution and sandboxing.
- `.deb` / `.rpm` for traditional deployments; sign with detached signature.

### Filesystem
- XDG base dirs respected (`$XDG_CONFIG_HOME`, `$XDG_DATA_HOME`, `$XDG_CACHE_HOME`).
- No writes to `/etc`, `/usr`, `/opt` outside the install step.

### Services
- `systemd` user units for per-user daemons; `system` units only for true system services.
- Unit files have `Restart=on-failure`, `RestartSec=`, `WatchdogSec=` set.
- Logs to `journald` (stdout/stderr captured), never to ad-hoc log files in `$HOME`.

### Privilege
- **No-root by default.** If root is required, document why, narrow with capabilities, drop privilege as soon as possible.
- `polkit` for elevation prompts; never `sudo` in a script that runs unattended.

### Compatibility
- Test on at least: Ubuntu LTS (current), Debian stable, Fedora current, Arch rolling.
- glibc baseline declared; static-link or vendored libraries documented.

---

## 5. Web / PWA

### Core Web Vitals (must hit on a mid-tier mobile)
- **LCP** < 2.5s
- **INP** (replaces FID) < 200ms
- **CLS** < 0.1
- TTFB < 0.8s
- Test on throttled 4G + 4× CPU slowdown.

### Service worker
- Cache strategy declared per route class:
  - HTML — network-first with fallback.
  - JS/CSS — stale-while-revalidate.
  - Images — cache-first with size cap.
  - API — network-only (or stale-while-revalidate per endpoint).
- Versioned cache keys; old caches cleaned on activation.
- Offline fallback page for navigations.
- Update strategy: prompt the user, never force-reload mid-task.

### Cross-browser
- Latest Chrome, Firefox, Safari, Edge. Playwright runs against all four.
- iOS Safari is the bar — if it works there, it works.
- Polyfills declared, not auto-added.

### Install / manifest
- Web App Manifest with name, icons (192/512), `display: standalone`, `start_url`.
- Add-to-home-screen prompt only after a user-initiated engagement event.

---

## 6. Platform Agent Self-Check

- [ ] Platform-specific lints / formatters in CI
- [ ] Platform-specific test runner wired
- [ ] Store / package compliance run
- [ ] Update + rollback path documented
- [ ] Crash reporting wired
- [ ] Accessibility verified with the platform's screen reader
- [ ] Performance budget hit on a mid-tier device
- [ ] Lesson logged if any of the above slipped
