# Step 3 — after `/implement-rules`

The eleven rules the skeleton declared were sentences in a table with a
**Status: stub** line under them. They are now fifteen rules, each on a rung
that can fail, each with an implementation behind it, and each one **watched
going red** before being called done.

**Look at:** [`/spec/access`](/spec/access), then the rules in
[`specs/access/rules/`](https://github.com/nateshernandez/remind-me/tree/step-3-implement-rules/specs/access/rules).

## The ladder, and what each rule landed on

Take the first rung that can falsify the rule. Rungs 2 and 3 are the two a
non-engineer reviews, so the rules the business owns are meant to end up there.

| Rung | Rules |
| ---- | ----- |
| **1 · type** | `RULE-access-session`, `RULE-access-code` |
| **2 · machine** | `RULE-access-attempt-lifecycle` |
| **3 · table** | `RULE-access-door-arrival`, `RULE-access-door-entry`, `RULE-access-door-sentence`, `RULE-access-route-guard`, `RULE-access-code-outcome`, `RULE-access-callback-outcome`, `RULE-access-throttle`, `RULE-access-rejection-copy`, `RULE-access-resend`, `RULE-access-spec-gate` |
| **4 · invariant** | `INV-access-no-enumeration`, `RULE-access-identity-display` |

Two rules are types because the thing that goes wrong can be made
unrepresentable instead. `code("42424")` does not compile; a `CodeAttempt` holds
one `live` code and not a list, so "a new code kills the old one" has nowhere to
be forgotten; `SessionView` has four values and no `isSignedIn` boolean for
anyone to read as "signed out" while Clerk is still loading. `pnpm typecheck` is
their gate, which is why it is now a line in CI.

## Two expressions of every decision, not one

The four resolution tables shipped in step 1 with a test that asserted
`decide(table, i)` against `decide(table, i)` — green for every possible product,
red for none, and parked on `it.todo` so it did not read as done. Each now has a
hand-written resolver in [`lib/access/`](https://github.com/nateshernandez/remind-me/tree/step-3-implement-rules/lib/access),
written from the rule's prose rather than from its markdown, and the test walks
`representativeInputs` and holds the two against each other in every region the
table distinguishes. The machine works the same way: the table is the artifact,
`advance()` is a switch, and a `fast-check` model run walks random event
sequences asking both the same question — illegal moves included, because the
switch has to refuse exactly what the table's empty cells refuse.

## Every rule was watched going red

Thirteen rules, thirteen deliberate breakages, thirteen reds, then restored. A
rule never observed red is a rule you are guessing about. A sample:

| Broke | Went red as |
| ----- | ----------- |
| `code()` stopped demanding six digits | `tsc`: **unused `@ts-expect-error` directive** |
| a `loading` session gained an `isSignedIn` | `tsc`: TS2322 |
| reload stopped ending a code-screen attempt | property failed after 100 runs |
| a locked account got its own screen | property failed after 1 run |
| the middle-ellipsis truncated from the end | the domain was gone |
| `proxy.ts` published unconditionally | region disagreement |
| a second event reached `awaitingCode` | the code screen's waiver lost its witness |

## What the gate says here

```
$ pnpm spec
53 orphan
```

Fifty-three, and every one of them an `orphan`. No `table-gap`, no
`table-overlap`, no `table-parse`, no `unknown-state-outcome` — the tables are
proved total and non-overlapping over their declared domains before a row runs.
Step 2 reported 50; the four new artifacts are the two rules this step found
missing, plus the one it split out, plus one new `COPY-`. They stay red until
`/cut-slices` gives each a slice that says it will build it.

`pnpm test` is 58 assertions across 15 files, all passing. `pnpm test:state` is
still 30 and 30. `pnpm test:journey` still holds 16 generated paths, all `fixme`.

## What implementing found that declaring and drawing had missed

This is the step working. Four of these were invisible to `redspec check` and
would have been invented by whoever built the slice.

- **Nothing produced an `arrival`.** `RULE-access-door-arrival` was total over
  four arrivals and no artifact said what set them — so three of the four were
  unreachable as drawn, because a plain link to `/sign-in` arrives `cold`. Worse,
  `RULE-access-route-guard` and `RULE-access-door-arrival` were quietly answering
  the same moment two different ways. **`RULE-access-door-entry`** is the rule
  that was missing.
- **`code: stuck` routed to a screen the door could not reach.** It named
  `STATE-access-door-unavailable`, which the arrival table produced only from an
  unreachable Clerk — so the screen would have been re-derived away the instant
  the person landed on it. And its copy said "try again in a few minutes", which
  is false for a misconfiguration of our own instance. **`RULE-access-door-sentence`**
  now picks between the two sentences that screen owes, and picks
  `STATE-access-door-sending`'s two as well — which `BRIEF.md` had explicitly
  promised this step would land, and which left
  `COPY-access-door-leaving-for-google` rendered by a sketch and named by no rule.
- **An address containing `$` rewrote the sentence it went into.** The
  substitution used `String.replace` with a replacement *string*, in which `$&`,
  `` $` `` and `$'` are live — and `$` is legal in an email local part.
  `RULE-access-identity-display`'s property found it on its first run. No listed
  example was ever going to have a `$` in it, which is the entire argument for
  the rung.
- **A waiver whose own witness disproved it.** `SURFACE-access-code` waived its
  `loading` row on "only ever reached from the door in the same client session",
  witnessed by `RULE-access-attempt-lifecycle` — while that same rule, and
  `RULE-access-callback-outcome`, both say the Google callback reaches it too.
  The reason is corrected, and the witness can now actually go red: `codeSent` is
  the only event in the machine that enters `awaitingCode`.

`RULE-access-code` was also **split**. Its own note said the five-sign-ins-per-ten-seconds
figure is "hit from the door, not the code screen" while sitting in a rule about
the code screen, so the three rate limits left for **`RULE-access-throttle`**.
The figures are the interview's and did not move; what moved is which rule owns
them. And `RULE-access-spec-gate` is an **amendment**: it said "in production,
404", which is the default and is not the contract here — this repo declares
`publicBoard: true` and the board *is* the product, so the input is the publish
flag and the rule now says what the deployed demo does.

Two things outside `specs/` were broken and are fixed: CI ran
`pnpm exec redspec check` without `JITI_TSCONFIG_PATHS=1`, which dies on
`Cannot find module '@/components/ui/alert'` — the exact trap `CLAUDE.md` warns
about, meaning the gate could not have run on a pull request. The README told
you to run it the same way.

---

Next: **step 4 — `/cut-slices`**, where the 53 orphans get slices that claim
them, and `orphan` finally starts coming down.
