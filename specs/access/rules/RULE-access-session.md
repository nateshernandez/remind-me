# RULE-access-session

How long being signed in lasts, and how quickly the app finds out that it stopped.

| Input | Output | Why |
| --- | --- | --- |
| maximum session lifetime | 7 days | Clerk's default for new instances, and we do not change it. A person signing in on Monday is out by the next Monday. |
| inactivity timeout | off | Clerk's default. One of the two must be on at all times, and the 7-day cap is the one we keep. |
| how long the token proving the session lasts | 60 seconds | Clerk refreshes it continuously. It is the reason the next row exists. |
| how stale a "you are signed in" screen can be | up to 60 seconds | A session revoked or expired elsewhere keeps rendering until the token refreshes (clerk/javascript#874). That window is STATE-access-app-session-ended, not a bug to hide. |
| how many accounts may be signed in at once | 1 | Multi-session is a Non-goal, so `signOut()` is never passed a `sessionId`. |
| what `isSignedIn` is before Clerk has loaded | `undefined`, not `false` | Reading it as false redirects a validly signed-in person to the door. Gate on loaded first: that gate is STATE-access-app-loading. |

**Rung:** type — `RULE-access-session.ts`. Every row above that can go wrong goes wrong
the same way: something reads the session as a boolean. Clerk's `isSignedIn` is
`undefined` before the script has loaded, `false` after it has, and `false` again when the
network is gone — three facts flattened into two values, and the flattening is what
redirects a validly signed-in person to the door. So there is no boolean on the type to
read, and `SignOut` has no `sessionId` parameter to grow one by accident.

`SessionView`'s four statuses are the domain the `session` column of
`RULE-access-route-guard` and `RULE-access-door-arrival` ranges over, and both tables are
proved total over exactly these four. `pnpm typecheck` is the check; the assertions it
reads are the `@ts-expect-error` lines in `RULE-access-session.test.ts`.
