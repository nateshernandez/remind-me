import { readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { decide, parseDecisionTable, representativeInputs } from "@redspec/core"

// RULE-access-spec-gate: the implementation under test is the real proxy.ts --
// our composition, the package's gate, and the environment wiring between
// them. Nothing here reimplements the decision, because a second copy of a
// 404 is exactly the thing that drifts.
const table = parseDecisionTable(
  readFileSync(join(import.meta.dirname, "RULE-access-spec-gate.md"), "utf8")
)

// `publish` is read when proxy.ts is evaluated, so each row needs a fresh
// module. `session` is never read at all -- which is the row every `-` in that
// column is asserting.
async function ask(env: string, publish: boolean, path: string) {
  vi.stubEnv("NODE_ENV", env)
  vi.stubEnv("REDSPEC_PUBLISH_BOARD", publish ? "1" : "")
  vi.resetModules()
  const { proxy } = await import("@/proxy")
  return proxy(new NextRequest(new URL(path, "https://remind-me.example")))
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("RULE-access-spec-gate", () => {
  it("answers as the table says, in every region it distinguishes", async () => {
    const regions = representativeInputs(table)
    expect(regions.length).toBeGreaterThan(0)
    for (const input of regions) {
      const response = await ask(
        String(input.env),
        input.publish === true,
        "/spec/access"
      )
      const answer = response.status === 404 ? "404" : "pass"
      expect({ input, answer }).toEqual({
        input,
        answer: decide(table, input)!.answer,
      })
    }
  })

  it("closes the whole route, not just its index", async () => {
    for (const path of [
      "/spec",
      "/spec/access",
      "/spec/access/STATE-access-door-empty",
    ]) {
      expect((await ask("production", false, path)).status).toBe(404)
    }
  })

  it("leaves every other route alone", async () => {
    for (const path of ["/", "/sign-in", "/sso-callback", "/specular"]) {
      expect((await ask("production", false, path)).status).not.toBe(404)
    }
  })

  it("terminates rather than delegating, which is the whole of the ordering", async () => {
    // ADR-0006's argument is that the gate must run *before* Clerk: if Clerk
    // sees a /spec request it redirects an unauthenticated one to the sign-in
    // page, and a 307 says the route exists -- a louder disclosure than the one
    // the gate was built to prevent.
    //
    // The `session` column being `-` on every row is that claim, and nothing
    // could check it while proxy.ts held one handler. What is checkable is the
    // property the ordering rests on: when the gate closes, its response ends
    // the chain instead of handing the request on. `x-middleware-next` is how a
    // Next proxy says "carry on", so a closed gate must not set it -- there is
    // no request left for a second handler to see.
    const handedOn = (response: Response) =>
      response.headers.get("x-middleware-next")

    const closed = await ask("production", false, "/spec/access")
    expect(closed.status).toBe(404)
    expect(handedOn(closed), "a closed gate handed the request on").toBeNull()

    const open = await ask("production", true, "/spec/access")
    expect(handedOn(open), "an open gate did not hand the request on").toBe("1")

    const elsewhere = await ask("production", false, "/sign-in")
    expect(
      handedOn(elsewhere),
      "a route the gate does not own was not handed on"
    ).toBe("1")
  })

  it("sends no body with the 404", async () => {
    // The reason the gate exists. A layout-level notFound() sets the status
    // and still streams every unshipped screen into the payload.
    const response = await ask("production", false, "/spec/access")
    expect(await response.text()).toBe("")
  })
})
