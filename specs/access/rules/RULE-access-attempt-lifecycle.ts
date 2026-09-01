// RULE-access-attempt-lifecycle
//
// The rung is `machine`, because this is a lifecycle: one `SignIn`/`SignUp`
// object, in memory on the client, from the moment the door creates it to the
// moment it is verified, expired, reloaded away, or overtaken by another tab.
//
// The table is about the *attempt*, not about the screens. Which screen a
// finished attempt shows is RULE-access-callback-outcome's and
// RULE-access-code-outcome's business; saying it twice would be two places to
// change and one of them would be missed. So Google's four unhappy answers
// collapse into `googleUnusable` here: the attempt is over either way, and
// only the words differ.
//
// The empty cells are the point. `complete`, `stuck` and `abandoned` take no
// events, and `atGoogle` takes exactly one -- an attempt that has left for
// Google cannot be reloaded away, because what comes back rehydrates from
// Clerk's `Client` rather than from the object the tab was holding.

export type State =
  /** No attempt. The door, and what a reload leaves behind. */
  | "none"
  /** `signIn.create({ identifier, signUpIfMissing: true })` is in flight. */
  | "identifying"
  /** Waiting for the emailed code. `needs_first_factor` on a sign-in; on a
   * sign-up, `missing_requirements` *and* `unverifiedFields` including
   * email_address *and* `missingFields` empty -- all three, or the screen is
   * guessing. */
  | "awaitingCode"
  /** The browser is at Google. Nothing on this client to lose. */
  | "atGoogle"
  /** Back from Google, finalizing off the rehydrated `Client`. */
  | "finalizing"
  /** Verified, and `signUp.create({ transfer: true })` is turning it into a
   * new account. One arrow on a diagram, one network call that can fail. */
  | "transferring"
  /** A session exists. */
  | "complete"
  /** Accepted and cannot complete: `needs_second_factor`,
   * `needs_client_trust`, or a transfer that failed. Ours to fix, not theirs. */
  | "stuck"
  /** Over, with something to say about it. Which words is a table's call. */
  | "abandoned"

export type Event =
  | "create"
  | "rejected"
  | "startGoogle"
  | "returnFromGoogle"
  | "googleLinked"
  | "googleUnusable"
  | "codeSent"
  | "resend"
  | "codeAccepted"
  | "codeRejected"
  | "needsAccount"
  | "moreFactorsNeeded"
  | "transferred"
  | "transferFailed"
  | "expire"
  | "reload"
  | "signedInElsewhere"

export const machine = {
  none: {
    create: "identifying",
    startGoogle: "atGoogle",
    // A cold /sso-callback: the URL opened with no attempt behind it. Nothing
    // to finalize, and RULE-access-callback-outcome calls it `google: none`.
    returnFromGoogle: "abandoned",
  },
  identifying: {
    // Clerk refused the identifier step -- malformed, throttled, blocked. No
    // attempt was created, so there is nothing to go back to but the door.
    rejected: "none",
    codeSent: "awaitingCode",
    reload: "none",
    signedInElsewhere: "complete",
  },
  atGoogle: {
    returnFromGoogle: "finalizing",
  },
  finalizing: {
    googleLinked: "complete",
    // Google returned an address it has not verified and an account already
    // holds it. `signUp.verifications.sendEmailCode()` runs here, on the
    // callback and before the screen changes -- without it the code screen
    // says "we sent a code" on a path where nothing sent one.
    codeSent: "awaitingCode",
    googleUnusable: "abandoned",
    signedInElsewhere: "complete",
  },
  awaitingCode: {
    codeAccepted: "complete",
    // Verified, and no account behind the address: error
    // `sign_up_if_missing_transfer`. This is the first honest fork between a
    // new visitor and a returning member -- see INV-access-no-enumeration.
    needsAccount: "transferring",
    // `form_code_incorrect`, 422. The attempt is still alive; retype.
    codeRejected: "awaitingCode",
    // A new code, and the old one is dead: RULE-access-code holds one `live`.
    resend: "awaitingCode",
    moreFactorsNeeded: "stuck",
    expire: "abandoned",
    reload: "none",
    signedInElsewhere: "complete",
  },
  transferring: {
    transferred: "complete",
    transferFailed: "stuck",
  },
  complete: {},
  stuck: {},
  abandoned: {},
} as const satisfies Record<State, Partial<Record<Event, State>>>

/** Where `event` takes `state`, or `null` where the table is empty. */
export function next(state: State, event: Event): State | null {
  return (machine[state] as Partial<Record<Event, State>>)[event] ?? null
}
