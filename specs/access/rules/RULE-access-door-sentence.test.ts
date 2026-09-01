import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { decide, parseDecisionTable, representativeInputs } from "@redspec/core"

import { copy } from "@/specs/access/copy"
import { doorSentence } from "@/lib/access/entry"
import type { DoorMoment } from "@/lib/access/entry"

// RULE-access-door-sentence: a resolution table whose two screens each answer
// to more than one moment. Which screen and which sentence are one decision, so
// they are one table.
const table = parseDecisionTable(
  readFileSync(
    join(import.meta.dirname, "RULE-access-door-sentence.md"),
    "utf8"
  )
)

describe("RULE-access-door-sentence", () => {
  it("agrees with the table in every region it distinguishes", () => {
    const regions = representativeInputs(table)
    expect(regions.length).toBeGreaterThan(0)
    for (const input of regions) {
      const row = decide(table, input)!
      expect({ input, got: doorSentence(input.moment as DoorMoment) }).toEqual({
        input,
        got: { state: row.state, copy: row.copy },
      })
    }
  })

  it("names sentences copy.ts actually ships", () => {
    for (const rule of table.rules)
      expect(copy).toHaveProperty(rule.outputs.copy)
  })

  it("gives COPY-access-door-leaving-for-google somewhere to be decided", () => {
    // Before this table it was rendered by a sketch, named by the Brief, and
    // in no rule and no state's digest -- the closest thing in the bundle to a
    // hardcoded string.
    expect(doorSentence("leavingForGoogle").copy).toBe(
      "COPY-access-door-leaving-for-google"
    )
    expect(doorSentence("leavingForGoogle").state).toBe(
      doorSentence("sendingCode").state
    )
  })

  it("does not tell a person to wait for something waiting will not fix", () => {
    // The unavailable screen is reached from two directions that are not the
    // same fact. Only one of them is worth waiting out.
    expect(copy[doorSentence("clerkUnreachable").copy]).toContain("few minutes")
    expect(copy[doorSentence("attemptStuck").copy]).not.toContain("few minutes")
    expect(doorSentence("attemptStuck").state).toBe(
      doorSentence("clerkUnreachable").state
    )
  })
})
