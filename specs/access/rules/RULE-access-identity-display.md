# RULE-access-identity-display

How an email address gets into a sentence, and what happens when it is too long for one.

Three strings interpolate: COPY-access-code-subtitle and COPY-access-app-signed-in take
`{email}`, and COPY-access-code-resend-waiting takes `{seconds}`. Two states exist purely to
answer the overflow question — STATE-access-code-long-email and STATE-access-app-long-identity —
and until this rule exists neither of them knows what it is supposed to show.

| Input | Output | Why |
| --- | --- | --- |
| who substitutes `{email}` | the sketch, from its fixture; never string concatenation at the call site | The assertion and the sketch have to read the same constant, or the copy stops being the spec. |
| the longest address we accept | 254 characters | RFC 5321's ceiling. Clerk will not hold a longer one, so nothing past it can reach a screen. |
| the address the overflow states use | 250 characters | Long enough to break every layout, short enough to be a real address. |
| what a long address does in a sentence | middle-ellipsis, keeping the local part's start and the whole domain | The domain is what someone checks to see if they typed the wrong account. Truncating the end hides exactly the part that matters. |
| whether the sentence may wrap to a second line | yes; it may not scroll the page sideways | An error you have to scroll to read is an error nobody reads. |
| what shows when `{email}` is missing | nothing renders that sentence | A screen that says "We sent a code to" and stops is worse than one that does not claim it. |
| what shows when `{seconds}` is 0 | the live control, not "in 0s" | The countdown does not linger at zero. See RULE-access-resend. |

**Rung:** invariant — `RULE-access-identity-display.test.ts`, over `shorten` and
`identitySentence` in `lib/access/identity.ts`. That is the same `shorten` the sketches
render with: it moved out of `sketches.tsx` at /implement-rules so the property and the
screens hold one function to account, and so a slice promoting a sketch to a real
component changes an import and nothing else.

The row about wrapping is the one thing here a property cannot see. It is a layout claim,
and its witnesses are `STATE-access-code-long-email` and `STATE-access-app-long-identity` —
two screenshots that go red if the sentence ever scrolls the page sideways.

**Found by the property, on the first run:** the substitution used
`String.prototype.replace` with a replacement *string*, in which `$&`, `` $` `` and `$'`
are live — and `$` is legal in a local part, so an address containing one rewrote the
sentence around it. No listed example was ever going to have a `$` in it. Fixed in
`lib/access/identity.ts` and in `sketches.tsx`, and this is the argument for the rung.
