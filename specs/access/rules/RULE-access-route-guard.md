## RULE-access-route-guard

What a request gets, given where it is going and what is known about the session. This is the
contract `proxy.ts` implements, and it is written here because clerk/javascript#8302 makes the
obvious implementation (`auth.protect()`) unreliable on Next 16 — see ADR-0006.

The `session` dimension has four values, not two, and the reason is `RULE-access-session`:
`isSignedIn` is `undefined` before Clerk has loaded, and reading that as "signed out" bounces a
validly signed-in person to the door. `loading` is that third value; `unreachable` is the fourth,
because a Clerk that cannot be reached is not the same as a person who is not signed in.

The door is not on this table. Which door someone lands on turns on how they arrived as well as
on the session, and that is `RULE-access-door-arrival`.

**Inputs:** route: {app, callback}, session: {loading, live, none, unreachable}
**Hit policy:** UNIQUE

| route    | session     | state                          | note |
| -------- | ----------- | ------------------------------ | ---- |
| app      | loading     | STATE-access-app-loading       | The gate that stops a valid session being thrown out for being slow. |
| app      | live        | STATE-access-app-signed-in     | The only reason the shell exists. |
| app      | none        | STATE-access-door-empty        | Sent to the door. Explicit redirect, not `auth.protect()`: #8302 sends it back to the current URL instead. |
| app      | unreachable | STATE-access-door-unavailable  | Not a bare door: a person who cannot be told why will retype a correct address until they give up. |
| callback | loading     | STATE-access-callback-working  | The callback waits for Clerk either way; it has nothing to do until it has loaded. |
| callback | live        | STATE-access-callback-working  | A session already present does not let the callback skip: it still has to finalize the attempt Google sent back. |
| callback | none        | STATE-access-callback-working  | The ordinary case. |
| callback | unreachable | STATE-access-callback-failed   | Nothing can be finalized, and the person is mid-redirect with no attempt to keep. |
