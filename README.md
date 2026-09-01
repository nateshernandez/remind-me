# remind-me

A worked demo of [redspec](https://github.com/nateshernandez/redspec): a spec
made of **artifacts that can go red**, built one step at a time, with the spec
board published at every step so you can watch it happen.

The app itself is beside the point. What is worth looking at is the sequence —
a feature declared in full while none of it exists, then turned green one
artifact at a time, with a gate that fails whenever the two disagree.

## The steps

Each step is a branch, frozen at the moment that step finished, with its own
live board. Open them in order.

| Step | What ran | Board | Code |
| ---- | -------- | ----- | ---- |
| 1 | `/draft-skeleton` — states, flows, and rules declared and red | [board](https://remind-me-git-step-1-draft-skeleton-teamnate.vercel.app/spec/access) | [branch](https://github.com/nateshernandez/remind-me/tree/step-1-draft-skeleton) |
| 2 | `/render-states` — each declared state rendered and asserted | [board](https://remind-me-git-step-2-render-states-teamnate.vercel.app/spec/access) | [branch](https://github.com/nateshernandez/remind-me/tree/step-2-render-states) |
| 3 | `/implement-rules` — each rule on a rung that can fail | _not yet_ | |
| 4 | `/cut-slices` — vertical slices claiming the artifacts they green | _not yet_ | |
| 5 | `/build-slice` — one slice green, its claims stamped | _not yet_ | |

Each branch has a `STEP.md` saying what to look at and what the gate reports at
that point. Read it before the board.

## Reading a board

`/spec` lists the features. `/spec/<slug>` is one feature's board:
states as cards, laid out in lanes by flow, with the edges between them labelled
by what the person did. `/spec/<slug>/<STATE-id>` renders a single state alone —
which is also the URL its screenshot test drives, so a URL, a test name, and a
slice's claim are the same string.

Red badges are not breakage. A declared state that nothing renders yet is
`declared-not-rendered`, and it is the skeleton doing its job. The point of the
method is that the gap is *reported* rather than remembered.

## The feature being specced

`access` — signing in through Clerk, from one door to the signed-in app: an
emailed code, a Google account, a returning member, and a signed-in member
signing out on a machine that is not theirs. Four flows, four surfaces, thirty
states.

## Running it locally

```bash
pnpm install
pnpm dev            # the board is open in development
pnpm spec:status    # the work list, in English
pnpm spec           # the gate
pnpm test           # the rules
```

Run the CLI through the `pnpm spec*` scripts rather than bare `redspec`: the CLI
loads `specs/` with jiti, jiti ignores `tsconfig` paths unless
`JITI_TSCONFIG_PATHS=1` is set, and the sketches import `@/components/ui/*`.

The spec route is normally 404'd in production, because a board shows unshipped
screens, waivers, and fixtures. This repo is the exception — it declares
`publicBoard: true`, which is what makes the deployed boards above viewable.

## A note on the deployments

Step branches are never merged or deleted. Their preview deployments *are* the
demo, and on Vercel's Hobby plan a deployment survives past 30 days only while
its branch is still active.
