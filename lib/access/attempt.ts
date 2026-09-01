// RULE-access-attempt-lifecycle, implemented.
//
// Deliberately a switch and not a lookup in the rule's table: the whole value
// of the model-based run is that two people wrote the lifecycle down twice and
// a random walk finds where they disagree. Reading the table here would make
// the test agree with itself.

import type {
  Event,
  State,
} from "@/specs/access/rules/RULE-access-attempt-lifecycle"

/**
 * Apply one event to one attempt. `null` means the attempt refuses it: the
 * event cannot happen from here, and nothing moves.
 */
export function advance(state: State, event: Event): State | null {
  // A session appearing in another tab wins wherever an attempt is still
  // running -- STATE-access-door-already-signed-in and
  // STATE-access-code-already-signed-in are the two screens that say so.
  if (
    event === "signedInElsewhere" &&
    (state === "identifying" ||
      state === "finalizing" ||
      state === "awaitingCode")
  ) {
    return "complete"
  }

  // The object is in memory on this client, so a reload is a fresh start at
  // the door. Not from `atGoogle`: that trip rehydrates from Clerk's `Client`.
  if (
    event === "reload" &&
    (state === "identifying" || state === "awaitingCode")
  ) {
    return "none"
  }

  switch (state) {
    case "none":
      if (event === "create") return "identifying"
      if (event === "startGoogle") return "atGoogle"
      if (event === "returnFromGoogle") return "abandoned"
      return null

    case "identifying":
      if (event === "codeSent") return "awaitingCode"
      if (event === "rejected") return "none"
      return null

    case "atGoogle":
      return event === "returnFromGoogle" ? "finalizing" : null

    case "finalizing":
      if (event === "googleLinked") return "complete"
      if (event === "codeSent") return "awaitingCode"
      if (event === "googleUnusable") return "abandoned"
      return null

    case "awaitingCode":
      if (event === "codeAccepted") return "complete"
      if (event === "needsAccount") return "transferring"
      if (event === "codeRejected" || event === "resend") return "awaitingCode"
      if (event === "moreFactorsNeeded") return "stuck"
      if (event === "expire") return "abandoned"
      return null

    case "transferring":
      if (event === "transferred") return "complete"
      if (event === "transferFailed") return "stuck"
      return null

    // An attempt that is over is over. Nothing restarts one.
    case "complete":
    case "stuck":
    case "abandoned":
      return null
  }
}
