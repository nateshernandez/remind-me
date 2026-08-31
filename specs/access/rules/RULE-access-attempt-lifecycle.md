# RULE-access-attempt-lifecycle

The life of one sign-in attempt: where it can be, what moves it, what survives a redirect, and
where it cannot be.

This is the witness for three waivers — the code screen's loading row, and the callback's empty
and conflict rows. Each is a claim that one of those screens cannot be entered or left in some
way, and this is the artifact that would go red if that stopped being true.

| Input | Output | Why |
| --- | --- | --- |
| where the `SignIn` / `SignUp` object lives | in memory on the client | A reload loses it. This is why the code screen has no loading row: it cannot be entered cold. |
| what a reload on the code screen does | returns to the door | There is no attempt left to resume, so there is nothing to draw. |
| what survives the round trip to Google | Clerk's `Client`, not the in-memory attempt | The callback is a fresh document. It rehydrates the client and finalizes from that, which is the only reason JOURNEY-access-with-google can cross an origin at all. |
| what a cold `/sso-callback` finds | no attempt on the rehydrated client | Nothing to finalize: STATE-access-callback-failed, which is `google: none` in RULE-access-callback-outcome. |
| the states a sign-in can be in | needs_identifier, needs_first_factor, needs_second_factor, needs_client_trust, complete | Clerk's `SignIn.status`. `needs_client_trust` is new in Core 3 and is easy to leave out of a switch. |
| the states a sign-up can be in | missing_requirements, complete | Clerk's `SignUp.status`. There is no `abandoned` status: `abandonAt` is a timestamp, and `abandoned` is a *session* status. |
| how "waiting for the emailed code" is recognised on sign-up | status is missing_requirements, `unverifiedFields` includes email_address, and `missingFields` is empty | All three, or the screen is guessing. |
| what happens between a verified code and a new account | a second call: `signUp.create({ transfer: true })` on error `sign_up_if_missing_transfer` | It is a network call on the step that looks like one arrow, and it can fail. A failed transfer is `code: stuck` in RULE-access-code-outcome. |
| what sends the code when the callback routes to the code screen | `signUp.verifications.sendEmailCode()`, on the callback and before the screen changes | Without this row the code screen says "we sent a code" on a path where nothing sent one. |
| what we do with needs_second_factor or needs_client_trust | treat as `code: stuck` | MFA and device trust are Non-goals; pretending to handle them is worse than saying we do not. It is a misconfiguration, not a Google failure, so it does not land on a Google-titled screen. |
| what ends an attempt | verification, expiry, a reload, or a session appearing in another tab | The last one is STATE-access-code-already-signed-in, not a waiver. |

**Status:** stub. /implement-rules picks the rung. A machine table is the likely rung: this is a lifecycle.
