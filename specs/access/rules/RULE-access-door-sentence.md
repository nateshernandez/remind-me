## RULE-access-door-sentence

Two of the door's states are one screen that says one of several things, and which one is
this table's call rather than a second state's. A surface answers twelve rows and the door
has spent all twelve, so the choice has to live in a rule -- which is exactly what
BRIEF.md said /implement-rules would land, and what `RULE-access-rejection-copy` already
does for the third such state.

`STATE-access-door-sending` is the in-flight row for **both** ways in.
`JOURNEY-access-with-google` walks through this same state to reach Google, and
`COPY-access-door-leaving-for-google` was in no rule and no state's digest until this
table existed -- a user-facing sentence with nothing deciding when it shows.

`STATE-access-door-unavailable` is the third. It is reached from two directions that are
not the same fact: a Clerk nobody can reach, where waiting genuinely helps, and an attempt
that was accepted and cannot complete -- MFA left on, device trust, or a transfer that
failed. Telling the second one to "try again in a few minutes" is false: nothing about
waiting fixes a misconfiguration of our own instance, and their code is already spent.

**Inputs:** moment: {sendingCode, leavingForGoogle, clerkUnreachable, attemptStuck}
**Hit policy:** UNIQUE

| moment           | state                         | copy                                  | note |
| ---------------- | ----------------------------- | ------------------------------------- | ---- |
| sendingCode      | STATE-access-door-sending     | COPY-access-door-sending              | Continue pressed. The case renders this one, because a case is one per state and the fixture has to pick. |
| leavingForGoogle | STATE-access-door-sending     | COPY-access-door-leaving-for-google   | Continue with Google pressed. The same frozen field and the same replaced button; a different destination and a different promise. |
| clerkUnreachable | STATE-access-door-unavailable | COPY-access-door-unavailable-body     | RULE-access-route-guard's `unreachable`, and RULE-access-door-arrival's. Waiting helps, so the words may say so. |
| attemptStuck     | STATE-access-door-unavailable | COPY-access-door-stuck-body           | RULE-access-code-outcome's `code: stuck`, arriving through RULE-access-door-entry. "This is us, not you" is still the honest sentence; "try again in a few minutes" is not. |
