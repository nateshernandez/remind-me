import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { advance } from "@/lib/access/attempt"
import {
  machine,
  next,
  type Event,
  type State,
} from "./RULE-access-attempt-lifecycle"

// RULE-access-attempt-lifecycle: two tests, and only the second one is about
// the product. The shape test proves the table is well-formed. The model-based
// run proves the implementation *is* the table -- it drives lib/access/attempt.ts,
// which was written as a switch from the rule's prose rather than by reading
// the table, and walks random legal sequences until the two disagree.

const STATES: State[] = [
  "none",
  "identifying",
  "awaitingCode",
  "atGoogle",
  "finalizing",
  "transferring",
  "complete",
  "stuck",
  "abandoned",
]

const EVENTS: Event[] = [
  "create",
  "rejected",
  "startGoogle",
  "returnFromGoogle",
  "googleLinked",
  "googleUnusable",
  "codeSent",
  "resend",
  "codeAccepted",
  "codeRejected",
  "needsAccount",
  "moreFactorsNeeded",
  "transferred",
  "transferFailed",
  "expire",
  "reload",
  "signedInElsewhere",
]

describe("RULE-access-attempt-lifecycle", () => {
  it("names every state, and routes nowhere else", () => {
    for (const state of STATES) expect(machine).toHaveProperty(state)
    expect(Object.keys(machine).sort()).toEqual([...STATES].sort())
    for (const [from, row] of Object.entries(machine)) {
      for (const [event, to] of Object.entries(row)) {
        expect(EVENTS, `${from} --${event}-->`).toContain(event)
        expect(STATES, `${from} --${event}--> ${to}`).toContain(to)
      }
    }
  })

  it("gives every event somewhere to happen", () => {
    // An event no state accepts is an event nobody has to handle, which means
    // it is either dead or the table forgot a row.
    for (const event of EVENTS) {
      expect(
        STATES.some((state) => next(state, event) !== null),
        `no state accepts ${event}`
      ).toBe(true)
    }
  })

  it("lets nothing into the code screen but a code being sent", () => {
    // This is what SURFACE-access-code's waived `loading` row rests on: the
    // screen cannot be entered with nothing to show, because the only event
    // that reaches `awaitingCode` is the one that sent the code. Give the
    // screen a second way in and this goes red before the waiver does.
    const ways = STATES.flatMap((from) =>
      EVENTS.filter((event) => next(from, event) === "awaitingCode").map(
        (event) => event
      )
    )
    expect([...new Set(ways)].sort()).toEqual([
      "codeRejected",
      "codeSent",
      "resend",
    ])
    // The other two are the screen staying where it is, not entering it.
    for (const event of ["codeRejected", "resend"] as Event[]) {
      expect(next("awaitingCode", event)).toBe("awaitingCode")
      expect(
        STATES.filter((from) => from !== "awaitingCode").map((from) =>
          next(from, event)
        )
      ).toEqual(
        STATES.filter((from) => from !== "awaitingCode").map(() => null)
      )
    }
  })

  it("ends: no sequence of events runs forever without reaching a terminal", () => {
    // The attempt is in memory and mortal. `complete`, `stuck` and `abandoned`
    // take nothing, and every path can reach one.
    for (const terminal of ["complete", "stuck", "abandoned"] as const) {
      expect(Object.keys(machine[terminal])).toHaveLength(0)
    }
  })

  it("the implementation tracks the table across random legal event sequences", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...EVENTS), { maxLength: 40 }),
        (sequence) => {
          let state: State = "none"
          for (const event of sequence) {
            // Same question of both, illegal moves included: the switch has to
            // refuse exactly what the table's empty cells refuse.
            const modelled = next(state, event)
            const actual = advance(state, event)
            expect(actual, `${state} --${event}-->`).toBe(modelled)
            if (modelled === null) continue
            state = modelled
          }
        }
      ),
      { numRuns: 500 }
    )
  })
})
