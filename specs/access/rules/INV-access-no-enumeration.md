# INV-access-no-enumeration

Before a code is verified, nothing on screen tells a visitor whether an account exists behind
the address they typed.

This is the property ADR-0005 exists to buy, and the reason the door is one screen rather than
two. It holds across all addresses rather than at listed points, so an invariant is the likely
rung.

| Input | Output | Why |
| --- | --- | --- |
| an address with an account, pressed Continue | STATE-access-code-empty | The person is told a code was sent. |
| an address with no account, pressed Continue | STATE-access-code-empty | Identical screen, identical words, identical timing. `signUpIfMissing: true` is what makes this true. |
| an address whose account is locked | STATE-access-code-empty | The one case it is tempting to special-case, and the one that would give the answer away. A locked account is an account; refusing at the door says so. Whatever the lock means happens after verification. |
| an address this instance refuses (`not_allowed_access`) | STATE-access-door-blocked | The single permitted difference before verification, and it is permitted because it is a fact about the *address* and not about whether anyone signed up with it. A never-seen address on the blocklist is refused identically. |
| what else may differ before verification | nothing: not the copy, not the controls, not whether a code was really sent | A code is sent either way. Any other difference is the leak. |
| where the two paths may first differ | after the code is verified | A new account transfers with `signUp.create({ transfer: true })` on error `sign_up_if_missing_transfer`. That is the first honest fork. |
| what breaks this | catching `form_identifier_not_found` and pivoting to sign-up | Clerk's own docs warn this "reveals account existence before verification". If that code path ever appears, this rule is red. |

**Status:** stub. /implement-rules picks the rung.
