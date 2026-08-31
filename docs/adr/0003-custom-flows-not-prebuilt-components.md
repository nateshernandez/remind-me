# ADR-0003 — Custom flows, not Clerk's prebuilt `<SignIn />`

**Status:** accepted · 2026-08-31 · feature `access`

## Context

Clerk ships `<SignIn />` and `<SignUp />`, mounted on an App Router catch-all. They give you
every enabled strategy, MFA, i18n, error handling, and bot protection for free.

This repo specs features as artifacts that can go red: every screen is a case on `/spec`
rendered **from a fixture and nothing else**, asserted, and screenshotted.

## Decision

Build the screens ourselves with `useSignIn()` / `useSignUp()`.

## Alternatives

- **Prebuilt components** — a `<SignIn />` cannot be driven by a fixture, cannot be
  screenshot-asserted without Clerk's network, and answers the twelve-row checklist on
  Clerk's terms rather than ours. The entire feature would be unspecable, which in this
  repo means unreviewable by product.
- **Prebuilt, with the spec route covering only our shell around it** — specs the frame
  and not the thing, which is worse than not speccing it.

## Consequences

- We reimplement by hand: error copy for every Clerk error code, the bot-protection mount
  point (`<div id="clerk-captcha" />` on the sign-up side), the resend cooldown, and the
  in-flight states.
- `appearance` theming is not used; the screens are ours, built from `components/ui`.
- Every state below exists because we chose to own it. That is the cost, stated once.
