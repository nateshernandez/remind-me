// RULE-access-code
//
// The rung is `type`. Two things about a code can go wrong, and both can be
// made unrepresentable rather than tested for:
//
//   1. A code that is not six digits. `code()` is the only way to make one,
//      and it does not compile for anything else.
//   2. Two live codes at once. An attempt holds one `live`, not a list, so a
//      new code cannot sit beside the old one -- which is the whole of
//      RULE-access-resend's "a new code kills the old", written where it
//      cannot be forgotten.
//
// How *often* a code may be asked for or tried is RULE-access-throttle.

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

/**
 * Exactly six digits. The five single-character `infer`s pin the first five
 * positions; requiring the remainder to be one digit pins the length.
 */
type SixDigits<S extends string> =
  S extends `${infer A}${infer B}${infer C}${infer D}${infer E}${infer Rest}`
    ? [A, B, C, D, E, Rest] extends [Digit, Digit, Digit, Digit, Digit, Digit]
      ? S
      : never
    : never

declare const sixDigits: unique symbol

/** Six digits Clerk emailed. Not a password: there are none. */
export type VerificationCode = string & { readonly [sixDigits]: true }

/**
 * The only way to make one. `code("42424")` and `code("4a4242")` do not
 * compile, so nothing downstream has to check.
 */
export function code<S extends string>(
  literal: S & SixDigits<S>
): VerificationCode {
  return literal as unknown as VerificationCode
}

/** Six boxes, not a free-text field. */
export const CODE_LENGTH = 6

/**
 * Clerk: a code "remains valid for 10 minutes". Past this the attempt is over
 * rather than retryable -- STATE-access-code-expired sends the person back to
 * the door, not round this screen again.
 */
export const CODE_LIFETIME_MS = 10 * 60 * 1000

/**
 * Clerk's fixed code for any `+clerk_test` address on a development instance.
 * This is what the journey tier types, which is why it is here and not in a
 * test file: if it stops being six digits the journey stops compiling.
 */
export const DEV_INSTANCE_CODE = code("424242")

/**
 * One attempt's code. `live` is one field, not an array: a second live code is
 * a state nobody could reason about, so it is not a state this type can hold.
 *
 * `null` is an attempt that has not sent one yet -- the door mid-`create`, or
 * the callback before `sendEmailCode()` returns. It is never a code *screen*:
 * both ways in send the code before the screen changes, which is what
 * SURFACE-access-code's waived loading row claims and what
 * RULE-access-attempt-lifecycle witnesses.
 */
export type CodeAttempt = {
  readonly sentTo: string
  readonly live: {
    readonly code: VerificationCode
    readonly sentAt: number
  } | null
}
