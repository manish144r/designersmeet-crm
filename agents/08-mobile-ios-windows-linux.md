# 08 — Platform-Specific Training: Mobile, iOS, Windows, Linux, Web

> Add-ons to agents 01–06 for platform-specific gates.
> When building for a platform, this file's checks are appended to the master checklist (agent 00).

---

## Mobile (React Native / Expo)

### Design (Architect, agent 01)
- Touch targets ≥ 44×44pt (Apple HIG) / 48×48dp (Material) — verified in design tokens
- Safe area insets (`useSafeAreaInsets`) applied to every full-screen layout
- Gesture handlers don't conflict with system gestures (back swipe, home indicator area)
- Permission flow drawn: location, camera, mic, notifications — each with deny path UX
- Offline-first design: every screen has an offline state; mutations queue locally
- Push notification payload schema defined
- Deep link / Universal link scheme defined

### Build (Builder, agent 02)
- Use `react-native-safe-area-context` `SafeAreaProvider`
- Image components use `react-native-fast-image` for caching
- Lists use `FlashList` (Shopify) or `FlatList` with `removeClippedSubviews`
- `KeyboardAvoidingView` around every form
- Network calls via React Query with offline persistence (`@tanstack/query-async-storage-persister`)
- No `react-native-async-storage` for sensitive data — use Keychain (iOS) / Keystore (Android)
- Crash reporting wired (Sentry React Native) with source maps

### Test (Tester, agent 04)
- Detox or Maestro for E2E on real / simulator devices
- Test matrix: iPhone SE (smallest), iPhone 15 Pro, Pixel 6, Pixel Tablet
- Test orientations: portrait + landscape (if app supports landscape)
- Test under throttled network (3G simulator)
- Test in dark mode + light mode + accessibility text-size XXL

### Security (agent 05)
- Certificate pinning for API calls (`react-native-ssl-pinning`)
- Jailbreak / root detection if app handles money or PII
- Obfuscation for release builds (Hermes + ProGuard / R8)
- No secrets in JS bundle — fetch at runtime via short-lived token
- App Transport Security (iOS) — no `NSAllowsArbitraryLoads`

### Deploy (DevOps, agent 06)
- EAS Build (Expo) or Fastlane for builds
- TestFlight for iOS internal testing
- Google Play Internal Testing track for Android
- App Store / Play Store review checklists walked before submission:
  - Apple HIG compliance
  - Privacy nutrition labels filled accurately
  - Account deletion flow (Apple guideline 5.1.1(v))
  - Google Play Data Safety form filled
- OTA updates via EAS Update OR Code Push — JS-only changes
- Native binary updates go through store review

---

## iOS Native (Swift / SwiftUI)

### Design (Architect, agent 01)
- Apple Human Interface Guidelines compliance reviewed
- Dynamic Type support — every text element uses `.font(.body)` etc., not fixed sizes
- Dark Mode support — semantic colors only
- Accessibility: VoiceOver labels, dynamic type, reduced motion variants

### Build (Builder, agent 02)
- Swift Concurrency: `async`/`await`, `Task`, actors for shared state
- No force unwrap (`!`) on optionals — `guard let` / `if let`
- `@MainActor` annotations on view models
- Combine for reactive flows where SwiftUI isn't enough
- Dependency injection via initialiser, not singletons

### Security (agent 05)
- Keychain for tokens / secrets
- App Transport Security: no `NSAllowsArbitraryLoads`
- App Sandbox enabled (macOS) / default sandboxing (iOS)
- Privacy manifests filled (`PrivacyInfo.xcprivacy`) — Apple now rejects builds without them for "required reason API" usage

### Deploy (DevOps, agent 06)
- Xcode Cloud OR Fastlane `match` for code signing
- Provisioning profiles managed via App Store Connect API (no manual exports)
- Entitlements file in source control
- TestFlight stages: Internal (team) → External (testers) → Production
- Release notes prepared, App Privacy details current

---

## Windows (Electron / WinUI 3 / WPF)

### Design (Architect, agent 01)
- Windows 11 design guidelines (Fluent 2) when targeting modern
- High-DPI support — no pixel-based layout
- Accessibility: Narrator labels, high-contrast theme, keyboard nav per Windows conventions (Alt+menu, F10 for menu bar)

### Build (Builder, agent 02 — Electron specifics)
- `contextIsolation: true`, `nodeIntegration: false` — non-negotiable
- Preload script exposes a narrow IPC surface via `contextBridge`
- No `remote` module (deprecated)
- CSP set on renderer process
- Auto-update via `electron-updater` (squirrel.windows or NSIS)

### Security (agent 05)
- Code signing certificate (EV preferred — no SmartScreen warnings)
- Microsoft Defender SmartScreen submission for new versions
- Notarised installer if cross-shipping to macOS via the same repo
- No `eval` in renderer, no `node-integration: true`
- Update channel pinned to HTTPS with cert pinning

### Deploy (DevOps, agent 06)
- Installer formats: MSIX (modern, sandboxed) > NSIS (legacy support)
- Microsoft Store submission for MSIX (broader reach, automatic update)
- Auto-update server: GitHub Releases (free) or S3/Azure Blob
- Crash reporting: Sentry Electron with native crashes (minidumps)
- WMI-safe install (no registry orphans on uninstall)

---

## Linux (CLI / desktop / service)

### Design (Architect, agent 01)
- POSIX compliance for shell scripts (or explicit bash-only with `set -euo pipefail`)
- XDG Base Directory spec for config / data / cache
- `systemd` unit file for services — `Type=notify` and proper `Restart=on-failure`
- Logging to stdout/stderr — let `journalctl` capture; no app-managed log files
- Signal handling: SIGTERM for graceful shutdown, SIGHUP for config reload

### Build (Builder, agent 02)
- Static binaries preferred (`musl` / `go build -tags netgo`) — fewer runtime deps
- For Electron / desktop: bundle dependencies (avoid "works on my distro")
- Avoid hard-coding `/usr/bin/python3` — use `#!/usr/bin/env python3`
- Locale-aware text: `LC_ALL=C` for predictable string ops; UTF-8 default for output

### Security (agent 05)
- Run as non-root user (`User=` in systemd unit)
- `CapabilityBoundingSet=` to drop unused caps
- `ProtectSystem=strict`, `ProtectHome=true`, `NoNewPrivileges=true` in unit
- AppArmor or SELinux policy if the binary handles untrusted data
- No `sudo` from app — explicit polkit rule if elevated action required

### Deploy (DevOps, agent 06)
- Distribution formats: AppImage (portable), Snap (Ubuntu Store), Flatpak (Flathub), .deb / .rpm (native)
- Cross-distro test matrix: Ubuntu LTS, Debian stable, Fedora latest, RHEL/Rocky if enterprise
- Signed packages (deb-sig / rpm-sign / `flatpak sign`)
- `systemctl daemon-reload` and `restart` in post-install hook (only if `systemd` present)

---

## Web (PWA)

### Design (Architect, agent 01)
- Web app manifest: `name`, `short_name`, `icons` (at least 192×192 and 512×512), `start_url`, `theme_color`, `background_color`, `display: standalone`
- Service worker scope and update strategy defined
- Offline UX: which routes work offline, which show "you're offline" with cached preview
- Install prompt UX: when and how to suggest "Add to Home Screen"

### Build (Builder, agent 02)
- `vite-plugin-pwa` or Workbox for service worker
- Cache strategies per resource type:
  - HTML — Network First, fallback to cache
  - JS / CSS — Cache First with hash-based versioning
  - Images — Stale While Revalidate
  - API — Network First with offline queue for mutations
- Skip-waiting + clientsClaim on SW update — prompt user "new version available"

### Test (Tester, agent 04)
- Lighthouse PWA audit — score 100 expected
- Offline simulation in DevTools — full critical path tested
- Install prompt tested on Android Chrome + iOS Safari (different UX)

### Security (agent 05)
- HTTPS required for SW (no exceptions; localhost only for dev)
- CSP includes `worker-src 'self'`
- SW does not cache responses with `Authorization` header
- Update mechanism doesn't bypass auth (refetch on tab focus after SW update)

### Deploy (DevOps, agent 06)
- Core Web Vitals tracked: LCP, INP, CLS
- Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Cross-browser matrix: Chrome, Firefox, Safari, Edge (latest + latest-1)
- Mobile + desktop browsers tested
- CDN configured with appropriate cache headers per resource

---

## Cross-platform checklist (if shipping the same product to multiple platforms)

- [ ] Shared data model in one place (Zod schema, OpenAPI, GraphQL SDL)
- [ ] Shared business logic in a `core/` package — UI is the only thing per-platform
- [ ] Sync conflict resolution defined (LWW, CRDT, server authoritative)
- [ ] Per-platform telemetry tagged so you can compare crash rates
- [ ] Per-platform feature flags so you can disable per-platform if a build is bad
- [ ] Per-platform release cadence documented (mobile stores vs web)
