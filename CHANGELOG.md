# Changelog

Versions follow `v<semver>` tags (doc 12 section 5). During Phase 2 every group of merged tasks gets a
pre-release tag, `v1.0.0-alpha.N`, on the `main` commit that includes it. Store builds get
`v1.0.0-beta.N` and then `v1.0.0`. OTA updates are listed here with their update group id and get no
tag. Every entry names the `@bustandeen/core` version shipped.

The app is not released: these are development milestones, not builds for users.

## [Unreleased]

## [1.0.0-alpha.1] - 2026-11-20

Core version shipped: none yet (`packages/core` is not synced; prayer data on Home is sample data).

### Added
- Expo SDK 58 app skeleton with Expo Router, a hello screen, CI (lint, format, typecheck, tests,
  dev-route check, Expo doctor) and a release manifest check (P0, P2-00).
- Folder structure and ESLint layer rules (P2-01).
- Theme system: web `dark` and `light` plus app-only `night` and `sand`, tokens, NativeWind styling
  (P2-02, decision D14).
- Text primitive with Bangla, English and Arabic handling (P2-03) and the UI primitives and dev gallery
  (P2-04).
- Home prototype: Layout B sky arc in the arch frame with sun and moon, forbidden times, current prayer,
  next prayer, iftar or suhoor, verse of the day, quick cards (prayer times, tracker, zikr, Quran,
  fasting), optional prayer row, plain-card option, Today's tab placeholder (P2-05).
- Encrypted local storage: SQLCipher database with Drizzle migration 0001, encrypted MMKV, key in the OS
  keystore, Android backup off, G7 passed (P2-07, D16).
- Theme and language are kept across restarts.

### Changed
- Night is the default theme for new users.

### Known gaps
- All prayer times, forbidden windows and progress numbers are sample data until Phase 3.
- No sign-in, sync or server calls yet.
