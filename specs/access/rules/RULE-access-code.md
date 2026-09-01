# RULE-access-code

What a verification code is, and how long it lives. How often a person may ask for or try
one is `RULE-access-throttle`.

| Input | Output | Why |
| --- | --- | --- |
| how many digits | 6 | Clerk's emailed code. Six boxes, not a free-text field. |
| how long a code is good for | 10 minutes | Clerk: "remains valid for 10 minutes". Past this the attempt is over, not retryable: STATE-access-code-expired. |
| what the code is on a development instance | 424242 | Clerk's fixed code for any `+clerk_test` address. This is what the journey tier types. |
| how many codes are live at once | one | A new code kills the old one. Two live codes at a time is a rule nobody could reason about, so the person uses the newest email. |

**Split at /implement-rules.** Three rows left here for `RULE-access-throttle`: how soon
another code may be asked for (30 seconds), how many tries are allowed in ten seconds
(3), and how many sign-in attempts may be started in ten seconds (5). The figures are the
interview's and did not move. What moved is that they are about *how often*, not about
*what a code is* — and the third of them said so itself: "hit from the door, not the code
screen", sitting in a rule about the code screen. Both Deliberate unknowns — how long the
wait is, and whether a wrong code is burned after N tries — went with them.

**Rung:** type — `RULE-access-code.ts`. Two things here can be made unrepresentable
rather than tested for, and both are:

- **A code that is not six digits.** `code()` is the only way to make one, and
  `code("42424")` does not compile. Nothing downstream re-checks, because nothing
  downstream can be handed anything else.
- **Two live codes.** `CodeAttempt` holds one `live`, not a list. There is nowhere to put
  a second code while the first is still good, which is `RULE-access-resend`'s "a new code
  kills the old one" written where it cannot be forgotten.

`pnpm typecheck` is the check; the assertions it reads are the `@ts-expect-error` lines in
`RULE-access-code.test.ts`.
