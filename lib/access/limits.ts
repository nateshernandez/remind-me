// How often a person may ask for a code or try one, and what the resend
// control looks like while they may not. RULE-access-throttle and
// RULE-access-resend, implemented from their prose.

// --- RULE-access-throttle ---------------------------------------------------

export type ThrottledAction = "signIn" | "verify" | "resend"

/**
 * Whether Clerk will take this request, given how many of the same action have
 * already gone out inside that action's window. `refused` on `verify` is what
 * makes `throttled` true in RULE-access-code-outcome; `refused` on `signIn` is
 * what shows COPY-access-door-error-throttled on the door.
 */
export function throttle(input: {
  action: ThrottledAction
  used: number
}): "allowed" | "refused" {
  switch (input.action) {
    case "signIn":
      // Clerk's throttle on creating a SignIn: five in ten seconds, and the
      // sixth is a 429. Hit from the door, not the code screen.
      return input.used < 5 ? "allowed" : "refused"
    case "verify":
      // Clerk's Frontend API throttle on attempt-verification. The fourth try
      // inside ten seconds is refused before the digits are read.
      return input.used < 3 ? "allowed" : "refused"
    case "resend":
      // One code per cooldown. The control is dead until the window is over,
      // so a second request inside it should never have been possible.
      return input.used < 1 ? "allowed" : "refused"
  }
}

/** The window each limit is counted over, in seconds. */
export const THROTTLE_WINDOW_SECONDS: Record<ThrottledAction, number> = {
  signIn: 10,
  verify: 10,
  resend: 30,
}

// --- RULE-access-resend -----------------------------------------------------

/** Clerk's floor: "users must wait 30 seconds before requesting another". */
export const RESEND_COOLDOWN_SECONDS = 30

/**
 * Whether the code screen is asking for a code right now. `busy` is checking
 * one, refusing to, or done with this attempt -- and none of those has a resend
 * control on it at all.
 */
export type ResendStage = "waiting" | "busy"

export type ResendControl = {
  appearance: "live" | "cooling" | "absent"
  copy: "COPY-access-code-resend" | "COPY-access-code-resend-waiting" | null
}

/**
 * What the "send a new code" control looks like with `secondsLeft` of its
 * cooldown to run. This countdown we can run: it is our own floor, not Clerk's
 * `Retry-After`, which the JS SDK does not expose (clerk/javascript#5405).
 *
 * At zero the control is live. The countdown does not linger at "in 0s".
 */
export function resendControl(input: {
  stage: ResendStage
  secondsLeft: number
}): ResendControl {
  if (input.stage === "busy") return { appearance: "absent", copy: null }
  return input.secondsLeft > 0
    ? { appearance: "cooling", copy: "COPY-access-code-resend-waiting" }
    : { appearance: "live", copy: "COPY-access-code-resend" }
}

/**
 * How much of the cooldown is left, counted from when the code was sent -- not
 * from when this screen was drawn. The clamp is what keeps the table's declared
 * `0..30` domain honest: a screen entered from the Google callback draws with
 * part of the window already spent, and a clock that jumped must not hand the
 * table a number it never declared.
 */
export function resendSecondsLeft(now: number, sentAt: number): number {
  const left = RESEND_COOLDOWN_SECONDS - Math.floor((now - sentAt) / 1000)
  return Math.min(RESEND_COOLDOWN_SECONDS, Math.max(0, left))
}
