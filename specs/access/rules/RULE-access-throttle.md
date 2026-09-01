## RULE-access-throttle

How often a person may ask for a code or try one. Three limits, three windows,
and each one refuses somewhere different: a refused `signIn` is a sentence on
the door, a refused `verify` is the `throttled` column of
`RULE-access-code-outcome`, and a refused `resend` is a control that should
never have been pressable.

Split out of `RULE-access-code` at /implement-rules. The figures are the
interview's, unchanged; what moved is that "how many sign-in attempts may be
started in ten seconds" was sitting in a rule about the code screen while its
own note said it is "hit from the door, not the code screen".

`used` is how many of the *same* action have already gone out inside that
action's window, so `used` is 0 on the first. The counts are Clerk's: five
`SignIn` creations per ten seconds, three attempt-verifications per ten
seconds, and one code per thirty-second cooldown.

**Inputs:** action: {signIn, verify, resend}, used: number(0..)
**Hit policy:** UNIQUE

| action | used   | outcome | window | note |
| ------ | ------ | ------- | ------ | ---- |
| signIn | [0..4] | allowed | 10     | Five addresses in ten seconds. Hit from the door, and the sixth shows COPY-access-door-error-throttled. |
| signIn | (4..]  | refused | 10     | 429. STATE-access-door-rejected, with the address still in the field. |
| verify | [0..2] | allowed | 10     | Three tries in ten seconds. |
| verify | (2..]  | refused | 10     | 429, and Clerk answers it before it looks at the digits -- so a right code is refused too. STATE-access-code-throttled. |
| resend | 0      | allowed | 30     | The first ask after the cooldown ran out. |
| resend | (0..]  | refused | 30     | Clerk's floor. RULE-access-resend keeps the control dead until the window is over, so this should be unreachable -- but our countdown and Clerk's floor can drift (two tabs, a code sent from the callback, a clock). When it is reached it is a 429 on the code screen, which is STATE-access-code-throttled. |

<!-- Three Deliberate unknowns sit under this table, and each one is a row it
     would gain rather than a rule it would need.

     Whether a wrong code is burned after N wrong tries: we found the request
     throttles above and no per-code attempt counter. If one exists it lands on
     STATE-access-code-throttled.

     How many resends are allowed over a longer window: the signIn ceiling is
     the only one we found. A separate resend cap lands on the same screen.

     How long the wait is: unsayable until clerk/javascript#5405 exposes
     Retry-After through the JS SDK. Until then STATE-access-code-throttled
     says it in words and shows no number. -->
