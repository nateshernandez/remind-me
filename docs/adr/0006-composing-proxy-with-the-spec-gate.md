# ADR-0006 — Clerk's proxy composes with the redspec gate, and runs second

**Status:** accepted · 2026-08-31 · feature `access`

## Context

Next.js 16 renamed `middleware.ts` to `proxy.ts` and allows exactly one of them. This repo
already has one:

```ts
export const proxy = createSpecProxy({ route: "/spec" })
export const config = { matcher: ["/spec", "/spec/:path*"] }
```

It answers 404 for `/spec` in production before anything renders, because a layout-level
`notFound()` still serializes every unshipped screen into the response body.

Clerk's Next 16 quickstart wants the same file: `export default clerkMiddleware()` with an
app-wide matcher including `/(api|trpc)(.*)` and `/__clerk/(.*)`. No Clerk documentation
covers composing with an existing named export.

## Decision

One `proxy.ts` that runs the redspec gate **first** and Clerk second, with the matcher
widened to Clerk's app-wide pattern plus `/spec`.

The gate must stay first: if Clerk's proxy redirects an unauthenticated request for
`/spec/...` to the sign-in page, production stops answering 404 for the spec route and
starts answering 307 — which is a different, and louder, disclosure that the route exists.

## Alternatives

- **Clerk first, gate second** — see above.
- **Drop the gate and rely on `NODE_ENV`** — the gate *is* the `NODE_ENV` check; dropping
  it means the spec route ships.

## Consequences

- Widening `config.matcher` means Clerk's proxy now runs on every app route. Next statically
  parses `config` at build time, so every value stays a literal — no helper call.
- **Open risk:** clerk/javascript#8302 — `auth.protect()` inside `clerkMiddleware` in a
  Next 16 `proxy.ts` redirects unauthenticated users back to the *current* URL instead of
  the sign-in page, because `NEXT_PUBLIC_CLERK_SIGN_IN_URL` is not visible in the proxy
  runtime. Open against 7.0.8/7.0.12; unconfirmed for 7.8.3. Prefer an explicit
  `NextResponse.redirect(new URL("/sign-in", request.url))` over `auth.protect()` here.
  Recorded as a Deliberate unknown.
