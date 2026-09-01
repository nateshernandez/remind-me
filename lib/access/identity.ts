// RULE-access-identity-display, implemented.
//
// The sketches import `shorten` from here rather than defining it, so the
// invariant and the screens are looking at one function. A slice promoting a
// sketch to a real component changes the import and nothing else.

import {
  MAX_EMAIL_LENGTH,
  KEEP_LOCAL_CHARS,
} from "@/specs/access/rules/RULE-access-identity-display"

/**
 * An address too long for a sentence, shortened in the middle. The start of
 * the local part says which account this is meant to be; the domain says
 * whether they typed the wrong one, and the domain is the half that a
 * truncation from the end would eat.
 */
export function shorten(
  email: string,
  keep: number = KEEP_LOCAL_CHARS
): string {
  const at = email.lastIndexOf("@")
  if (at < 0 || at <= keep) return email
  return `${email.slice(0, keep)}…${email.slice(at)}`
}

/**
 * The substitution itself. `null` in, `null` out: a screen that says "We sent
 * a code to" and stops is worse than one that does not claim it, so the caller
 * gets nothing to render rather than half a sentence.
 */
export function identitySentence(
  sentence: string,
  email: string | null | undefined
): string | null {
  if (!email) return null
  // A replacer function, not a replacement string: `$&`, `` $` `` and `$\'` are
  // live in a string replacement, and `$` is legal in a local part. Found by
  // the property in RULE-access-identity-display.test.ts, which is the whole
  // argument for the rung -- no listed example was ever going to have a `$`
  // in it.
  const shortened = shorten(email)
  return sentence.replace(/\{email\}/g, () => shortened)
}

/** RFC 5321's ceiling. Clerk will not hold a longer address, so nothing past
 * it can reach a screen -- but a fixture can, and this is what catches it. */
export function withinRfcLimit(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH
}
