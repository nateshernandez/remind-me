import { describe, expect, it } from "vitest"

import {
  INACTIVITY_TIMEOUT_MS,
  SESSION_MAX_LIFETIME_MS,
  SESSION_STATUSES,
  SESSION_TOKEN_LIFETIME_MS,
  type SessionView,
  type SignOut,
} from "./RULE-access-session"

// RULE-access-session is a `type`, so the check is `pnpm typecheck`. The row
// that matters -- `isSignedIn` is `undefined` before Clerk has loaded, not
// `false` -- is enforced by there being no boolean on the type to misread.
describe("RULE-access-session", () => {
  it("has four values, not two", () => {
    // `loading` is the gate that stops a valid session being thrown out for
    // being slow; `unreachable` is a Clerk that cannot be reached, which is not
    // the same fact as a person who is not signed in. Both resolution tables
    // that take a `session` column range over exactly these.
    expect([...SESSION_STATUSES]).toEqual([
      "loading",
      "live",
      "none",
      "unreachable",
    ])

    const loading: SessionView = { status: "loading" }
    // @ts-expect-error there is no boolean to read as "signed out"
    expect(loading.isSignedIn).toBeUndefined()
  })

  it("only carries an address where there is a session to carry it", () => {
    // @ts-expect-error a loading session has no email to render
    const wrong: SessionView = { status: "loading", email: "ada@example.com" }
    expect(wrong.status).toBe("loading")
  })

  it("signs out of one account, because there is only ever one", () => {
    // Multi-session is a Non-goal, and Clerk's escape hatch for it is the
    // `sessionId` argument. This type does not have one to pass.
    const signOut: SignOut = async () => {}
    // @ts-expect-error signOut() is never handed a sessionId
    expect(signOut("sess_123")).toBeInstanceOf(Promise)
  })

  it("lasts seven days, and goes stale for up to a minute", () => {
    expect(SESSION_MAX_LIFETIME_MS).toBe(7 * 24 * 60 * 60 * 1000)
    // One of the two must be on at all times; the 7-day cap is the one we keep.
    expect(INACTIVITY_TIMEOUT_MS).toBeNull()
    // The window in which a screen still says "you are signed in" and is wrong
    // (clerk/javascript#874). That window is STATE-access-app-session-ended.
    expect(SESSION_TOKEN_LIFETIME_MS).toBe(60 * 1000)
  })
})
