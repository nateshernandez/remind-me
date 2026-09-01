import { defineCopy } from "@redspec/core"

// Every user-facing string this feature ships, once. Sketches render from it;
// assertions assert against it. A word changes here and both readers see it.
//
// {email} and {seconds} are interpolated. Who substitutes them, what a
// 250-character address does to a sentence, and what shows when a value is
// missing are RULE-access-identity-display's answers, not a comment's.
//
// Seeded by /draft-skeleton from the interview. /render-states is where these
// get read against the screens they land on -- and COPY-access-door-title is
// the one the Brief calls out as most likely to be wrong: it has to greet a
// person who may never have been here and a person who was here last week,
// without asking which.
export const copy = defineCopy({
  // --- the door ---------------------------------------------------------
  "COPY-access-door-title": "Sign in to remind-me",
  "COPY-access-door-subtitle":
    "New here or not, it is the same address and the same code.",
  "COPY-access-door-email-label": "Email address",
  "COPY-access-door-email-placeholder": "you@example.com",
  "COPY-access-door-continue": "Continue",
  "COPY-access-door-google": "Continue with Google",
  "COPY-access-door-divider": "or",
  "COPY-access-door-sending": "Sending your code…",
  "COPY-access-door-leaving-for-google": "Taking you to Google…",
  "COPY-access-door-loading": "Getting ready…",

  // Which of these shows is RULE-access-rejection-copy. The door's other two
  // many-sentence screens -- sending, and unavailable -- are
  // RULE-access-door-sentence's.
  "COPY-access-door-error-format": "That does not look like an email address.",
  "COPY-access-door-error-google":
    "Google could not be reached. You can still continue with a code.",
  "COPY-access-door-error-throttled":
    "Too many tries just now. Wait a moment and try again.",

  "COPY-access-door-blocked-title": "This address cannot be used to sign in",
  "COPY-access-door-blocked-body":
    "Nothing you typed is wrong. Email support@remind-me.app and a person will look at it.",
  "COPY-access-door-unavailable-title": "Sign-in is unavailable",
  // Which of these two the unavailable screen shows is RULE-access-door-sentence.
  // Waiting fixes the first and fixes nothing about the second.
  "COPY-access-door-unavailable-body":
    "This is us, not you. Nothing you type will help right now — try again in a few minutes.",
  "COPY-access-door-stuck-body":
    "This is us, not you. Something on our side would not let that sign-in finish, and waiting will not change it — email support@remind-me.app and a person will look at it.",
  "COPY-access-door-signed-out-title": "You are signed out",
  "COPY-access-door-signed-out-body":
    "This browser no longer has access to your reminders.",
  "COPY-access-door-already-signed-in-title": "You are already signed in",
  "COPY-access-door-already-signed-in-body":
    "You signed in in another tab, so there is nothing to do here.",
  "COPY-access-door-already-signed-in-action": "Go to your reminders",

  // --- the code screen --------------------------------------------------
  "COPY-access-code-title": "Check your email",
  "COPY-access-code-subtitle": "We sent a six-digit code to {email}.",
  "COPY-access-code-label": "Verification code",
  "COPY-access-code-continue": "Continue",
  "COPY-access-code-verifying": "Checking your code…",
  "COPY-access-code-resend": "Send a new code",
  "COPY-access-code-resend-waiting": "You can ask for a new code in {seconds}s",
  "COPY-access-code-wrong":
    "That code is not right. Check the email and try again.",
  "COPY-access-code-expired-title": "That code has expired",
  "COPY-access-code-expired-body":
    "Codes last ten minutes. Start again, and Continue will send a new one.",
  "COPY-access-code-expired-action": "Start again",
  "COPY-access-code-throttled-title": "Too many tries",
  // No number: Clerk does not hand us Retry-After (clerk/javascript#5405).
  "COPY-access-code-throttled-body":
    "Wait a moment before trying this code again.",
  "COPY-access-code-verified": "You are in. Taking you to your reminders…",
  "COPY-access-code-already-signed-in-title": "You signed in in another tab",
  "COPY-access-code-already-signed-in-body": "This code is no longer needed.",
  "COPY-access-code-already-signed-in-action": "Go to your reminders",

  // --- coming back from Google -----------------------------------------
  "COPY-access-callback-working": "Finishing up with Google…",
  "COPY-access-callback-declined-title": "Google sign-in was cancelled",
  "COPY-access-callback-declined-body":
    "Nothing happened. You can try Google again or use a code instead.",
  "COPY-access-callback-declined-action": "Back to sign in",
  "COPY-access-callback-failed-title": "Google could not sign you in",
  "COPY-access-callback-failed-body":
    "This address may already belong to an account that does not use Google. Signing in with a code will get you to it.",
  "COPY-access-callback-failed-action": "Sign in with a code",

  "COPY-access-callback-blocked-title": "This address cannot be used here",
  "COPY-access-callback-blocked-body":
    "Google signed you in, but this address is not one we can accept. Email support@remind-me.app and a person will look at it.",

  // --- the signed-in shell ---------------------------------------------
  "COPY-access-app-loading": "Loading…",
  "COPY-access-app-signed-in": "Signed in as {email}",
  "COPY-access-app-sign-out": "Sign out",
  "COPY-access-app-signing-out": "Signing out…",
  "COPY-access-app-signout-failed": "Sign out did not go through. Try again.",
  "COPY-access-app-session-ended-title": "Your session ended",
  "COPY-access-app-session-ended-body":
    "You were signed out somewhere else. Sign in again to get back to your reminders.",
  "COPY-access-app-session-ended-action": "Sign in",
})
