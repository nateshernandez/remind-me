## RULE-access-callback-outcome

Where the browser ends up coming back from Google. What Google said and what Clerk found
behind the address are independent, and together they pick the screen.

`none` on the `google` dimension is a cold `/sso-callback` — the URL opened with no attempt
behind it. `blocked` on the `link` dimension is the screen that was missing: instance
restrictions apply to an OAuth identifier exactly as they do to a typed one, so a Google
address this instance refuses gets refused *after* Google has already authenticated the person.

**Inputs:** google: {authorized, declined, error, none}, link: {clean, unverified, claimed, blocked}
**Hit policy:** UNIQUE

| google     | link       | state                          | note |
| ---------- | ---------- | ------------------------------ | ---- |
| none       | -          | STATE-access-callback-failed   | Opened cold, or the attempt did not survive the round trip. There is nothing to finalize. |
| declined   | -          | STATE-access-callback-declined | `oauth_access_denied`, 403. They said no at Google's consent screen; nothing is wrong. |
| error      | -          | STATE-access-callback-failed   | The exchange itself failed. |
| authorized | clean      | STATE-access-app-signed-in     | No account, or one Clerk links on a verified address. Straight through, no interstitial. |
| authorized | unverified | STATE-access-code-empty        | Google returned an address it has not verified and an account already has it. Clerk sends a code before it will link them, which is why the code screen can be entered without the door sending anything. |
| authorized | claimed    | STATE-access-callback-failed   | `oauth_identification_claimed`, 400. Another account holds this address; the words point at the emailed code instead. |
| authorized | blocked    | STATE-access-callback-blocked  | `not_allowed_access`. Authenticated by Google and refused by us, which needs its own words: nothing they can retry will change it. |
