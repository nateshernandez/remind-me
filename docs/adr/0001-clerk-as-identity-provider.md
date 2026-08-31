# ADR-0001 — Clerk is the identity provider

**Status:** accepted · 2026-08-31 · feature `access`

## Context

`remind-me` has no accounts. Reminders are worthless if they are not *yours*, so the first
real feature is getting a person an account and getting them back into it. We need Google
OAuth and passwordless email on day one, on Next.js 16 App Router.

## Decision

Use Clerk as the identity provider. Sessions, tokens, OAuth credentials, email delivery,
and bot protection are Clerk's; we own the screens.

## Alternatives

- **Auth.js / NextAuth** — we would own session storage, email delivery, and the OTP
  lifecycle. Cheaper to host, more to build and to keep correct.
- **Supabase Auth** — pulls in a database decision this feature has no opinion about yet.
- **Roll our own** — no.

## Consequences

- Two required env vars (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) plus
  `CLERK_ENCRYPTION_KEY`; the app cannot boot without them, which is `STATE-access-door-unavailable`.
- Clerk's figures become our figures: see `RULE-access-code` and `RULE-access-session`.
- Clerk's rate limits become our screens: see `RULE-access-code-outcome`.
- Production Google OAuth needs our own Google credentials; development uses Clerk's shared ones.
