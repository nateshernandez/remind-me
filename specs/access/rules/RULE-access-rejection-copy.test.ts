import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { decide, parseDecisionTable, representativeInputs } from "@redspec/core"

import { copy } from "@/specs/access/copy"
import { rejectionCopy } from "@/lib/access/door"
import type { RejectionCause } from "@/lib/access/door"

// RULE-access-rejection-copy: the outcome column is a COPY- id rather than a
// state, so this is a plain decision table. Two checks: the resolver picks the
// sentence the table picks, and the sentence exists.
const table = parseDecisionTable(
  readFileSync(
    join(import.meta.dirname, "RULE-access-rejection-copy.md"),
    "utf8"
  )
)

describe("RULE-access-rejection-copy", () => {
  it("agrees with the table in every region it distinguishes", () => {
    const regions = representativeInputs(table)
    expect(regions.length).toBeGreaterThan(0)
    for (const input of regions) {
      expect({
        input,
        got: rejectionCopy(input.cause as RejectionCause),
      }).toEqual({
        input,
        got: decide(table, input)!.copy,
      })
    }
  })

  it("names a sentence copy.ts actually ships", () => {
    for (const rule of table.rules) {
      expect(copy).toHaveProperty(rule.outputs.copy)
    }
  })

  it("never sends the Google failure out reading like a bad address", () => {
    // The one row whose wording carries the requirement: the email route still
    // works, and the sentence has to say so.
    expect(copy[rejectionCopy("google")]).toContain("code")
  })
})
