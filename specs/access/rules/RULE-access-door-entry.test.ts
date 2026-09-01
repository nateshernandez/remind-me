import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { decide, parseDecisionTable, representativeInputs } from "@redspec/core"

import { doorEntry, entryCarries } from "@/lib/access/entry"
import type { Entry } from "@/lib/access/entry"
import { doorArrival } from "@/lib/access/routing"

// RULE-access-door-entry: the markdown table is the artifact a reviewer signs;
// this is plumbing.
const table = parseDecisionTable(
  readFileSync(join(import.meta.dirname, "RULE-access-door-entry.md"), "utf8")
)

describe("RULE-access-door-entry", () => {
  it("agrees with the table in every region it distinguishes", () => {
    const regions = representativeInputs(table)
    expect(regions.length).toBeGreaterThan(0)
    for (const input of regions) {
      const from = input.from as Entry
      const row = decide(table, input)!
      expect({
        input,
        arrival: doorEntry(from),
        carries: entryCarries(from),
      }).toEqual({
        input,
        arrival: row.arrival,
        carries: row.carries,
      })
    }
  })

  it("hands RULE-access-door-arrival every arrival it declares", () => {
    // The reason this rule exists. The arrival table was total over five
    // arrivals and three of them had nothing that could produce one, so a
    // slice would have invented the carrier and the invention would have been
    // the contract.
    const arrivals = new Set(table.rules.map((rule) => rule.outputs.arrival))
    expect([...arrivals].sort()).toEqual([
      "cold",
      "expired",
      "signedOut",
      "signup",
      "stuck",
    ])
  })

  it("sends the guard bounce and the sign-out button to different doors", () => {
    // They are not the same moment. Someone deep-linked into the app pressed
    // nothing, so there is nothing to tell them; someone who pressed Sign out
    // is owed the words.
    expect(doorArrival({ arrival: doorEntry("guard"), session: "none" })).toBe(
      "STATE-access-door-empty"
    )
    expect(
      doorArrival({ arrival: doorEntry("signOut"), session: "none" })
    ).toBe("STATE-access-door-signed-out")
  })

  it("is the only entry that carries anything, and it is the one that has to", () => {
    // STATE-access-door-filled's "with the address they already typed still in
    // it" is only possible because this one entry never leaves the document.
    const carrying = (
      [
        "url",
        "guard",
        "signUpRoute",
        "signOut",
        "sessionEnded",
        "codeExpired",
        "attemptStuck",
      ] as Entry[]
    ).filter((from) => entryCarries(from) !== "nothing")
    expect(carrying).toEqual(["codeExpired"])
    expect(
      doorArrival({ arrival: doorEntry("codeExpired"), session: "none" })
    ).toBe("STATE-access-door-filled")
  })
})
