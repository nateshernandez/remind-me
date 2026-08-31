# Vocabulary — `access`

Terms that were argued about while drafting this feature. Where Clerk's word and ours differ,
ours is the one that appears in `copy.ts` and in assertions; Clerk's is the one that appears
in code.

| Term | What we mean | What we do **not** mean |
| --- | --- | --- |
| **the door** | The single screen at `/sign-in` that both creates an account and returns to one. `/sign-up` redirects to it. See ADR-0005. | A "sign-up page". There isn't one. |
| **sign up** / **sign in** | The same walk, told from either end. Which one happened is only known after the code is verified. | Two flows, two routes, or two sets of screens. |
| **code** | The six digits Clerk emails. Called "verification code" to the person, `email_code` in Clerk, OTP by nobody user-facing. | A password. There are none — see Non-goals. |
| **magic link** | Out. ADR-0002. | Anything shipping in this feature. |
| **member** | A person with an account here. Used in actor names only; the product never says "member" to a person. | "User" — Clerk's word for the record, kept in code. |
| **attempt** | One `SignIn`/`SignUp` object: in-memory, client-side, and gone on reload. A reload from the code screen returns to the door. | A session. |
| **session** | What exists after `finalize()`. Max lifetime 7 days; the token proving it is a 60-second JWT. | An attempt. |
| **the app** | The signed-in shell at `/`. In this feature it holds one control. | Reminders. This feature ships no reminders. |
| **blocked** | This instance refuses the *address* — an allowlist or blocklist, `not_allowed_access`. Never a locked account: locking is a fact about an account, and refusing at the door would leak that one exists. See [INV-access-no-enumeration]. | Throttled, which is a wait, not a refusal. |
| **throttled** | Clerk returned 429. A wait. We cannot say how long: `Retry-After` comes back on the wire but is not exposed through the JS SDK (clerk/javascript#5405). | Blocked. |
| **stale** | The screen says you are signed in and you are not, because the 60-second token has not refreshed yet (clerk/javascript#874). | Offline. |

## Clerk words that appear in code and never on screen

`identifier`, `first factor`, `strategy`, `oauth_google`, `email_code`, `missing_requirements`,
`unverifiedFields`, `needs_first_factor`, `needs_client_trust`, `finalize`, `sso`, `transfer`.
