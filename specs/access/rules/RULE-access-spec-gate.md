## RULE-access-spec-gate

What `/spec` answers, once Clerk's proxy shares `proxy.ts` with it.

This is the one rule in the bundle whose outcome is not a state, which is why it
is not a resolution table: on the closed answer there is no screen, and that is
the entire point. ADR-0006 argues it; this is where the argument is checkable.

**Amended at /implement-rules.** The interview said "in production, 404". That
is the default and it is what every other repo gets, but it is not the contract
*here*: `spec.config.ts` declares `publicBoard: true` and `proxy.ts` opens the
route wherever `REDSPEC_PUBLISH_BOARD=1`, because in this repo the board is the
product. So the input is the publish flag as well as the environment, and the
rule now says what the deployed demo actually does. The figures did not move;
a missing one was found.

The `session` column is `-` on every row, and that is the requirement rather
than a shrug. The redspec gate runs **first** and Clerk second. If Clerk's guard
ran first, an unauthenticated request for `/spec/...` would get a 307 to the
sign-in page -- and a 307 says the route exists, which is a louder disclosure
than the one the gate was built to prevent. A `-` in that column is the
assertion that nothing about the session can change the answer.

**Inputs:** env: {production, other}, publish: boolean, session: {loading, live, none, unreachable}
**Hit policy:** UNIQUE

| env        | publish | session | answer | note |
| ---------- | ------- | ------- | ------ | ---- |
| production | false   | -       | 404    | The default, and what every repo but this one ships. With no body: a layout-level `notFound()` sets the status and still streams every unshipped screen, every waiver and every fixture into the payload, to anyone who ignores a status line. The proxy answers before the render exists. |
| production | true    | -       | pass   | This repo. The board is what a visitor comes to see, and `redspec check` reports `board-published` if the environment asks for this without `spec.config.ts` declaring `publicBoard: true`. |
| other      | -       | -       | pass   | Both Playwright tiers run against the dev server for exactly this reason. |

<!-- `pass` is `NextResponse.next()`: the proxy is done and the route renders
     the board. Widening `config.matcher` to Clerk's app-wide pattern means
     Clerk's proxy runs on every app route. Next statically parses `config` at
     build time, so every value stays a literal -- a helper call there fails
     the build. -->
