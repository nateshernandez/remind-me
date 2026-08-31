# ADR-0002 — Email verification code, not magic link

**Status:** accepted · 2026-08-31 · feature `access`

## Context

The ask was "OTP or magic link". In Clerk these are two independent Dashboard toggles under
User & authentication → Email; Clerk's engineering blog states both can be enabled at once and
the user picks at verification time. (The canonical docs page presents them as two options
without saying they can co-exist — treat "both" as only partly confirmed.)

## Decision

Enable **email verification code** only. The magic link stays off.

## Alternatives

- **Magic link instead** — costs three screens the code does not have: expired-link,
  wrong-device, and the tab-switch case. Clerk's "require the same device and browser"
  setting is **on by default**, so a link opened on a phone after being requested on a
  desktop fails with `client_mismatch`. Clerk documents a `verified_switch_tab` status
  and defines it nowhere.
- **Both, user chooses** — every magic-link screen above, plus a chooser, for a feature
  whose whole point is to be the shortest path to an account.

## Consequences

- Outlook and Office 365 link prefetchers cannot burn a single-use credential, because
  there is no link. Clerk recommends codes over links for exactly this reason.
- The journey tier is testable: Clerk explicitly discourages testing email *links* in E2E
  suites and recommends codes. `+clerk_test` addresses accept the fixed code `424242` on
  development instances.
- Magic link is a Non-goal in the Brief. Turning it on later is a new surface, not a toggle.
