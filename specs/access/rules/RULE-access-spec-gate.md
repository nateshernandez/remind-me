# RULE-access-spec-gate

What `/spec` answers in production, once Clerk's proxy shares the file with it.

This is the one rule in the bundle whose outcome is not a state, which is why it is not a
resolution table: there is no screen, and that is the entire point. ADR-0006 argues it; this is
where the argument is checkable.

| Input | Output | Why |
| --- | --- | --- |
| `/spec` or `/spec/*` in production | 404, with no body | A layout-level `notFound()` still serializes every unshipped screen into the response. The proxy answers before the render exists. |
| `/spec` or `/spec/*` in production, no session | 404 — *not* a redirect to the door | If Clerk's guard runs first, an unauthenticated request gets a 307 to `/sign-in`, and a 307 says the route exists. That is a louder disclosure than the one the gate was built to prevent. |
| `/spec` or `/spec/*` in production, with a session | 404 | Being signed in does not open the spec route. It is not a permission; it is not shipped. |
| which runs first | the redspec gate, then Clerk | The order is the rule. Reversing it is the failure above. |
| `/spec` outside production | renders the board | Both Playwright tiers run against the dev server for exactly this reason. |
| what widening `config.matcher` costs | Clerk's proxy now runs on every app route | Next statically parses `config` at build time, so every value stays a literal -- a helper call there fails the build. |

**Status:** stub. /implement-rules picks the rung.
