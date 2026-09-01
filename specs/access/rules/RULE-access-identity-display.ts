// RULE-access-identity-display: the figures. The rule itself is the property
// in RULE-access-identity-display.test.ts, and the function it holds to
// account is `shorten` in lib/access/identity.ts -- the one the sketches
// render with.

/** RFC 5321's ceiling on an address. Clerk will not hold a longer one. */
export const MAX_EMAIL_LENGTH = 254

/**
 * The address the overflow states use: long enough to break every layout,
 * short enough to be a real address. `LONG_EMAIL` in fixtures.ts is this long,
 * and the invariant checks that it still is.
 */
export const OVERFLOW_EMAIL_LENGTH = 250

/** How much of the local part survives the middle-ellipsis. */
export const KEEP_LOCAL_CHARS = 12
