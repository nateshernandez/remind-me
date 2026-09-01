// RULE-access-session
//
// The rung is `type`. Every row of RULE-access-session.md that can go wrong
// goes wrong the same way: something reads a session as a boolean. Clerk's
// `isSignedIn` is `undefined` until the script has loaded, `false` after it
// has, and `false` again when the network is gone -- three different facts
// flattened into two values, and the flattening is what redirects a validly
// signed-in person to the door.
//
// So the fix is not a test. It is that there is no boolean to read.

/**
 * What is known about the session, right now. Four values, and the compiler
 * will not let a caller collapse them: this is the domain the `session` column
 * of RULE-access-route-guard and RULE-access-door-arrival ranges over, and the
 * two tables are total over exactly these four.
 */
export type SessionView =
  | { readonly status: "loading" }
  | {
      readonly status: "live"
      readonly email: string
      readonly expiresAt: number
    }
  | { readonly status: "none" }
  | { readonly status: "unreachable" }

/** The four, as a value, so a table's domain and a switch cannot drift apart. */
export const SESSION_STATUSES = [
  "loading",
  "live",
  "none",
  "unreachable",
] as const

export type SessionStatus = SessionView["status"]

/**
 * Clerk's default, unchanged. A person who signs in on Monday is out by the
 * next Monday whatever they do in between.
 */
export const SESSION_MAX_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Off, and one of the two must be on at all times, so the 7-day cap above is
 * the one carrying the requirement. `null` rather than `0`: zero would read as
 * "times out immediately".
 */
export const INACTIVITY_TIMEOUT_MS = null

/**
 * The JWT proving the session. Clerk refreshes it continuously, which is why a
 * screen can say "you are signed in" for up to this long after the session
 * ended somewhere else (clerk/javascript#874). That window is
 * STATE-access-app-session-ended, and it is a state rather than a bug.
 */
export const SESSION_TOKEN_LIFETIME_MS = 60 * 1000

/**
 * One account at a time. Multi-session is a Non-goal, and Clerk's escape hatch
 * for it is the `sessionId` argument to `signOut()` -- so this type does not
 * have one, and no call site can grow one by accident.
 */
export type SignOut = () => Promise<void>
