# RULE-access-code

What a verification code is, how long it lives, and how often a person may ask for or try one.

| Input | Output | Why |
| --- | --- | --- |
| how many digits | 6 | Clerk's emailed code. Six boxes, not a free-text field. |
| how long a code is good for | 10 minutes | Clerk: "remains valid for 10 minutes". Past this the attempt is over, not retryable: STATE-access-code-expired. |
| how soon another code may be asked for | 30 seconds | Clerk: "users must wait 30 seconds before requesting another". The Resend control is dead until then and has to look it. |
| how many tries in ten seconds | 3 | Clerk's Frontend API throttle on attempt-verification. The fourth is a 429: STATE-access-code-throttled. |
| how many sign-in attempts may be started in ten seconds | 5 | Clerk's throttle on creating a SignIn. Hit from the door, not the code screen. |
| what the code is on a development instance | 424242 | Clerk's fixed code for any `+clerk_test` address. This is what the journey tier types. |
| how long the wait is when throttled | unknown, and said in words | Clerk returns `Retry-After` on the 429 and the JS SDK does not expose it (clerk/javascript#5405). No countdown until it does. |
| whether a wrong code is burned after N wrong tries | unknown | We found the request throttle above and no per-code attempt counter. If one exists it lands on STATE-access-code-throttled and this table gains a row. |

**Status:** stub. /implement-rules picks the rung.
