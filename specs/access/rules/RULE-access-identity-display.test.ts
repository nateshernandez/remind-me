import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { copy } from "@/specs/access/copy"
import { LONG_EMAIL } from "@/specs/access/fixtures"
import {
  identitySentence,
  shorten,
  withinRfcLimit,
} from "@/lib/access/identity"
import {
  KEEP_LOCAL_CHARS,
  MAX_EMAIL_LENGTH,
  OVERFLOW_EMAIL_LENGTH,
} from "./RULE-access-identity-display"

// RULE-access-identity-display: how an address gets into a sentence, and what
// happens when it is too long for one. An invariant rather than a table,
// because the rule holds across every address rather than at listed points --
// and the two overflow states are the only place it is visible, so a property
// is the only thing that would notice it breaking anywhere else.
//
// The function under test is the one the sketches render with. That is the
// point of it living in lib/access rather than in sketches.tsx: a slice that
// promotes a sketch to a real component changes an import, and this test does
// not move.

const address = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 200 }).filter((s) => !s.includes("@")),
    fc.string({ minLength: 1, maxLength: 60 }).filter((s) => !s.includes("@"))
  )
  .map(([local, domain]) => `${local}@${domain}`)

describe("RULE-access-identity-display", () => {
  it("keeps the whole domain, whatever it costs the local part", () => {
    fc.assert(
      fc.property(address, (email) => {
        // The domain is what someone checks to see if they typed the wrong
        // account. Truncating from the end hides exactly the part that matters.
        const domain = email.slice(email.lastIndexOf("@"))
        expect(shorten(email).endsWith(domain)).toBe(true)
      })
    )
  })

  it("keeps the start of the local part, so the account is still recognisable", () => {
    fc.assert(
      fc.property(address, (email) => {
        const at = email.lastIndexOf("@")
        const head = email.slice(0, Math.min(KEEP_LOCAL_CHARS, at))
        expect(shorten(email).startsWith(head)).toBe(true)
      })
    )
  })

  it("never makes a sentence longer than the address it was given", () => {
    fc.assert(
      fc.property(address, (email) => {
        expect(shorten(email).length).toBeLessThanOrEqual(email.length)
      })
    )
  })

  it("leaves an address that already fits exactly as it was typed", () => {
    fc.assert(
      fc.property(address, (email) => {
        if (email.lastIndexOf("@") <= KEEP_LOCAL_CHARS) {
          expect(shorten(email)).toBe(email)
        }
      })
    )
  })

  it("renders no sentence at all when there is no address", () => {
    // "We sent a code to" and then nothing is worse than not claiming it.
    for (const missing of [null, undefined, ""]) {
      expect(
        identitySentence(copy["COPY-access-code-subtitle"], missing)
      ).toBeNull()
      expect(
        identitySentence(copy["COPY-access-app-signed-in"], missing)
      ).toBeNull()
    }
  })

  it("substitutes {email} and leaves nothing behind", () => {
    fc.assert(
      fc.property(address, (email) => {
        const sentence = identitySentence(
          copy["COPY-access-code-subtitle"],
          email
        )!
        expect(sentence).not.toContain("{email}")
        expect(sentence).toContain(shorten(email))
      })
    )
  })

  it("holds the overflow fixture to the length the rule fixed it at", () => {
    // Long enough to break every layout, short enough to be a real address.
    expect(LONG_EMAIL).toHaveLength(OVERFLOW_EMAIL_LENGTH)
    expect(withinRfcLimit(LONG_EMAIL)).toBe(true)
    expect(MAX_EMAIL_LENGTH).toBe(254)
  })

  it("shortens the overflow fixture rather than passing it through", () => {
    // If this stopped being true, STATE-access-code-long-email and
    // STATE-access-app-long-identity would be drawing an ordinary address and
    // nobody would learn anything from either screenshot.
    const shortened = shorten(LONG_EMAIL)
    expect(shortened.length).toBeLessThan(LONG_EMAIL.length)
    expect(shortened).toContain("…")
    expect(
      shortened.endsWith(LONG_EMAIL.slice(LONG_EMAIL.lastIndexOf("@")))
    ).toBe(true)
  })
})
