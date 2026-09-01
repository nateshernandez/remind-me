# Step 2 — after `/render-states`

Every state the skeleton declared now **draws**. Thirty sketches, thirty
fixtures, thirty screenshot tests — and the board has stopped being a list of
promises and started being a set of screens you can open one at a time.

**Look at:** [`/spec/access`](/spec/access), and then any single state, e.g.
[`/spec/access/STATE-access-door-empty`](/spec/access/STATE-access-door-empty).

Those per-state URLs 404'd in step 1. They resolve now, and each renders one
state alone — which is also the URL its screenshot test drives. A URL, a test
name, and (soon) a slice's claim are the same string.

**What the gate says here:**

```
$ pnpm spec
50 orphan
```

Compare with step 1, which reported `30 declared-not-rendered` on top of the
same 50:

- `declared-not-rendered` — **gone, all thirty.** That is exactly what this step
  is for. Every state in the registry now has a case that draws it.
- `orphan` — **unchanged, all fifty**, because this step claimed nothing. They
  are 30 states, 11 rules, 4 surfaces, 4 journeys and 1 invariant, and they stay
  red until `/cut-slices` gives each one a slice that says it will build it.

Red here is not breakage. Rendering a state proves the screen exists; it does
not promise anyone is shipping it. Those are different claims, and the gate
keeps them apart on purpose.

**What the tests do.** `pnpm test:state` runs 30 assertions and 30 screenshots,
all passing. Nothing in them names a selector, a class or a coordinate — they
reach for what a person reaches for, a label, a button's words, a sentence on
screen, and every one of those words is read from `copy.ts` rather than retyped.
That is what lets a later slice promote a sketch into a real component without
rewriting a single test. `pnpm test:journey` holds 16 generated paths, all still
`fixme`; a journey goes live with the slice that claims it.

**What rendering found that declaring had missed.** Two door states turned out
to be one screen that says one of several things, and the choice belongs to a
rule rather than to a second state: `STATE-access-door-sending` is the in-flight
row for both the emailed code and Google, and `STATE-access-door-rejected` is
the recoverable-error row for all three causes `RULE-access-rejection-copy`
lists. A surface answers twelve rows and the door has spent all twelve, so
neither can split. The cases render one sentence each, and `BRIEF.md` now
records which one and why. **This is the step working:** drawing the thing is
what surfaced a gap that writing it down had hidden.

---

Next: **step 3 — `/implement-rules`**, where the 11 rules stop being sentences
and get a rung that can fail — including the two the paragraph above just handed
them.
