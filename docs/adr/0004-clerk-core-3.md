# ADR-0004 — Build on Clerk Core 3 (`@clerk/nextjs` v7)

**Status:** accepted · 2026-08-31 · feature `access`

## Context

Clerk shipped "Core 3" on 2026-03-03 as `@clerk/nextjs` v7. It rewrote the custom-flow API.
The legacy API still works and is what almost every example, blog post, and model's training
data reaches for.

| Legacy | Core 3 |
| --- | --- |
| `signIn.authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete })` | `signIn.sso({ strategy, redirectCallbackUrl, redirectUrl })` |
| `<AuthenticateWithRedirectCallback />` | a `/sso-callback` page calling `signIn.finalize()` |
| `signIn.create()` + `prepareFirstFactor` + `attemptFirstFactor` | `signIn.create({ identifier })` + `signIn.emailCode.sendCode()` + `signIn.emailCode.verifyCode({ code })` |
| `signUp.prepareEmailAddressVerification()` | `signUp.verifications.sendEmailCode()` |
| `setActive({ session: createdSessionId })` | `signIn.finalize({ navigate })` |
| `<SignedIn>` / `<SignedOut>` / `<Protect>` | `<Show when="signed-in" />` (the old three are removed) |
| `createRouteMatcher()` | deprecated in favour of resource-level checks |

## Decision

Build on Core 3. Pin `@clerk/nextjs` at `^7`.

## Alternatives

- **Legacy API** — more examples to copy from, and a rewrite already scheduled.
- **Pin v6 (`latest-v5` tag is 6.39.6)** — same, plus a Next 16 support question.

## Consequences

- `7.8.3` peer-accepts `next ^16.1.0-0` and `react ~19.2.3`; this repo's `next@16.2.6` and
  `react@19.2.4` both satisfy it.
- `<ClerkProvider>` goes **inside `<body>`**, not wrapping `<html>`. This repo's
  `app/layout.tsx` puts `<ThemeProvider>` inside `<body>` already, so it nests cleanly.
- Any snippet found online must be checked against the table above before it is trusted.
- `getToken()` now throws `ClerkOfflineError` offline instead of returning `null`.
