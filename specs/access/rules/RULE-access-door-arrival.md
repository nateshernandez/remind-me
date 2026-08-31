## RULE-access-door-arrival

Which door someone sees. `/sign-in` has four different screens behind it and the session alone
does not pick between them: arriving after signing out is not the same as arriving cold, and
being handed back after a code expired is not either.

`signup` is the `/sign-up` redirect. ADR-0005 says that route exists only to send people here;
this table is where that sentence is checkable rather than prose.

**Inputs:** arrival: {cold, signup, signedOut, expired}, session: {loading, live, none, unreachable}
**Hit policy:** UNIQUE

| arrival   | session     | state                               | note |
| --------- | ----------- | ----------------------------------- | ---- |
| -         | loading     | STATE-access-door-loading           | However they arrived, there is nothing to decide until Clerk has loaded. |
| -         | live        | STATE-access-door-already-signed-in | Not a silent bounce: a redirect with no words reads as a broken link. |
| -         | unreachable | STATE-access-door-unavailable       | The same screen from every direction, because the cause is the same. |
| cold      | none        | STATE-access-door-empty             | The resting state of the whole feature. |
| signup    | none        | STATE-access-door-empty             | `/sign-up` is a redirect and nothing else. Identical screen, identical words. |
| signedOut | none        | STATE-access-door-signed-out        | The terminal of JOURNEY-access-sign-out. "You are signed out" is the whole point of pressing the button. |
| expired   | none        | STATE-access-door-filled            | Handed back after a code aged out, with the address they already typed still in it. |
