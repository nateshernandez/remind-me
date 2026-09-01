import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { decide, parseDecisionTable, representativeInputs } from "@redspec/core"

import { copy } from "@/specs/access/copy"
import {
  RESEND_COOLDOWN_SECONDS,
  resendControl,
  resendSecondsLeft,
} from "@/lib/access/limits"
import type { ResendStage } from "@/lib/access/limits"

// RULE-access-resend: what the control looks like with `secondsLeft` of its
// own cooldown to run.
const table = parseDecisionTable(
  readFileSync(join(import.meta.dirname, "RULE-access-resend.md"), "utf8")
)

describe("RULE-access-resend", () => {
  it("agrees with the table in every region it distinguishes", () => {
    const regions = representativeInputs(table)
    expect(regions.length).toBeGreaterThan(0)
    for (const input of regions) {
      const row = decide(table, input)!
      const got = resendControl({
        stage: input.stage as ResendStage,
        secondsLeft: input.secondsLeft as number,
      })
      expect({ input, got }).toEqual({
        input,
        got: {
          appearance: row.appearance,
          copy: row.copy === "none" ? null : row.copy,
        },
      })
    }
  })

  it("does not linger at zero", () => {
    expect(resendControl({ stage: "waiting", secondsLeft: 1 }).appearance).toBe(
      "cooling"
    )
    expect(resendControl({ stage: "waiting", secondsLeft: 0 })).toEqual({
      appearance: "live",
      copy: "COPY-access-code-resend",
    })
  })

  it("is gone, not greyed, on a screen that is not asking for a code", () => {
    // The third appearance was already in the sketch and in no rule, which is
    // the kind of thing a slice inherits without knowing it decided anything.
    for (const secondsLeft of [0, 15, RESEND_COOLDOWN_SECONDS]) {
      expect(resendControl({ stage: "busy", secondsLeft })).toEqual({
        appearance: "absent",
        copy: null,
      })
    }
  })

  it("counts from when the code was sent, and never outside the window", () => {
    // A screen entered from the Google callback draws with part of the window
    // already spent, because the callback sends the code before the screen
    // changes. That is not a gap in the table -- it is what the clamp is for.
    expect(resendSecondsLeft(0, 0)).toBe(RESEND_COOLDOWN_SECONDS)
    expect(resendSecondsLeft(12_000, 0)).toBe(18)
    expect(resendSecondsLeft(45_000, 0)).toBe(0)
    // A clock that jumped backwards must not hand the table a number it never
    // declared a domain for.
    expect(resendSecondsLeft(-90_000, 0)).toBe(RESEND_COOLDOWN_SECONDS)
  })

  it("counts from Clerk's thirty-second floor, and says a number while it does", () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(30)
    // The countdown is ours, so it may show a number. STATE-access-code-throttled
    // is Clerk's wait and may not: clerk/javascript#5405.
    const cooling = resendControl({
      stage: "waiting",
      secondsLeft: RESEND_COOLDOWN_SECONDS,
    })
    expect(copy[cooling.copy!]).toContain("{seconds}")
    expect(copy["COPY-access-code-throttled-body"]).not.toMatch(/\d/)
  })
})
