## RULE-access-resend

The "send a new code" control on the code screen: what it looks like, and when.

The control has three appearances and the twelve rows have nowhere to put them.
It is not a thirteenth state of the screen; it is a control on the code screen,
and which appearance a case renders is the case's to pick because a case is one
per state. STATE-access-code-empty renders it cooling at the full window,
STATE-access-code-wrong renders it live, and the states where the screen is not
asking for a code -- verifying, throttled, expired -- do not render it at all.
That third appearance was already in the sketch (`resendIn === undefined`) and in
no rule, which is the kind of thing a slice inherits without knowing it decided
anything.

A successful resend renders the code screen empty with the cooldown restarted:
the same screen as arriving, and the six boxes clear so a half-typed old code
cannot be submitted against a new one. The two things that make that safe are
written where they cannot be forgotten rather than here. *Whether* Clerk will
take the request at all is RULE-access-throttle -- thirty seconds is its
`resend` window. And what a new code does to the old one is RULE-access-code:
an attempt holds one `live` code, not a list, so a second one cannot exist
beside the first.

`secondsLeft` is what is left of the cooldown, counted from when the code was
sent and clamped into the window: `RESEND_COOLDOWN_SECONDS - (now - sentAt)`,
never below 0 and never above 30. The clamp is what makes this table's declared
domain honest, and it is why the screen entered from the Google callback is not
a gap -- `RULE-access-callback-outcome`'s `authorized | unverified` row sends the
code on the callback, before the screen changes, so that screen draws with part
of the window already spent rather than with a number outside it.

It is our own countdown, not Clerk's `Retry-After` -- that one we cannot read
(clerk/javascript#5405), which is why STATE-access-code-throttled has no number
on it and this control does.

**Inputs:** stage: {waiting, busy}, secondsLeft: number(0..30)
**Hit policy:** UNIQUE

| stage   | secondsLeft | appearance | copy                            | note |
| ------- | ----------- | ---------- | ------------------------------- | ---- |
| busy    | -           | absent     | none                            | The screen is not asking for a code: it is checking one, refusing to, or done with this attempt. A control that cannot be pressed is better gone than greyed. |
| waiting | 0           | live       | COPY-access-code-resend         | The countdown does not linger at "in 0s". |
| waiting | (0..]       | cooling    | COPY-access-code-resend-waiting | Disabled, and counting. A control that is only going to be refused must not invite the press. |
