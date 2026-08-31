# ADR-0005 — One door, not a sign-up page and a sign-in page

**Status:** accepted · 2026-08-31 · feature `access`

## Context

The ask names "sign up" and "sign back in" as two things. With passwordless email and Google,
they are the same two controls and the same code entry — the only difference is whether a
Clerk user already exists behind the address, which nobody knows until the code is verified.

Two separate pages create a wrong-door problem: a returning member on `/sign-up` gets
`form_identifier_exists` (422); a new visitor on `/sign-in` gets `form_identifier_not_found`
(422). Handling either by pivoting to the other flow **reveals whether an account exists
before verification** — Clerk's own docs call this out as a user-enumeration exposure.

## Decision

One surface at `/sign-in`. `/sign-up` redirects to it. The identifier step uses
`signIn.create({ identifier, signUpIfMissing: true })`; after verification, error code
`sign_up_if_missing_transfer` triggers `signUp.create({ transfer: true })`.

## Alternatives

- **Two routes, two surfaces** — familiar, better marketing copy ("Create your account"
  vs "Welcome back"), and doubles the surface count while leaking account existence.
- **Two routes, one surface, heading varies by entry** — one screenshot cannot cover two
  headings, so it is two states pretending to be one.

## Consequences

- `INV-access-no-enumeration` is the property this buys, and it is written down as a rule
  rather than left as an intention.
- New visitors and returning members walk the *same* spine and diverge only at the last
  step. Both are actors in the Brief; both have flows.
- The heading has to greet a person who may be either. That is a copy problem, recorded as
  `COPY-access-door-title`, and it is the weakest point of this decision.
