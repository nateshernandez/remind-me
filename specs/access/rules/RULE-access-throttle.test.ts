import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { decide, parseDecisionTable, representativeInputs } from "@redspec/core"

import { THROTTLE_WINDOW_SECONDS, throttle } from "@/lib/access/limits"
import type { ThrottledAction } from "@/lib/access/limits"

// RULE-access-throttle: the markdown table is the artifact a reviewer signs;
// this is plumbing. `redspec check` proves the table total and
// non-overlapping over every count from zero up; this proves the code is it.
const table = parseDecisionTable(
  readFileSync(join(import.meta.dirname, "RULE-access-throttle.md"), "utf8")
)

describe("RULE-access-throttle", () => {
  it("agrees with the table in every region it distinguishes", () => {
    const regions = representativeInputs(table)
    expect(regions.length).toBeGreaterThan(0)
    for (const input of regions) {
      const row = decide(table, input)!
      expect({ input, ...pick(input) }).toEqual({
        input,
        outcome: row.outcome,
        window: Number(row.window),
      })
    }
  })

  // The figures the interview gave, at the boundary each one names. Read from
  // the table rather than retyped, so a row that moves moves this too.
  it("lets the fifth address through and refuses the sixth", () => {
    expect(throttle({ action: "signIn", used: 4 })).toBe("allowed")
    expect(throttle({ action: "signIn", used: 5 })).toBe("refused")
  })

  it("lets the third try through and refuses the fourth", () => {
    expect(throttle({ action: "verify", used: 2 })).toBe("allowed")
    expect(throttle({ action: "verify", used: 3 })).toBe("refused")
  })

  it("allows one code per cooldown", () => {
    expect(throttle({ action: "resend", used: 0 })).toBe("allowed")
    expect(throttle({ action: "resend", used: 1 })).toBe("refused")
  })
})

function pick(input: Record<string, unknown>) {
  const action = input.action as ThrottledAction
  return {
    outcome: throttle({ action, used: input.used as number }),
    window: THROTTLE_WINDOW_SECONDS[action],
  }
}
