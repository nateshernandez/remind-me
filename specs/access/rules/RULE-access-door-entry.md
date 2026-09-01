## RULE-access-door-entry

What carries the `arrival` that `RULE-access-door-arrival` reads.

`RULE-access-door-arrival` is total over four arrivals and nothing said where they come
from, so three of the four were unreachable as drawn: a plain link to `/sign-in` arrives
`cold`, and both screens that are supposed to arrive otherwise -- the expired code screen
and the ended-session shell -- carry a plain link. A slice would have invented this, and
whichever it invented would have been the contract.

Two rules were also answering the same question. `RULE-access-route-guard` says
`app | none` is `STATE-access-door-empty`; `RULE-access-door-arrival` says
`signedOut | none` is `STATE-access-door-signed-out`. They are not the same moment and
this table is why: a guard bounce is somebody who never pressed anything, and it arrives
`cold`. Signing out is a navigation the app makes on purpose, and it says so.

The carrier is a query parameter on `/sign-in`, because it has to survive a redirect from
`proxy.ts` and a browser reload. `expired` is the exception and the reason the column
exists: it is a same-document navigation, so the address the person already typed is still
in memory, which is the whole of `STATE-access-door-filled`'s "with the address they
already typed still in it".

**Inputs:** from: {url, guard, signUpRoute, signOut, sessionEnded, codeExpired, attemptStuck}
**Hit policy:** UNIQUE

| from         | arrival   | carries        | note |
| ------------ | --------- | -------------- | ---- |
| url          | cold      | nothing        | Typed, bookmarked, or followed from outside. The resting state of the whole feature. |
| guard        | cold      | nothing        | `RULE-access-route-guard`'s app-with-no-session row: a deep link into the app by somebody not signed in. They pressed nothing, so there is nothing to tell them. |
| signUpRoute  | signup    | nothing        | `/sign-up` redirects here and ADR-0005 says that route exists for nothing else. `RULE-access-door-arrival` gives it the identical screen; the value exists so that sentence is checkable rather than prose. |
| signOut      | signedOut | nothing        | The terminal of JOURNEY-access-sign-out. "You are signed out" is the whole point of pressing the button, so a silent bounce will not do. |
| sessionEnded | signedOut | nothing        | STATE-access-app-session-ended's "Sign in" lands on the same words. The session ended either way; which end of it noticed is not the person's problem. |
| codeExpired  | expired   | the address    | Same document, so the address survives in memory rather than on the URL. STATE-access-door-filled, and the next Continue costs a `signIn` slot in RULE-access-throttle like any other. |
| attemptStuck | stuck     | nothing        | RULE-access-code-outcome's `code: stuck` -- accepted and cannot complete. Not a Clerk that cannot be reached, and RULE-access-door-sentence is where the two stop sharing a sentence. |
