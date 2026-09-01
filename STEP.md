# Step 1 — after `/draft-skeleton`

The `access` feature has been **declared** and nothing has been **built**. This
is the state the skeleton skill leaves behind, and it is deliberately red.

**Look at:** [`/spec/access`](/spec/access)

The board shows four flows — a new visitor with an emailed code, a new visitor
with Google, a returning member, a signed-in member signing out — laid out as
lanes. Every state on it is declared: it has an ID, a surface, a checklist row,
and a sentence saying what the person is looking at. None of them render yet.

**What the gate says here:**

```
$ redspec check
30 declared-not-rendered
50 orphan
```

Both are correct at this stage, and neither is a bug:

- `declared-not-rendered` — a state exists in the registry with no case to draw
  it. `/render-states` clears these.
- `orphan` — an artifact no slice has claimed yet. `/cut-slices` clears these.

`/spec/access/<STATE-id>` 404s for every state, because `spec.ts` has
`cases: {}`. That is the same fact as `declared-not-rendered`, seen from the
route instead of the report.

**What is worth noticing:** the spec is already specific enough to be wrong.
The states, the flows between them, the copy each one asserts against, and the
twelve-row checklist per surface are all committed before a line of the feature
exists — so the next step has something to be measured against.

---

Next: **step 2 — `/render-states`**, where the declared states get cases and the
board starts drawing them.
