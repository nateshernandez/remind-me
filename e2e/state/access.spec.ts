import { expect, test, type Page } from "@playwright/test"
import { copy } from "../../specs/access/copy"
import * as fixtures from "../../specs/access/fixtures"

// One behavioural assertion and one screenshot per state, named for its ID,
// written in user intent. `redspec new state <ID>` appends here.
//
// Nothing below names a selector, a class or a coordinate: a slice promotes
// the sketches into components/ and these have to survive it unchanged. What
// they reach for is what a person reaches for -- a label, a button's words,
// a sentence on the screen -- and every one of those words comes from copy.ts.

// The sketch substitutes {email} and {seconds} from its fixture; the assertion
// substitutes the same values into the same constant.
const said = (sentence: string, values: Record<string, string>) =>
  sentence.replace(/\{(\w+)\}/g, (whole, key) => values[key] ?? whole)

// RULE-access-identity-display: a long address may wrap; it may not push the
// screen sideways.
const scrollsSideways = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  )

// Every word the screen says, for the two states that are defined by what they
// must not say.
const everythingSaid = async (page: Page) =>
  (await page.evaluate(() => document.body.innerText))
    .replace(/\s+/g, " ")
    .trim()

const domainOf = (email: string) => email.slice(email.lastIndexOf("@"))
const startOf = (email: string) => email.slice(0, 12)

// --- the door ------------------------------------------------------------

test("STATE-access-door-empty the door greets a new visitor and a returning one with the same words, and offers both ways in without choosing either", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-empty")
  // BRIEF.md: whether one greeting can serve both actors is decided in these
  // two strings. Naming them here is what puts them in this state's digest.
  await expect(page.getByText(copy["COPY-access-door-title"])).toBeVisible()
  await expect(page.getByText(copy["COPY-access-door-subtitle"])).toBeVisible()
  await expect(
    page.getByLabel(copy["COPY-access-door-email-label"])
  ).toHaveValue("")
  await expect(
    page.getByRole("button", {
      name: copy["COPY-access-door-continue"],
      exact: true,
    })
  ).toBeEnabled()
  await expect(
    page.getByRole("button", { name: copy["COPY-access-door-google"] })
  ).toBeEnabled()
  await expect(page).toHaveScreenshot("STATE-access-door-empty.png")
})

test("STATE-access-door-loading there is nothing to press until Clerk has loaded, and the card says so instead of showing dead buttons", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-loading")
  await expect(page.getByText(copy["COPY-access-door-loading"])).toBeVisible()
  await expect(
    page.getByRole("button", {
      name: copy["COPY-access-door-continue"],
      exact: true,
    })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: copy["COPY-access-door-google"] })
  ).toHaveCount(0)
  await expect(page).toHaveScreenshot("STATE-access-door-loading.png")
})

test("STATE-access-door-filled the address they typed is in the field and Continue is ready to take it", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-filled")
  await expect(
    page.getByLabel(copy["COPY-access-door-email-label"])
  ).toHaveValue(fixtures.accessDoorFilled.email)
  await expect(
    page.getByRole("button", {
      name: copy["COPY-access-door-continue"],
      exact: true,
    })
  ).toBeEnabled()
  await expect(page).toHaveScreenshot("STATE-access-door-filled.png")
})

test("STATE-access-door-long-email a 250-character address stays inside the card and never pushes the screen sideways", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-long-email")
  expect(fixtures.accessDoorLongEmail.email).toHaveLength(250)
  await expect(
    page.getByLabel(copy["COPY-access-door-email-label"])
  ).toHaveValue(fixtures.accessDoorLongEmail.email)
  expect(await scrollsSideways(page)).toBe(false)
  await expect(page).toHaveScreenshot("STATE-access-door-long-email.png")
})

test("STATE-access-door-rejected what they typed is still there, one line says what is wrong, and they can try again without retyping it", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-rejected")
  await expect(
    page.getByText(copy["COPY-access-door-error-format"])
  ).toBeVisible()
  await expect(
    page.getByLabel(copy["COPY-access-door-email-label"])
  ).toHaveValue(fixtures.accessDoorRejected.email)
  await expect(
    page.getByRole("button", {
      name: copy["COPY-access-door-continue"],
      exact: true,
    })
  ).toBeEnabled()
  await expect(page).toHaveScreenshot("STATE-access-door-rejected.png")
})

test("STATE-access-door-unavailable the door says the fault is ours and stops asking for an address nothing will be done with", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-unavailable")
  await expect(
    page.getByText(copy["COPY-access-door-unavailable-title"])
  ).toBeVisible()
  await expect(
    page.getByText(copy["COPY-access-door-unavailable-body"])
  ).toBeVisible()
  await expect(
    page.getByLabel(copy["COPY-access-door-email-label"])
  ).toHaveCount(0)
  await expect(page).toHaveScreenshot("STATE-access-door-unavailable.png")
})

test("STATE-access-door-blocked the door names a person to ask and says nothing whatever about whether an account exists", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-blocked")
  expect(await everythingSaid(page)).toBe(
    `${copy["COPY-access-door-blocked-title"]} ${copy["COPY-access-door-blocked-body"]}`
  )
  await expect(page).toHaveScreenshot("STATE-access-door-blocked.png")
})

test("STATE-access-door-sending while the code is going out the address cannot be changed and neither way in can be pressed a second time", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-sending")
  await expect(page.getByText(copy["COPY-access-door-sending"])).toBeVisible()
  await expect(
    page.getByLabel(copy["COPY-access-door-email-label"])
  ).toBeDisabled()
  await expect(
    page.getByRole("button", { name: copy["COPY-access-door-google"] })
  ).toBeDisabled()
  await expect(page).toHaveScreenshot("STATE-access-door-sending.png")
})

test("STATE-access-door-signed-out it says in as many words that they are signed out, and the way back in is right there", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-signed-out")
  await expect(
    page.getByText(copy["COPY-access-door-signed-out-title"])
  ).toBeVisible()
  await expect(
    page.getByLabel(copy["COPY-access-door-email-label"])
  ).toBeEditable()
  await expect(
    page.getByRole("button", {
      name: copy["COPY-access-door-continue"],
      exact: true,
    })
  ).toBeEnabled()
  await expect(page).toHaveScreenshot("STATE-access-door-signed-out.png")
})

test("STATE-access-door-already-signed-in there is nothing to sign into, so the door offers their reminders instead of a form", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-door-already-signed-in")
  await expect(
    page.getByText(copy["COPY-access-door-already-signed-in-title"])
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: copy["COPY-access-door-already-signed-in-action"],
    })
  ).toBeVisible()
  await expect(
    page.getByLabel(copy["COPY-access-door-email-label"])
  ).toHaveCount(0)
  await expect(page).toHaveScreenshot("STATE-access-door-already-signed-in.png")
})

// --- the code screen -----------------------------------------------------

test("STATE-access-code-empty the screen names the address the code went to, and nothing can be submitted until six digits are in", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-empty")
  await expect(
    page.getByText(
      said(copy["COPY-access-code-subtitle"], {
        email: fixtures.accessCodeEmpty.email,
      })
    )
  ).toBeVisible()
  await expect(page.getByLabel(copy["COPY-access-code-label"])).toHaveValue("")
  await expect(
    page.getByRole("button", { name: copy["COPY-access-code-continue"] })
  ).toBeDisabled()
  // RULE-access-resend: arriving restarts the cooldown, so the control counts
  // rather than inviting a request that would be refused.
  await expect(
    page.getByText(
      said(copy["COPY-access-code-resend-waiting"], {
        seconds: String(fixtures.accessCodeEmpty.resendIn),
      })
    )
  ).toBeVisible()
  await expect(page).toHaveScreenshot("STATE-access-code-empty.png")
})

test("STATE-access-code-partial half a code is not a code: three digits of six cannot be submitted", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-partial")
  await expect(page.getByLabel(copy["COPY-access-code-label"])).toHaveValue(
    fixtures.accessCodePartial.digits
  )
  await expect(
    page.getByRole("button", { name: copy["COPY-access-code-continue"] })
  ).toBeDisabled()
  await expect(page).toHaveScreenshot("STATE-access-code-partial.png")
})

test("STATE-access-code-filled with all six digits in, Continue is ready to take them", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-filled")
  await expect(page.getByLabel(copy["COPY-access-code-label"])).toHaveValue(
    fixtures.accessCodeFilled.digits
  )
  await expect(
    page.getByRole("button", { name: copy["COPY-access-code-continue"] })
  ).toBeEnabled()
  await expect(page).toHaveScreenshot("STATE-access-code-filled.png")
})

test("STATE-access-code-long-email a 250-character address is shortened so the domain still reads, and the sentence wraps rather than pushing the screen sideways", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-long-email")
  const sentTo = fixtures.accessCodeLongEmail.email
  expect(sentTo).toHaveLength(250)
  const onScreen = await everythingSaid(page)
  // RULE-access-identity-display: the start of the local part and the whole
  // domain survive; the address itself never reaches the screen entire.
  expect(onScreen).toContain(startOf(sentTo))
  expect(onScreen).toContain(domainOf(sentTo))
  expect(onScreen).not.toContain(sentTo)
  expect(await scrollsSideways(page)).toBe(false)
  await expect(page).toHaveScreenshot("STATE-access-code-long-email.png")
})

test("STATE-access-code-wrong the boxes are cleared, one line says that code is not right, and a fresh code can be asked for", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-wrong")
  await expect(page.getByText(copy["COPY-access-code-wrong"])).toBeVisible()
  await expect(page.getByLabel(copy["COPY-access-code-label"])).toHaveValue("")
  await expect(
    page.getByRole("button", { name: copy["COPY-access-code-resend"] })
  ).toBeEnabled()
  await expect(page).toHaveScreenshot("STATE-access-code-wrong.png")
})

test("STATE-access-code-expired the code that aged out is gone from the screen and the only thing left to do is start again", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-expired")
  await expect(
    page.getByText(copy["COPY-access-code-expired-title"])
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: copy["COPY-access-code-expired-action"] })
  ).toBeEnabled()
  await expect(page.getByLabel(copy["COPY-access-code-label"])).toHaveCount(0)
  await expect(page).toHaveScreenshot("STATE-access-code-expired.png")
})

test("STATE-access-code-throttled it says to wait, gives no number to count down, and offers nothing that would only be refused", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-throttled")
  await expect(
    page.getByText(copy["COPY-access-code-throttled-title"])
  ).toBeVisible()
  expect(copy["COPY-access-code-throttled-body"]).not.toMatch(/\d/)
  await expect(
    page.getByRole("button", { name: copy["COPY-access-code-continue"] })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: copy["COPY-access-code-resend"] })
  ).toHaveCount(0)
  await expect(page).toHaveScreenshot("STATE-access-code-throttled.png")
})

test("STATE-access-code-verifying while the code is being checked the digits stay on screen and it cannot be submitted twice", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-verifying")
  await expect(page.getByText(copy["COPY-access-code-verifying"])).toBeVisible()
  await expect(page.getByLabel(copy["COPY-access-code-label"])).toHaveValue(
    fixtures.accessCodeVerifying.digits
  )
  await expect(
    page.getByRole("button", { name: copy["COPY-access-code-verifying"] })
  ).toBeDisabled()
  await expect(page).toHaveScreenshot("STATE-access-code-verifying.png")
})

test("STATE-access-code-verified it says they are in and asks nothing more of them", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-verified")
  await expect(page.getByText(copy["COPY-access-code-verified"])).toBeVisible()
  await expect(
    page.getByRole("button", { name: copy["COPY-access-code-continue"] })
  ).toHaveCount(0)
  await expect(page.getByLabel(copy["COPY-access-code-label"])).toHaveCount(0)
  await expect(page).toHaveScreenshot("STATE-access-code-verified.png")
})

test("STATE-access-code-already-signed-in the code is not needed any more, so the screen offers their reminders instead of the boxes", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-code-already-signed-in")
  await expect(
    page.getByText(copy["COPY-access-code-already-signed-in-title"])
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: copy["COPY-access-code-already-signed-in-action"],
    })
  ).toBeVisible()
  await expect(page.getByLabel(copy["COPY-access-code-label"])).toHaveCount(0)
  await expect(page).toHaveScreenshot("STATE-access-code-already-signed-in.png")
})

// --- coming back from Google ---------------------------------------------

test("STATE-access-callback-working the page says what is being finished while the redirect resolves, rather than sitting blank", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-callback-working")
  // Three of this surface's waivers rest on there being one line and a spinner
  // here and nothing else, so the assertion has to read the whole page.
  expect(await everythingSaid(page)).toBe(copy["COPY-access-callback-working"])
  await expect(page).toHaveScreenshot("STATE-access-callback-working.png")
})

test("STATE-access-callback-declined it says nothing happened, and the way back to the door is the thing to press", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-callback-declined")
  await expect(
    page.getByText(copy["COPY-access-callback-declined-title"])
  ).toBeVisible()
  await expect(
    page.getByText(copy["COPY-access-callback-declined-body"])
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: copy["COPY-access-callback-declined-action"],
    })
  ).toBeVisible()
  await expect(page).toHaveScreenshot("STATE-access-callback-declined.png")
})

test("STATE-access-callback-failed Google did not work, so the screen offers the code instead of asking them to try Google again", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-callback-failed")
  await expect(
    page.getByText(copy["COPY-access-callback-failed-title"])
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: copy["COPY-access-callback-failed-action"] })
  ).toBeVisible()
  await expect(page).toHaveScreenshot("STATE-access-callback-failed.png")
})

test("STATE-access-callback-blocked Google has already accepted them and this screen still names only a person to ask, never whether an account exists", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-callback-blocked")
  expect(await everythingSaid(page)).toBe(
    `${copy["COPY-access-callback-blocked-title"]} ${copy["COPY-access-callback-blocked-body"]}`
  )
  await expect(page).toHaveScreenshot("STATE-access-callback-blocked.png")
})

// --- the signed-in shell -------------------------------------------------

test("STATE-access-app-loading the shell is drawn with the address still to come, and sign out cannot be pressed before the session is known", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-app-loading")
  await expect(page.getByText(copy["COPY-access-app-loading"])).toBeVisible()
  await expect(
    page.getByRole("button", { name: copy["COPY-access-app-sign-out"] })
  ).toBeDisabled()
  await expect(page).toHaveScreenshot("STATE-access-app-loading.png")
})

test("STATE-access-app-signed-in the shell names the address they are signed in as, and offers exactly one control", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-app-signed-in")
  // BRIEF.md: "exactly one control on it: sign out". A shell that grew an
  // avatar menu or a settings link would pass a toBeVisible and fail this.
  expect(await everythingSaid(page)).toBe(
    `${said(copy["COPY-access-app-signed-in"], {
      email: fixtures.accessAppSignedIn.email,
    })} ${copy["COPY-access-app-sign-out"]}`
  )
  await expect(
    page.getByRole("button", { name: copy["COPY-access-app-sign-out"] })
  ).toBeEnabled()
  await expect(page).toHaveScreenshot("STATE-access-app-signed-in.png")
})

test("STATE-access-app-long-identity a 250-character address keeps its domain readable and leaves sign out where it was", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-app-long-identity")
  const signedInAs = fixtures.accessAppLongIdentity.email
  expect(signedInAs).toHaveLength(250)
  const onShell = await everythingSaid(page)
  expect(onShell).toContain(startOf(signedInAs))
  expect(onShell).toContain(domainOf(signedInAs))
  expect(onShell).not.toContain(signedInAs)
  await expect(
    page.getByRole("button", { name: copy["COPY-access-app-sign-out"] })
  ).toBeInViewport()
  expect(await scrollsSideways(page)).toBe(false)
  await expect(page).toHaveScreenshot("STATE-access-app-long-identity.png")
})

test("STATE-access-app-signout-failed they are still signed in, told the sign out did not go through, and can press it again", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-app-signout-failed")
  await expect(
    page.getByText(copy["COPY-access-app-signout-failed"])
  ).toBeVisible()
  await expect(
    page.getByText(
      said(copy["COPY-access-app-signed-in"], {
        email: fixtures.accessAppSignoutFailed.email,
      })
    )
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: copy["COPY-access-app-sign-out"] })
  ).toBeEnabled()
  await expect(page).toHaveScreenshot("STATE-access-app-signout-failed.png")
})

test("STATE-access-app-session-ended the session is over, and signing in again is the only thing on the screen that can be pressed", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-app-session-ended")
  await expect(
    page.getByText(copy["COPY-access-app-session-ended-title"])
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: copy["COPY-access-app-session-ended-action"],
    })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: copy["COPY-access-app-sign-out"] })
  ).toBeDisabled()
  await expect(page).toHaveScreenshot("STATE-access-app-session-ended.png")
})

test("STATE-access-app-signing-out while the session is ending, sign out cannot be pressed a second time", async ({
  page,
}) => {
  await page.goto("/spec/access/STATE-access-app-signing-out")
  await expect(
    page.getByText(copy["COPY-access-app-signing-out"])
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: copy["COPY-access-app-signing-out"] })
  ).toBeDisabled()
  await expect(page).toHaveScreenshot("STATE-access-app-signing-out.png")
})
