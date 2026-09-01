// What the door does when Continue is pressed. Two rules live here because
// they are two halves of one call: what Clerk came back with, and what the
// screen is then allowed to say.
//
// INV-access-no-enumeration is the reason this file has the shape it has.
// `signIn.create({ identifier, signUpIfMissing: true })` is one call with one
// answer, and there is deliberately no branch on whether an account was found.
// The error code Clerk's own docs warn about --  the one that reveals account
// existence before verification -- appears nowhere in this module, and
// INV-access-no-enumeration.test.ts reads the source to say so.

// --- INV-access-no-enumeration ----------------------------------------------

/**
 * What Clerk knows about the address behind the identifier step. Three of
 * these four are indistinguishable to the person on the other side, and that
 * is the requirement rather than an accident of the implementation.
 */
export type Identifier =
  | "exists" // an account is behind this address
  | "missing" // none is, and signUpIfMissing will make one after verification
  | "locked" // one is, and it is locked -- which is a fact about an account
  | "refused" // this instance will not take this address at all

export type DoorOutcome = {
  state: string
  /** What the screen says beyond its own copy. Nothing, here, on every path
   * that sends a code: an extra sentence is a difference, and a difference is
   * the leak. */
  detail: null
}

/**
 * Where pressing Continue lands, before any code is verified.
 *
 * `exists`, `missing` and `locked` return the same object. Not the same screen
 * with different words -- the same object. A code is sent either way, on the
 * same call, in the same time.
 *
 * `address` is taken and not read, on every path but none. That is the point:
 * nothing about the address -- its domain, its shape, whether it looks like
 * one we have seen -- may change what the screen says before verification.
 */
export function doorSubmit(address: string, behind: Identifier): DoorOutcome {
  if (behind === "refused") {
    // The single permitted difference, and it is permitted because it is a
    // fact about the *address*: a never-seen address on the blocklist is
    // refused identically, so it says nothing about who signed up.
    return { state: "STATE-access-door-blocked", detail: null }
  }
  // Everything else. There is no `switch` on the other three on purpose.
  return { state: "STATE-access-code-empty", detail: null }
}

// --- RULE-access-rejection-copy ---------------------------------------------

/** Why the door refused on the spot. Each lands on the same screen. */
export type RejectionCause = "format" | "google" | "throttled"

export type RejectionCopyId =
  | "COPY-access-door-error-format"
  | "COPY-access-door-error-google"
  | "COPY-access-door-error-throttled"

/**
 * Which sentence goes in the door's one error region. Which *screen* is
 * already settled -- STATE-access-door-rejected, every row -- so this decides
 * only what it says.
 */
export function rejectionCopy(cause: RejectionCause): RejectionCopyId {
  switch (cause) {
    case "format":
      // Caught before Clerk is called. Their mistake, and a fixable one.
      return "COPY-access-door-error-format"
    case "google":
      // Must not read like the address was wrong: the email route still works.
      return "COPY-access-door-error-google"
    case "throttled":
      // A wait, with no number in it (clerk/javascript#5405).
      return "COPY-access-door-error-throttled"
  }
}
