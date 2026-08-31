# RULE-access-resend

The "send a new code" control on the code screen: when it works, what it looks like while it
does not, and what a new code does to the old one.

The control has two appearances — cooling and live — and the twelve rows have nowhere to put
that. It is not a thirteenth state of the screen; it is a control on STATE-access-code-empty
and STATE-access-code-wrong that both of those states' fixtures have to be able to show in
either appearance. Writing that down here is the decision, rather than leaving it to whoever
builds the sketch.

| Input | Output | Why |
| --- | --- | --- |
| how soon another code may be asked for | 30 seconds | Clerk's floor. Asking sooner is refused, so the control must not invite it. |
| what the control looks like while cooling | disabled, and counting | This countdown we *can* run: it is our own cooldown, not Clerk's `Retry-After`. COPY-access-code-resend-waiting. |
| what it looks like at zero seconds | live, reading "Send a new code" | The countdown does not linger at 0. COPY-access-code-resend. |
| what a successful resend renders | the code screen, empty, cooldown restarted | Same screen as arriving; the six boxes clear so a half-typed old code cannot be submitted against a new one. |
| whether a new code restarts the ten minutes | yes, and it kills the old code | Two live codes at once is a rule nobody could reason about. The person uses the newest email. |
| how many resends are allowed | unknown | Clerk's create-attempt throttle (5 per 10s) is the only ceiling we found. If a separate resend cap exists it lands on STATE-access-code-throttled and this table gains a row. |

**Status:** stub. /implement-rules picks the rung.
