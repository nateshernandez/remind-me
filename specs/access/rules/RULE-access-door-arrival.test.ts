import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { decide, parseDecisionTable, representativeInputs } from "@redspec/core"

import { doorArrival } from "@/lib/access/routing"

// RULE-access-door-arrival: the markdown table is the artifact a reviewer signs; this
// is plumbing. The resolver is a switch written from the rule's prose, so this
// is two people writing the same decision down twice and being held to it --
// not a table asserted against itself, which is what the scaffold shipped and
// what `it.todo` was parked on.
const table = parseDecisionTable(
  readFileSync(join(import.meta.dirname, "RULE-access-door-arrival.md"), "utf8")
)

describe("RULE-access-door-arrival", () => {
  it("agrees with the table in every region it distinguishes", () => {
    const regions = representativeInputs(table)
    expect(regions.length).toBeGreaterThan(0)
    for (const input of regions) {
      expect({ input, got: doorArrival(input as never) }).toEqual({
        input,
        got: decide(table, input)!.state,
      })
    }
  })
})
