# RULE-access-rejection-copy

Which words the door shows when it refuses on the spot, and for which cause. One screen
(STATE-access-door-rejected) with one error region; what changes is the sentence.

The outcome column is a `COPY-` id, not a state, so this is a plain decision table rather than
a resolution table. Which screen you are on is already settled by the twelve rows and by
RULE-access-door-arrival; this decides only what that screen says.

Every row here lands on STATE-access-door-rejected. A cause that lands somewhere else does not
belong in this table: an address this instance refuses is STATE-access-door-blocked and a Clerk
that cannot be reached is STATE-access-door-unavailable, and both of those screens ship their
own title and body rather than a line in an error region.

| Input | Output | Why |
| --- | --- | --- |
| what was typed is not an address | COPY-access-door-error-format | Caught before Clerk is called. Their mistake, and a fixable one. |
| Google could not be started (`signIn.sso` threw) | COPY-access-door-error-google | Must not read like the address was wrong. The email route still works, and the words have to say so. |
| more than five addresses submitted in ten seconds (429) | COPY-access-door-error-throttled | A wait, with no number in it: `Retry-After` is not exposed to us (clerk/javascript#5405). |

**Status:** stub. /implement-rules picks the rung.
