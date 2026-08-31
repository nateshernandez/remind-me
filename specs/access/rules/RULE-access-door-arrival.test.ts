import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { parseDecisionTable, representativeInputs } from "@redspec/core"

// RULE-access-door-arrival: the markdown table is the artifact a reviewer signs; this is plumbing.
const table = parseDecisionTable(readFileSync(join(import.meta.dirname, "RULE-access-door-arrival.md"), "utf8"))

describe("RULE-access-door-arrival", () => {
  // The scaffold shipped `implementation = (i) => decide(table, i)` asserted
  // against `decide(table, i)`: green for every possible product, red for none.
  // /implement-rules imports the real resolver here. Until it does, this is a
  // todo rather than a pass, because a green that cannot fail reads as done.
  it.todo("agrees with the table in every region it distinguishes")

  it("parses, so `redspec check` can prove it total", () => {
    expect(table.rules.length).toBeGreaterThan(0)
    expect(representativeInputs(table).length).toBeGreaterThan(0)
  })
})
