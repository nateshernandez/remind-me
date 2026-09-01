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
| whether the Google callback is in scope | no, and this row is why | `COPY-access-callback-failed-body` names a conflicting account out loud ("may already belong to an account that does not use Google"), and that is allowed. Google has already proved the person owns the address; nobody reaches `/sso-callback` without authenticating as its owner, so there is nothing left to enumerate. The property is about the *typed* address, where anyone can type anyone's. |

**Rung:** invariant — `INV-access-no-enumeration.test.ts`, over `doorSubmit`. It generates addresses rather than listing them, because the
requirement is about *every* address: `exists`, `missing` and `locked` must return the
same object, not the same screen with different words. "what breaks this" is checked by reading
every source file that could hold the pivot — `lib/` and `app/`, whatever the slice adds
to them — and asserting the error code Clerk warns about appears in none of them. Pinning
it to one file would have watched a module that has no Clerk call in it while the pivot
got written in the page that does.
