import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { copy } from "@/specs/access/copy"
import { doorSubmit } from "@/lib/access/door"
import type { Identifier } from "@/lib/access/door"

// INV-access-no-enumeration: the property ADR-0005 exists to buy, and the
// reason the door is one screen rather than two. It holds across all addresses
// rather than at listed points, so it is an invariant rather than a table.

/** Addresses, including the shapes someone would reach for to tell them apart. */
const address = fc.oneof(
  fc.emailAddress(),
  fc.constantFrom(
    "ada@example.com",
    "ada+clerk_test@example.com",
    "ADA@EXAMPLE.COM",
    "ada@localhost",
    "a@b.co"
  )
)

/** The three the person may not be able to tell apart. */
const indistinguishable: Identifier[] = ["exists", "missing", "locked"]

describe("INV-access-no-enumeration", () => {
  it("says the same thing whether or not an account is behind the address", () => {
    fc.assert(
      fc.property(address, (typed) => {
        const answers = indistinguishable.map((behind) =>
          doorSubmit(typed, behind)
        )
        // Not "the same screen with different words" -- the same object.
        // Identical copy, identical controls, and a code sent either way.
        for (const answer of answers) expect(answer).toEqual(answers[0])
        expect(answers[0].state).toBe("STATE-access-code-empty")
      })
    )
  })

  it("does not special-case a locked account, which is the tempting one", () => {
    fc.assert(
      fc.property(address, (typed) => {
        // A locked account is an account. Refusing at the door says so, and
        // whatever the lock means happens after verification.
        expect(doorSubmit(typed, "locked")).toEqual(
          doorSubmit(typed, "missing")
        )
      })
    )
  })

  it("refuses a blocklisted address the same way whoever is behind it", () => {
    fc.assert(
      fc.property(address, (typed) => {
        // The single permitted difference before verification, and it is
        // permitted because it is a fact about the address: a never-seen
        // address on the blocklist is refused identically.
        expect(doorSubmit(typed, "refused").state).toBe(
          "STATE-access-door-blocked"
        )
      })
    )
  })

  it("reaches exactly two screens before a code is verified", () => {
    const reached = new Set(
      (["exists", "missing", "locked", "refused"] as Identifier[]).map(
        (behind) => doorSubmit("ada@example.com", behind).state
      )
    )
    expect([...reached].sort()).toEqual([
      "STATE-access-code-empty",
      "STATE-access-door-blocked",
    ])
  })

  it("never names the error Clerk's own docs warn about, anywhere the slice can write", () => {
    // "Reveals account existence before verification." If that code path ever
    // appears, this rule is red at the point the pivot is written rather than
    // the day someone notices the leak.
    //
    // Every source file, not one: the pivot will be written where the
    // `useSignIn()` call lives, and today that file does not exist yet. This
    // walks `lib/` and `app/` so it is already watching the place the slice
    // will put it.
    const root = join(import.meta.dirname, "..", "..", "..")
    const sources: string[] = []
    const walk = (dir: string) => {
      if (!existsSync(dir)) return
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name)
        if (entry.isDirectory()) walk(path)
        else if (/\.tsx?$/.test(entry.name)) sources.push(path)
      }
    }
    walk(join(root, "lib"))
    walk(join(root, "app"))
    expect(sources.length).toBeGreaterThan(0)
    for (const path of sources) {
      expect(readFileSync(path, "utf8"), path).not.toContain(
        "form_identifier_not_found"
      )
    }
  })

  it("never says the word on a screen reached before the address is proved theirs", () => {
    // The leak would arrive as a sentence, not as a branch. Every word the
    // door and the code screen can say has to be sayable to someone who has
    // typed an address that is not theirs -- so none of them may mention an
    // account.
    for (const [id, sentence] of Object.entries(copy)) {
      if (
        !id.startsWith("COPY-access-door-") &&
        !id.startsWith("COPY-access-code-")
      ) {
        continue
      }
      expect(sentence.toLowerCase(), id).not.toContain("account")
    }
  })

  it("lets the Google callback say it, because there is nothing left to enumerate", () => {
    // The one screen that names a conflicting account out loud. Nobody reaches
    // /sso-callback without authenticating as the address's owner, so this is
    // the product telling a person about their own address. The scope row in
    // INV-access-no-enumeration.md is this asymmetry written down.
    expect(copy["COPY-access-callback-failed-body"].toLowerCase()).toContain(
      "account"
    )
  })
})
