// Which screen, given what is known. One function per resolution table in
// specs/access/rules/, each written from the rule's prose rather than from its
// markdown -- the tables and these are two expressions of the same decision,
// and the tests hold them against each other. A switch that quietly agrees
// with a table it was generated from proves nothing.

import type { SessionStatus } from "@/specs/access/rules/RULE-access-session"

export type StateId = string

// --- RULE-access-door-arrival -----------------------------------------------

/**
 * How someone got to `/sign-in`. What produces each of these is
 * RULE-access-door-entry: three of them are unreachable through a plain link,
 * and `stuck` cannot be produced by the session at all.
 */
export type Arrival = "cold" | "signup" | "signedOut" | "expired" | "stuck"

/** Which door someone sees. The session alone does not decide it. */
export function doorArrival(input: {
  arrival: Arrival
  session: SessionStatus
}): StateId {
  switch (input.session) {
    case "loading":
      return "STATE-access-door-loading"
    case "live":
      return "STATE-access-door-already-signed-in"
    case "unreachable":
      return "STATE-access-door-unavailable"
  }
  // Signed out for certain: now how they got here matters.
  if (input.arrival === "signedOut") return "STATE-access-door-signed-out"
  if (input.arrival === "expired") return "STATE-access-door-filled"
  if (input.arrival === "stuck") {
    // Accepted and cannot complete. The same screen an unreachable Clerk gets
    // and not the same fact, which is why RULE-access-door-sentence exists.
    return "STATE-access-door-unavailable"
  }
  // Cold, or bounced off /sign-up, which ADR-0005 says is a redirect and
  // nothing else: the same screen and the same words.
  return "STATE-access-door-empty"
}

// --- RULE-access-route-guard ------------------------------------------------

export type Route = "app" | "callback"

/** What a request gets, given where it is going. The contract proxy.ts owes. */
export function routeGuard(input: {
  route: Route
  session: SessionStatus
}): StateId {
  if (input.route === "callback") {
    // The callback has to finalize the attempt Google sent back whatever the
    // session says, so three of the four answers are the same screen.
    return input.session === "unreachable"
      ? "STATE-access-callback-failed"
      : "STATE-access-callback-working"
  }
  switch (input.session) {
    case "loading":
      return "STATE-access-app-loading"
    case "live":
      return "STATE-access-app-signed-in"
    case "unreachable":
      // Not a bare door: someone who cannot be told why will retype a correct
      // address until they give up.
      return "STATE-access-door-unavailable"
    case "none":
      // Explicit, not auth.protect(): clerk/javascript#8302 sends it back to
      // the current URL instead of the sign-in page.
      return "STATE-access-door-empty"
  }
}

// --- RULE-access-code-outcome -----------------------------------------------

export type CodeResult = "right" | "wrong" | "expired" | "stuck"

/** Where pressing Continue on the code screen lands. */
export function codeOutcome(input: {
  code: CodeResult
  throttled: boolean
}): StateId {
  // Clerk answers 429 before it looks at the digits, so a right code is
  // refused too.
  if (input.throttled) return "STATE-access-code-throttled"
  switch (input.code) {
    case "right":
      return "STATE-access-code-verified"
    case "wrong":
      return "STATE-access-code-wrong"
    case "expired":
      return "STATE-access-code-expired"
    case "stuck":
      // Accepted and cannot complete -- MFA, device trust, or a failed
      // transfer. "This is us, not you", and that sentence is the door's.
      return "STATE-access-door-unavailable"
  }
}

// --- RULE-access-callback-outcome -------------------------------------------

export type GoogleResult = "authorized" | "declined" | "error" | "none"
export type LinkResult = "clean" | "unverified" | "claimed" | "blocked"

/** Where the browser ends up coming back from Google. */
export function callbackOutcome(input: {
  google: GoogleResult
  link: LinkResult
}): StateId {
  switch (input.google) {
    case "none":
      return "STATE-access-callback-failed"
    case "declined":
      return "STATE-access-callback-declined"
    case "error":
      return "STATE-access-callback-failed"
  }
  switch (input.link) {
    case "clean":
      return "STATE-access-app-signed-in"
    case "unverified":
      // Google returned an address it has not verified and an account already
      // holds it, so Clerk sends a code before it will link them.
      return "STATE-access-code-empty"
    case "claimed":
      return "STATE-access-callback-failed"
    case "blocked":
      // Authenticated by Google and refused by us. Nothing they retry helps.
      return "STATE-access-callback-blocked"
  }
}
