## RULE-access-code-outcome

Which screen a person lands on when they press Continue on the code screen. Two things decide
it and the twelve rows can only hold one of them per row, so the combination lives here.

`stuck` is the fourth value on the `code` dimension and it exists because a code can be
*accepted* without the attempt completing: Clerk can come back `needs_second_factor` or
`needs_client_trust` (MFA and device trust are Non-goals), or the transfer that turns a verified
attempt into a new account can fail. None of those is the person's fault and none of them is a
Google problem, so none of them may land on a Google-titled screen.

**Inputs:** code: {right, wrong, expired, stuck}, throttled: boolean
**Hit policy:** UNIQUE

| code    | throttled | state                         | note |
| ------- | --------- | ----------------------------- | ---- |
| -       | true      | STATE-access-code-throttled   | Clerk answers 429 before it looks at the digits, so a right code is refused too. |
| right   | false     | STATE-access-code-verified    | The only way through. New account or old, this is the same screen. |
| wrong   | false     | STATE-access-code-wrong       | `form_code_incorrect`, 422. Retype: the attempt is still alive. |
| expired | false     | STATE-access-code-expired     | Past ten minutes. The attempt is over; the way forward is the door, not this screen. |
| stuck   | false     | STATE-access-door-unavailable | Accepted and cannot complete. This is a misconfiguration or a failed transfer -- "this is us, not you" is the honest sentence, and it is the door's. |
