# Account access

## Problem

`remind-me` has no accounts. A reminder is only worth setting if it is *yours* — it has to
survive the tab, follow you to your phone, and belong to nobody else. Today there is nothing
to belong to. Until a person can get an account without asking us for one, and get back into
it a week later, there is no product to build reminders on.

## Actors

- **New visitor**: has never had an account here. Wants one in under a minute, without
  inventing a password, and wants to be certain it worked.
- **Returning member**: has an account and is signed out. Wants back in with the least
  ceremony, from whatever device is in front of them.
- **Signed-in member**: is in, and wants out — on a shared or borrowed machine, with the
  confidence that "out" means out.

## What changes

One door at `/sign-in` both creates an account and returns to one, using Google or a
six-digit code emailed to the address typed in. Which of the two happened is decided after
the address is proved theirs, never before. Clerk is the identity provider (ADR-0001); the
screens are ours (ADR-0003), built on Clerk Core 3 (ADR-0004). A signed-in person gets an
app shell with exactly one control on it: sign out.

"Proved theirs" is two things, not one: a verified code, or Google. That asymmetry is why
`COPY-access-callback-failed-body` may name a conflicting account and no screen on the door
may — nobody reaches `/sso-callback` without authenticating as the address's owner, and
anyone can type anyone's address into the door. `INV-access-no-enumeration` carries it as a
row rather than leaving it to whoever writes the next error message.

## Non-goals

- **A separate sign-up page.** With passwordless email and Google the two pages are identical
  markup, and splitting them leaks whether an account exists before verification. ADR-0005.
- **Magic links.** Clerk offers them; they cost three screens the code does not have, and
  they are the strategy Clerk itself discourages testing end-to-end. ADR-0002.
- **Passwords.** No password field, no reset flow, no strength meter. Email and Google only.
- **Multi-factor authentication.** Clerk supports it; nothing here turns it on. `SignIn.status`
  can still come back `needs_second_factor` or `needs_client_trust`, and both are treated as
  `code: stuck` in `RULE-access-code-outcome` — a misconfiguration of our own instance rather
  than something the person did, and never a Google-titled screen, because either can come back
  from the emailed-code path where no Google is involved.
- **Profile and account management.** No name, no avatar, no email change, no account
  deletion, no `<UserButton />`. One sign-out button, per the ask.
- **Organisations, teams, roles, invitations.** Every account is one person.
- **The app itself.** The signed-in shell exists to hold the sign-out button and prove a
  session is real. Reminders are a later feature, which is why `SURFACE-access-app` waives
  the empty row.
- **Multi-session (more than one account signed in at once).** `signOut()` takes a `sessionId`
  for that case; we never pass one.
- **Anything that is not English.** No i18n, and no plural rules to get wrong.

## Deliberate unknowns

- **Whether `auth.protect()` works in a Next 16 `proxy.ts`.** clerk/javascript#8302 says an
  unauthenticated request gets redirected back to the current URL instead of the sign-in
  page, because `NEXT_PUBLIC_CLERK_SIGN_IN_URL` is not visible in the proxy runtime. Open
  against 7.0.8 and 7.0.12; unconfirmed for 7.8.3. If the guess is wrong, `RULE-access-route-guard`
  is still the contract and the fix is an explicit redirect — cheap. If it is silently
  half-wrong, protected routes bounce in a loop, which is why the rule exists.
- **Whether Clerk's code and link toggles can genuinely be co-enabled.** Asserted in Clerk's
  engineering blog, absent from the canonical docs page. It does not block us — we ship the
  code only — but it decides whether ADR-0002 is reversible by a Dashboard switch or by a
  new surface. Cost of being wrong: one afternoon, later.
- **What `verified_switch_tab` actually means.** Clerk lists it as a verification status and
  defines it nowhere. Irrelevant while magic links are off; it becomes a screen the day
  ADR-0002 is revisited.
- **Whether a code has a wrong-attempt lockout separate from the 3-per-10-seconds request
  throttle.** We found the throttle and no attempt counter. `RULE-access-throttle` records
  the figures we have; if a lockout exists, `STATE-access-code-throttled` is the screen it
  lands on and the table gains a row.
- **How long "wait" is on a throttled screen.** Clerk returns `Retry-After` on the 429 and
  the JS SDK does not expose it (clerk/javascript#5405). Until it does,
  `STATE-access-code-throttled` cannot count down and must say so in words.
- **What Clerk's bot protection looks like when it fires.** ADR-0003 accepts that we mount the
  challenge ourselves (`<div id="clerk-captcha" />` on the sign-up side). Clerk's Smart CAPTCHA
  is usually invisible, and no state here declares what a visible challenge renders or where it
  sits. If it turns out to be visible often, it is a state on the door and on the code screen,
  and both surfaces have their twelve rows already spent — which would mean a resolution table,
  not a new row. Cost of being wrong: a real screen appears that nobody has drawn.
- **Whether the door's greeting can serve a new visitor and a returning member at once.**
  This is the one thing ADR-0005 makes harder rather than easier. `COPY-access-door-title`
  is where it gets decided, and it is the copy most likely to be wrong on first draft.

## Three door states carry more than one sentence

Found while rendering the states, settled while implementing the rules, and recorded here
because the twelve rows leave nowhere else to put it. Three of the door's states are one
screen that says one of several things, and which one is a rule's decision rather than a
second state's. `RULE-access-rejection-copy` owns the first; `RULE-access-door-sentence`,
written at /implement-rules, owns the other two.

- **`STATE-access-door-rejected`** is the recoverable-error row for all three causes
  `RULE-access-rejection-copy` lists — a malformed address, Google that would not start,
  and a sixth address inside ten seconds. The case renders the malformed-address wording,
  and `SURFACE-access-door`'s waived `partial` row leans on the Google one.
- **`STATE-access-door-sending`** is the in-flight row for *both* ways in. Pressing
  Continue shows `COPY-access-door-sending`; pressing Continue with Google shows
  `COPY-access-door-leaving-for-google`, and `JOURNEY-access-with-google` walks through
  this same state to get there. The case renders the emailed-code wording, because a case
  is one per state and the fixture has to pick.
- **`STATE-access-door-unavailable`** is the third, and it is the one /render-states had
  not seen. It is reached from two directions that are not the same fact: a Clerk nobody
  can reach, where waiting genuinely helps, and `RULE-access-code-outcome`'s `code: stuck`
  — MFA left on, device trust, or a transfer that failed — where it does not. Telling the
  second one to "try again in a few minutes" is false, so `COPY-access-door-stuck-body`
  exists and `RULE-access-door-sentence` picks between them.

None of the three can become its own state: a surface answers twelve rows and the door has
spent all twelve, which is the same constraint the bot-protection unknown above runs into.
So the choice of sentence belongs to a rule and to the fixture that stands for it.

## What /implement-rules found that rendering had missed

Four things, each recorded where it can now go red rather than here.

- **Nothing produced an `arrival`.** `RULE-access-door-arrival` was total over four
  arrivals and no artifact said what set them, so three of the four were unreachable as
  drawn — a plain link to `/sign-in` arrives `cold`. Worse, `RULE-access-route-guard` and
  `RULE-access-door-arrival` were quietly answering the same moment two different ways.
  `RULE-access-door-entry` is the missing rule and both tables now defer to it.
- **`code: stuck` routed to a screen the door could not reach.** It named
  `STATE-access-door-unavailable`, which `RULE-access-door-arrival` produced only from an
  unreachable Clerk — so the screen would have been re-derived away the moment the person
  landed. The arrival table gained a `stuck` value; see the section above for the sentence.
- **An address containing `$` rewrote the sentence it was substituted into.** The
  substitution used a replacement *string*, in which `$&`, `` $` `` and `$'` are live, and
  `$` is legal in a local part. `RULE-access-identity-display`'s property found it on its
  first run; no listed example was ever going to have one.
- **`COPY-access-code-expired-body` promised something the door does not do.** It said
  "Start again and we will send a fresh one" while `RULE-access-door-arrival` hands the
  person back to `STATE-access-door-filled`, a form they must submit themselves. The copy
  now says what the table does, and that press costs a `signIn` slot in
  `RULE-access-throttle` like any other.

## Open, and deliberately so

- **Both `blocked` screens end.** `STATE-access-door-blocked` replaces the form and
  `STATE-access-callback-blocked` offers nothing, so a refused address is a dead end on
  both. That is a fact about the *address*, not the person, so "try a different one" is
  something the product could offer and currently does not. `JOURNEY-access-with-google`'s
  end justifies not re-offering *Google*; it does not justify offering nothing. Left as it
  is for now, and named here so a slice picks it up deliberately rather than by omission.
- **`COPY-access-code-throttled-body` is worded for one of its two causes.** "Wait a moment
  before trying this code again" is right for a refused `verify` and wrong for a refused
  `resend`, which `RULE-access-throttle` says lands on the same screen when our countdown
  and Clerk's floor drift. One sentence, two causes — a fourth many-sentence state, if it
  turns out to happen.
