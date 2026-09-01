// Fixtures for the cases. Plain data, no network, no database: a case that
// reaches for either is a Journey wearing a State's clothes.

// The address on every screen that is not asking an overflow question.
const EMAIL = "ada@example.com"

// The overflow address. RULE-access-identity-display fixes it at 250
// characters -- long enough to break every layout, short enough to be a real
// address, and inside RFC 5321's 254-character ceiling. The domain is long on
// purpose: the rule keeps the whole of it, so the sentence has to wrap rather
// than scroll the page sideways.
export const LONG_EMAIL =
  "ada.m.lovelace.and.charles.babbage.on.the.difference.engines.and.every.other.machine.that.might.ever.be.built.by.anybody.at.all.in.london.or.elsewhere.entirely.and.without.any.ending.at.all.or.ever@analytical-engine-correspondence-society.example.com"

// A code that reads as a code: not a year, not a run of digits in order.
const CODE = "204815"

// STATE-access-door-empty
export const accessDoorEmpty = { email: "" }

// STATE-access-door-loading
export const accessDoorLoading = { email: "", ready: false }

// STATE-access-door-filled
export const accessDoorFilled = { email: EMAIL }

// STATE-access-door-long-email
export const accessDoorLongEmail = { email: LONG_EMAIL }

// STATE-access-door-rejected
// Three causes land on this one screen and RULE-access-rejection-copy picks
// between them. The fixture carries which, so the sketch never decides.
export const accessDoorRejected = {
  email: "ada@example",
  error: "COPY-access-door-error-format" as const,
}

// STATE-access-door-unavailable
export const accessDoorUnavailable = {}

// STATE-access-door-blocked
export const accessDoorBlocked = {}

// STATE-access-door-sending
export const accessDoorSending = { email: EMAIL, pending: "code" as const }

// STATE-access-door-signed-out
export const accessDoorSignedOut = { email: "" }

// STATE-access-door-already-signed-in
export const accessDoorAlreadySignedIn = {}

// STATE-access-code-empty
// Arriving restarts RULE-access-resend's cooldown, so the control is cooling
// at the full 30 seconds.
export const accessCodeEmpty = { email: EMAIL, digits: "", resendIn: 30 }

// STATE-access-code-partial
export const accessCodePartial = { email: EMAIL, digits: "204", resendIn: 18 }

// STATE-access-code-filled
export const accessCodeFilled = { email: EMAIL, digits: CODE, resendIn: 0 }

// STATE-access-code-long-email
export const accessCodeLongEmail = {
  email: LONG_EMAIL,
  digits: "",
  resendIn: 30,
}

// STATE-access-code-wrong
// The boxes clear, and the cooldown has run out by now: the way forward -- a
// fresh code -- is live rather than counting.
export const accessCodeWrong = {
  email: EMAIL,
  digits: "",
  wrong: true,
  resendIn: 0,
}

// STATE-access-code-expired
export const accessCodeExpired = {}

// STATE-access-code-throttled
export const accessCodeThrottled = { email: EMAIL, digits: CODE }

// STATE-access-code-verifying
export const accessCodeVerifying = { email: EMAIL, digits: CODE }

// STATE-access-code-verified
export const accessCodeVerified = {}

// STATE-access-code-already-signed-in
export const accessCodeAlreadySignedIn = {}

// STATE-access-callback-working
export const accessCallbackWorking = {}

// STATE-access-callback-declined
export const accessCallbackDeclined = {}

// STATE-access-callback-failed
export const accessCallbackFailed = {}

// STATE-access-callback-blocked
export const accessCallbackBlocked = {}

// STATE-access-app-loading
export const accessAppLoading = {}

// STATE-access-app-signed-in
export const accessAppSignedIn = { email: EMAIL }

// STATE-access-app-long-identity
export const accessAppLongIdentity = { email: LONG_EMAIL }

// STATE-access-app-signout-failed
export const accessAppSignoutFailed = { email: EMAIL, failed: true }

// STATE-access-app-session-ended
export const accessAppSessionEnded = { email: EMAIL }

// STATE-access-app-signing-out
export const accessAppSigningOut = { email: EMAIL, pending: true }
