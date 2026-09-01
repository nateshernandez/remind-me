// RULE-access-door-entry and RULE-access-door-sentence, implemented from their
// prose. Both are about the door and neither is about what Clerk said, which is
// why they are not in routing.ts with the four resolution tables.

// --- RULE-access-door-entry -------------------------------------------------

import type { Arrival } from "@/lib/access/routing"

/** Every way of ending up at `/sign-in`. */
export type Entry =
  | "url" // typed, bookmarked, followed from outside
  | "guard" // bounced out of the app with no session
  | "signUpRoute" // the /sign-up redirect
  | "signOut" // the button was pressed
  | "sessionEnded" // the session ended elsewhere and this tab noticed
  | "codeExpired" // handed back off the code screen
  | "attemptStuck" // accepted and cannot complete

/**
 * Which arrival the door is handed. Without this, three of the five arrivals
 * were unreachable as drawn: a plain link to `/sign-in` arrives `cold`.
 */
export function doorEntry(from: Entry): Arrival {
  switch (from) {
    case "url":
    case "guard":
      // Nobody pressed anything, so there is nothing to tell them.
      return "cold"
    case "signUpRoute":
      return "signup"
    case "signOut":
    case "sessionEnded":
      // The session ended either way. Which end of it noticed is not the
      // person's problem, and both land on the same words.
      return "signedOut"
    case "codeExpired":
      return "expired"
    case "attemptStuck":
      return "stuck"
  }
}

/**
 * What the arrival carries with it. The parameter is on the URL because it has
 * to survive a redirect and a reload -- except `expired`, which is a
 * same-document navigation, which is the only reason the address the person
 * already typed is still there to put back in the field.
 */
export function entryCarries(from: Entry): "nothing" | "the address" {
  return from === "codeExpired" ? "the address" : "nothing"
}

// --- RULE-access-door-sentence ----------------------------------------------

/** The moments where one door screen has more than one thing to say. */
export type DoorMoment =
  "sendingCode" | "leavingForGoogle" | "clerkUnreachable" | "attemptStuck"

/** The four sentences those two screens share between them. */
export type DoorSentenceCopy =
  | "COPY-access-door-sending"
  | "COPY-access-door-leaving-for-google"
  | "COPY-access-door-unavailable-body"
  | "COPY-access-door-stuck-body"

export type DoorSentence = {
  state: string
  copy: DoorSentenceCopy
}

/**
 * Which screen, and which of its sentences. Two states here, four moments:
 * `STATE-access-door-sending` is the in-flight row for both ways in, and
 * `STATE-access-door-unavailable` is reached from two directions that are not
 * the same fact.
 */
export function doorSentence(moment: DoorMoment): DoorSentence {
  switch (moment) {
    case "sendingCode":
      return {
        state: "STATE-access-door-sending",
        copy: "COPY-access-door-sending",
      }
    case "leavingForGoogle":
      // The same frozen field and the same replaced button; a different
      // destination and a different promise.
      return {
        state: "STATE-access-door-sending",
        copy: "COPY-access-door-leaving-for-google",
      }
    case "clerkUnreachable":
      // Waiting genuinely helps here, so the words may say so.
      return {
        state: "STATE-access-door-unavailable",
        copy: "COPY-access-door-unavailable-body",
      }
    case "attemptStuck":
      // Nothing about waiting fixes a misconfiguration of our own instance,
      // and their code is already spent.
      return {
        state: "STATE-access-door-unavailable",
        copy: "COPY-access-door-stuck-body",
      }
  }
}
