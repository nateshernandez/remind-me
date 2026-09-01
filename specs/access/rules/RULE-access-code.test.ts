import { describe, expect, it } from "vitest"

import {
  CODE_LENGTH,
  CODE_LIFETIME_MS,
  DEV_INSTANCE_CODE,
  code,
  type CodeAttempt,
  type VerificationCode,
} from "./RULE-access-code"

// RULE-access-code is a `type`, so the check is `pnpm typecheck` and these are
// the assertions it reads. Every `@ts-expect-error` below is a claim that the
// type refuses something; delete a line from the type and the matching
// expectation stops erroring, which is itself a compile error. Vitest runs
// this file too, for the two figures that are values rather than types.
describe("RULE-access-code", () => {
  it("is six digits, and nothing else compiles", () => {
    expect(code("424242")).toBe("424242")

    // @ts-expect-error five digits is not a code
    code("42424")
    // @ts-expect-error seven digits is not a code
    code("4242423")
    // @ts-expect-error letters are not digits
    code("4a4242")
    // @ts-expect-error and neither is an empty string
    code("")
  })

  it("cannot be stood in for by a bare string", () => {
    // Six boxes, not a free-text field: nothing downstream has to re-check,
    // because nothing downstream can be handed anything else.
    // @ts-expect-error a string is not a VerificationCode
    const bare: VerificationCode = "424242"
    expect(bare).toBe("424242")
    expect(CODE_LENGTH).toBe(6)
  })

  it("holds one live code, never two", () => {
    // RULE-access-resend's "a new code kills the old one", written where it
    // cannot be forgotten: `live` is one field, so there is nowhere to put a
    // second code while the first is still good.
    const attempt: CodeAttempt = {
      sentTo: "ada@example.com",
      live: { code: DEV_INSTANCE_CODE, sentAt: 0 },
    }
    expect(attempt.live?.code).toBe("424242")

    // @ts-expect-error there is no list of live codes to push onto
    const two: CodeAttempt = { sentTo: "ada@example.com", live: [] }
    expect(two.live).toEqual([])
  })

  it("is good for ten minutes", () => {
    // Clerk: a code "remains valid for 10 minutes". Past this the attempt is
    // over rather than retryable -- STATE-access-code-expired sends the person
    // back to the door.
    expect(CODE_LIFETIME_MS).toBe(10 * 60 * 1000)
  })

  it("is 424242 on a development instance", () => {
    // What the journey tier types against a `+clerk_test` address.
    expect(DEV_INSTANCE_CODE).toBe("424242")
  })
})
