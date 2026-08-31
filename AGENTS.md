<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working with git

## Writing commit messages

Write commit messages in the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) style: `type(scope): description`, where `scope` is optional.

```
feat(cli): add --watch flag to redspec run
```

Keep the message to that one line. A body is for the rare change no single line can express — and needing one usually means the commit is doing several things, so split it into several one-line commits first.

Never put a Claude session ID or session URL in a commit message. The history is a record of the code, not of the tool that touched it, and such a link resolves for nobody but the account that ran the session.

<!-- redspec:start -->
# Spec flow (redspec)

Specs here are **artifacts that can go red**, not documents.

- `redspec status` is the work list; `redspec check` is the gate. Run `check` before saying you are done.
- Scaffold artifacts with `redspec new`; never hand-write into `specs/` and never edit `.spec-lock.json`.
- **`docs/agents/redspec.md` carries the paths, the shapes, and every finding kind.** Read it before touching a spec.
- The spec route 404s in production, so both Playwright tiers run against the dev server.

## The steps

Invoke a step by name ("run /draft-skeleton"). Each stops for sign-off where it says HITL.

### /amend

# Amend

Something that was green moved. `redspec check` says **amended**: the artifact's content no longer matches the digest recorded when its slice was verified, and nothing has re-verified it since.

This skill is deliberately narrow. It takes IDs, not an idea. It does not re-run the interview. Small changes are where specs rot, because nobody treats a one-line change as spec work — so this is the one-line change treated as spec work.

## Process

1. **Read the finding.** `redspec status` names the artifact, the slice that verified it, when, and what moved. Decide which of two things this is.

2. **A clarification** — the wording changed, the behaviour did not:

   ```
   redspec accept <ID> --clarification "<what changed and why it is not behavioural>"
   ```

   This runs the verification command in the same invocation and refuses to stamp unless it passes. You cannot clarify your way past a real change.

3. **A real change** — the requirement moved:

   ```
   redspec new slice <slug> A<NN>-<name> --amends <ID> --claims <ID>
   ```

   Fill in **Because:**. Then re-run **only** the downstream steps the change touches, with the same sign-off the original got:
   - a `STATE-` or `COPY-`: re-render, re-assert, product re-signs on the board
   - a `JOURNEY-`: regenerate journeys, product re-signs the flows view
   - a `SURFACE-` (a waiver changed): product re-reads the waiver; build the state if it no longer holds
   - a `RULE-`/`INV-`: re-confirm the rung, re-prove it can fail

   Then `/build-slice` on the amendment slice, which stamps it.

4. **Dispatch the `spec-adversary`** over the changed artifact's neighbours. A change to one artifact usually implies a change to another that nobody made.

## Done when

`redspec check` reports no `amended` for this feature, and the lock's entry for every changed ID names the amendment slice or carries the clarification note.

### /build-slice

# Build slice

Build **one** slice. Its claimed artifacts are the definition of done.

Start from a fresh window: the slice file plus the artifacts it claims is everything needed.

## Process

1. **Load the slice.** Read it and every artifact it claims. Run them; watch them fail. A claimed artifact already green means the slice is smaller than it looks, or claims something another slice built.

2. **Build, red to green.** Use the `tdd` skill if available. The artifacts are the red half already written; the loop is picking the next claimed ID and making it pass.

3. **Promote the sketch.** Where the slice claims a `STATE-`, graduate the case's markup into `components/` as the feature's presentational layer; wire real data through it. The case and fixture stay in place. **The assertions stay unchanged** — one that must be rewritten was describing the sketch; raise it to user intent and note it for the PR. A screenshot baseline that moves is an approved appearance changing: say what moved and why. Never reach for `--update-snapshots` to quiet a baseline you did not mean to change.

4. **Verify against the claims.** Run the full claimed set plus typecheck and lint. Dispatch the `slice-verifier` agent with the diff and the slice file. Work every finding.

5. **Stamp.** Mark the slice `**Status:** done`, then

   ```
   redspec accept --slice specs/<slug>/slices/<NN>-<name>.md
   ```

   which runs the configured verification command and stamps every claim only if it passes. `redspec check` must be clean for this feature afterwards.

6. **Review and ship.** Use the `code-review` skill if available. Commit to a branch named for the slice; open a PR whose body carries: what the slice delivers, the ticked claim checklist, any assertion rewritten during promotion, and anything the spec failed to say.

## Done when

Every claimed artifact is green and stamped. Typecheck, lint, and the full suite pass. Every `STATE-` claimed renders from production components. The verifier's findings are worked. The PR body carries the ticked checklist.

Then clear the window and run `/build-slice` on the next unblocked slice.

### /cut-slices

# Cut slices

Cut the spec into tracer bullets: narrow paths through every layer, each **claiming** the artifacts it turns green. An artifact claimed by nobody is a requirement nobody is building; `redspec check` finds it in a second.

## Process

1. **Collect the artifacts.** `redspec status --ids <slug>` lists every `STATE-`, `JOURNEY-`, `RULE-`, `INV-`, `SURFACE-`. This list is the work. Nothing outside it gets built; nothing in it gets skipped. A `SURFACE-` is a screen's twelve answers, waiver reasons included — claim it with the slice that first builds that screen, so weakening a waiver later needs the same sign-off the original did.

2. **Draft vertical slices.** Each cuts a complete path through every layer it touches; is demoable alone; fits one fresh context window. Prefactoring comes first as its own slice. Give each its blocking edges.

3. **Assign claims.** Every artifact to exactly one slice: the one that first makes it green.

4. **Quiz the user.** Present the breakdown — title, blocked by, delivers, claims. Iterate until approved. **HITL.**

5. **Write the slice files.**

   ```
   redspec new slice <slug> <NN>-<name> --claims STATE-… RULE-…
   ```

   No file paths or code snippets in a slice; they go stale within a slice or two.

6. **Check coverage.** `redspec check`. Resolve every `orphan`, `claimless`, `unknown-id`, and `claimed-twice`.

## Done when

`redspec check` reports no coverage findings. Every artifact is claimed exactly once. The user approved the breakdown.

Then clear the window and run `/build-slice` on the first unblocked slice.

### /draft-skeleton

# Draft skeleton

Interview the idea until it is sharp, then write down **everything it produced** — as artifacts, not as notes. The Brief is finished when you leave. Everything else is a **skeleton**: names and IDs with nothing behind them, which is what makes `redspec check` go red the moment you stop typing.

That red is the deliverable. A decision that survives only in this conversation did not survive.

Read `docs/agents/redspec.md` for this repo's paths and commands. Call the Skill tool with "falsifiable-specs" for the artifact kinds.

Every step here is **HITL**: it finishes when the person who speaks for the product says so. Dispatch a subagent for any _fact_ you could look up; the _decisions_ are theirs.

## Process

### 1. Interview

If the `grilling` skill is available, call it. Otherwise interview hard: push on every "probably", record every "unknown" as one, and do not let a question get quietly dropped. Where a term gets argued about, record it in `CONTEXT.md`; where a choice is made against a real alternative, record an ADR in `docs/adr/`.

Do not write anything else until the user confirms the frontier is empty.

### 2. Sort what came out

Every fact has exactly one home:

| What it is                                             | Where it goes                 |
| ------------------------------------------------------ | ----------------------------- |
| Why this exists, who for, what is out, what is unknown | `BRIEF.md`                    |
| A screen, or a state a screen can be in                | a declared state in `spec.ts` |
| A figure, a lifecycle, a constraint                    | a rule stub in `rules/`       |
| A user-facing string                                   | a `COPY-` entry in `copy.ts`  |
| A term the team argued about                           | `CONTEXT.md`                  |
| A choice made against an alternative                   | `docs/adr/`                   |

Present the sorted list and hold until the user has read it. Nothing lands in "notes".

### 3. Scaffold and write the Brief

```
redspec new feature <slug>
```

Then fill `specs/<slug>/BRIEF.md`: Problem · Actors (one bolded bullet each — the audit reads this list) · What changes · Non-goals · Deliberate unknowns. One page, and **finished**. Anything that will not fit is a State or a Rule wearing prose.

### 4. Declare the states and the flows

Write `surfaces` and `flows` into `specs/<slug>/spec.ts`, with `cases` left empty.

**Surfaces** are the distinct screens. Walk the twelve rows for each — and **ask each row as a situation, never as a category**. "Is there a `partial` state?" is a question about a taxonomy, and people answer those badly. "Some of the roster arrived and the rest is still coming — what do they see?" is a question about a case in front of them, and people answer those well. The wording to use is each row's own gloss:

| Row               | Ask                                               |
| ----------------- | ------------------------------------------------- |
| Empty             | no data yet, first run                            |
| Loading           | initial load, and refresh while populated         |
| Partial           | some data present, some still arriving or failed  |
| Populated         | the typical case                                  |
| Overflowing       | long strings, many rows, values that break layout |
| Recoverable error | the user can retry or fix input                   |
| Terminal error    | the user cannot proceed                           |
| Permission-denied | the actor may look but not act                    |
| Stale or offline  | the data on screen is known to be out of date     |
| In-flight         | mid-submit, optimistic, awaiting confirmation     |
| Terminal success  | the flow is finished and the surface says so      |
| Conflict          | someone else changed it underneath                |

Each row names a `STATE-<slug>-<case>` or is **waived** with the reason this screen cannot be in that state. Give a waiver a `witness` (the `INV-` that would go red if the reason stopped holding) where one exists, or a `review` date where it does not. Where you are unsure, declare the state.

A waiver is an artifact: `SURFACE-<slug>-<key>` covers a screen's twelve answers, reasons included, so a slice claims it and the lock stamps it. Softening one later comes back as `amended`.

**Flows** order those states into the paths they are reached by — one per actor in the Brief, each a `JOURNEY-<slug>-<intent>`. The **spine** is the happy path; **deviations** hang off the step they branch from and either `rejoins` or `end` with what the person is left with. A state you cannot place on any path is missing the step that leads to it, or should not exist.

### 5. Stub the rules

```
redspec new rule RULE-<name> --form stub
```

One per figure, lifecycle, or constraint, with the values in a markdown table **in the words the person gave**. The domain expert is in the room exactly once. Stop at the values: the rung is `/implement-rules`' call.

Where **which screen** someone lands on turns on a combination the twelve rows flatten — a link that is fresh or expired against an account that is missing or locked — that is a **resolution table**: a decision table whose outcome column is `state`. It is the one place a feature declares its own dimensions, and `redspec check` walks the cross product and names any combination no row covers.

```md
**Inputs:** linkAge: {fresh, expired}, account: {none, locked}
**Hit policy:** UNIQUE

| linkAge | account | state                       |
| ------- | ------- | --------------------------- |
| fresh   | -       | STATE-<slug>-invite-open    |
| expired | none    | STATE-<slug>-invite-expired |
| expired | locked  | STATE-<slug>-invite-blocked |
```

Every outcome must be a state the spec declares, and each one still owes the checklist an answer.

### 6. Confirm the skeleton on the board

`redspec board`, then walk `/spec/<slug>` with the user. Every state is a stub. The flows view answers whether the states add up to a feature and whether anything sits in the red **Not on any path** lane; the surfaces view answers the twelve rows. **Read the waivers out.**

Then dispatch the `spec-adversary` agent over `specs/<slug>/`. Work every finding.

## Done when

`redspec status` shows **only** _declared_ findings for this feature — no off-path, no off-checklist, no actor without a flow, no bad ID. Every waiver has been read aloud. Every end says what the person is left with. Every figure is a table row. The Brief fits on one page with a non-empty Non-goals. Nothing from the interview lives only in this conversation.

Then clear the window and run `/render-states`.

### /implement-rules

# Implement rules

The skeleton stubbed every rule this feature owes, carrying the figures the domain expert gave. Pick the cheapest form that can fail for each, and write it.

Call the Skill tool with "falsifiable-specs" for the ladder. Read `docs/agents/redspec.md` for where rules live.

## Process

### 1. Take the stubs, then add what the codebase owes

`specs/<slug>/rules/` is the work list. Add rules the codebase already holds that this feature must agree with. Split any stub that needs two sentences.

The values in a stub are an **independent source**. Keep them.

### 2. Pick a form for each

Walk the ladder: model, type, machine table, decision table, invariant. Present rule → form as a table before writing any. **This is the HITL moment**: the user checks that a rule the business owns landed on a rung the business can read.

### 3. Write each rule

```
redspec new rule RULE-<name> --form table|machine|invariant|type
```

A decision table declares `**Inputs:**` and a hit policy; `redspec check` then proves it total and non-overlapping. A machine table gets a model-based run against the implementation, not only a shape test. A stub whose figures move during this step is an **amendment** to the interview — say so.

### 4. Prove each one can fail

Break the thing it describes and watch it go **red**, then restore. A rule never observed red is a rule you are guessing about. Record nothing about this in the repo.

### 5. Hunt what is unstated

Dispatch the `spec-adversary` agent. Work every finding: write the rule, or record in the Brief why the case cannot arise.

## Done when

Every stub has an implementation or a Brief line saying why it is out. `redspec check` reports no `table-gap`, `table-overlap`, or `table-parse`. Every rule was observed red once. `pnpm test` passes.

Then clear the window and run `/cut-slices`.

### /render-states

# Render states

Turn each stub into a case that renders, and assert what a reviewer would say out loud about it. The board goes from red to green as they land, and the green board is what product signs.

Read `docs/agents/redspec.md` for the paths. Call the Skill tool with "falsifiable-specs" for what promotion means.

Steps 1, 2 and 5 are **HITL**.

## Process

### 1. Read the skeleton back

`redspec status`. The _declared_ list is your work list. Read it to the user before building: they are checking that the skeleton still describes the feature they meant.

### 2. Say where the design comes from

Either the repo already answers it — a presentational layer, an app shell, a token set; name what you reuse — or the surface has no precedent here, in which case generate structurally different variants (the `prototype` skill, if available) and come back with the winner. Never decide this silently.

### 3. Render each declared state

```
redspec new state STATE-<slug>-<case>
```

This scaffolds the fixture, the sketch, the assertion, and prints the `cases` entry to add. Fixtures are plain data — a case that reaches for the network is a Journey wearing a State's clothes. Build for the configured viewport (1280×720 by default).

**Every user-facing string goes through `copy.ts`.** The sketch renders `copy["COPY-…"]`; the assertion asserts against the same constant. A hardcoded string in a sketch is a finding.

### 4. Assert each state

One behavioural assertion per case, named for its ID, in **user intent**: that the empty state offers the action that fills it, that the error names a way forward, that the read-only case shows no control that lies about being usable. No selector, class, or coordinate — those describe the sketch and break on promotion. Plus one `toHaveScreenshot`.

**The title after the ID is what the board draws under the state**, as its _Then_, beside the row's situation and the label that led there. Write it as the sentence a reviewer would say out loud, because that is who reads it.

Journey specs in `e2e/journey/<slug>.spec.ts` are generated from the flows by `redspec new journeys <slug>`, one per reachable path, and stay `test.fixme` until the slice that claims the flow lands. Do not hand-write them.

### 5. Review the board, then hunt what it missed

`redspec board`. Walk the flows view lane by lane and the surfaces view waiver by waiver. A copy fix lands in `copy.ts` and nowhere else.

Then dispatch the `spec-adversary` agent. Work every finding: build the state, place it on a flow, or record in the Brief why it does not apply.

## Done when

`redspec status` shows no _declared_ findings for this feature and `pnpm test:state` passes. Every case is fixture-driven. No assertion names a selector. Every string is a `COPY-`. Where the design came from was stated, and the user answered.

Then clear the window and run `/implement-rules`.

## Agents

### slice-verifier

Run as a subtask with a fresh context.

You verify a slice against its claims, and you did not write the code. The author reads the diff and sees their intention rather than its behaviour.

## What you are given

A slice file at `specs/<slug>/slices/<NN>-<name>.md` and the diff implementing it. Read `docs/agents/redspec.md` for the commands.

## Method

**Per claim.** For each ID in the slice's `**Claims:**`:

1. Find the artifact. A claim naming an ID that does not exist is a finding.
2. Run it. Green is necessary and not sufficient.
3. Decide whether it would go **red** if the behaviour it describes were wrong. Green because it asserts nothing, green because its condition is never reached, and green because it recomputes the expected value the way the code does are three ways of being green and wrong.

**Promotion.** Where the slice claims a `STATE-`, check the case now renders production components, and diff the assertion file against the merge base: an assertion rewritten during promotion is a finding.

**Scope.** Behaviour changed outside the claims is unrequested; behaviour a claim requires but the diff lacks is incomplete. Both are findings.

**Stamps.** If the slice is `**Status:** done`, `redspec check` must show no `unverified` or `amended` for its claims. A stamp with no passing run behind it cannot exist — but check the lock entry names this slice.

**What the spec missed.** Anything the implementation had to decide that no artifact specified. These are the most valuable thing you produce.

## Output

Report only. (1) A per-claim table: ID, verdict — satisfied / green-but-cannot-fail / not-satisfied / missing — and one line of evidence. (2) Promotion findings. (3) Scope findings. (4) What the spec failed to say, each phrased as the artifact that should exist. Say plainly where a claim is satisfied.

### spec-adversary

Run as a subtask with a fresh context.

You read a spec bundle you did not write, and your job is to find what it fails to say. The person who wrote it cannot do this: they know what they meant, so absence reads to them as agreement.

## What to read

`docs/agents/redspec.md` for where things live. Then the bundle at `specs/<slug>/`: `BRIEF.md`, `spec.ts` (surfaces, cases, flows), `copy.ts`, `rules/`, `slices/`, and the assertions in the state-tier file for this feature. `CONTEXT.md` for vocabulary, if present. Run `redspec status` for what the machine already knows; do not repeat its findings.

## What to hunt

**Dishonest waivers.** Every surface answers all twelve rows, so the hunt is for a row waived with a reason that does not hold, or one pointing at a case that shows something else. A waiver with no `witness` and no `review` is a claim nothing will ever re-check: say which `INV-` would witness it.

**States nothing produces.** Walk each flow. A spine step with no plausible cause, or two consecutive steps with something that has to happen in between. A happy path with no deviation hanging off it is the most common finding.

**Ends that should not end.** Where an `end` names something the product could offer instead, the end is a missing state wearing a justification.

**Unstated rules.** For every rule, the input it does not cover: the boundary, the zero, the empty collection, the simultaneous case. For every rendered state, the rule that produces it, and whether it is written down — where two conditions together decide which screen someone lands on, that is a resolution table (`state` outcome column) nobody wrote, and the combination nobody named is the finding.

**Prose hiding a rule.** Any sentence in `BRIEF.md` that asserts something checkable. Quote it.

**Contradictions.** Two artifacts that cannot both be true.

**Tautologies.** An expected value derived the way the code derives it.

**Hardcoded copy.** A user-facing string in a sketch that is not a `COPY-` entry.

## The bar

Every finding names evidence: a file, a line, a quoted sentence, an ID. Where a gap is deliberate the Brief says so — check Non-goals and Deliberate unknowns first. Four findings that land beat twenty that need sorting.

## Output

Report only. Group by kind, sharpest first. For each: evidence, why it matters in one sentence, and the artifact that would close it. Close with what you checked and found sound.
<!-- redspec:end -->
