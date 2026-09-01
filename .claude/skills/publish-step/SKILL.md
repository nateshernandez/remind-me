---
name: publish-step
description: "Publish one spec-flow step as a branch, a note, and a live board URL. Use after finishing /draft-skeleton, /render-states, /implement-rules, /cut-slices, or /build-slice in this repo."
---

# Publish a step

This repo is a **demo of the redspec flow**. Its product is not the reminder
app — it is the sequence of boards someone can click through to watch a spec go
from declared-and-red to green. Every spec-flow step therefore ends by being
published, not merged.

Run this after a spec-flow step is finished and `redspec check` reflects it.

## Where the steps go

| Step | Skill              | Branch                     |
| ---- | ------------------ | -------------------------- |
| 1    | `/draft-skeleton`  | `step-1-draft-skeleton`    |
| 2    | `/render-states`   | `step-2-render-states`     |
| 3    | `/implement-rules` | `step-3-implement-rules`   |
| 4    | `/cut-slices`      | `step-4-cut-slices`        |
| 5    | `/build-slice`     | `step-5-build-<slice>`     |

Each step branches from **the previous step's branch**, never from `main`, so
its diff is exactly what that skill produced and nothing else.

```bash
git checkout step-1-draft-skeleton
git pull
git checkout -b step-2-render-states
```

Do the work on that branch. Never run a spec-flow step directly on `main`.

## Finishing a step

1. **Record the gate.** `redspec check` and keep the counts — they go in the
   note. Red is often correct: a skeleton *should* be red, and each step turns
   a named group of findings green. Say which.

2. **Write `STEP.md`** at the repo root, replacing the previous step's. It is
   what a visitor reads before looking at the board. Cover: what this step did,
   which URL to open, what `redspec check` says now and why that is right, and
   what the next step will change. Write it for someone who has not read the
   others.

3. **Commit.** One-line conventional messages, split by concern
   (`AGENTS.md` has the rule). Never include a Claude session ID or URL.

4. **Verify the build before pushing.**
   ```bash
   REDSPEC_PUBLISH_BOARD=1 pnpm build   # must be clean, zero warnings
   pnpm test && pnpm typecheck
   ```

5. **Push the branch. Do not open a PR that gets merged, and never delete it.**
   ```bash
   git push -u origin step-2-render-states
   ```

6. **Verify the deployment actually renders** — a 200 on `/` is not enough,
   because the gate can 404 `/spec` on its own:
   ```bash
   U=https://remind-me-git-step-2-render-states-teamnate.vercel.app
   for p in / /spec /spec/access; do
     echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' -m 20 $U$p)"
   done
   ```
   All three must be `200`. Then open `/spec/access` in a browser and confirm
   the board draws its connectors — a board with nodes and no edges is a known
   failure mode, not a layout choice.

7. **Add the URL to `README.md`'s step list**, so the steps are reachable
   without knowing the URL pattern.

## Traps this repo has already hit

Each of these cost real time. None of them announce themselves.

- **A branch with no unique commit gets no deployment at all.** Vercel
  deduplicates by commit SHA, so a branch pointing at a SHA that already
  deployed produces no preview and no `…-git-<branch>-…` URL. `STEP.md` is what
  guarantees every step branch has a commit of its own. Do not skip it.

- **Never merge or delete a step branch.** On Hobby, preview deployments are
  kept 30 days, and the exception that preserves them requires the branch to be
  *active* — not deleted, and its PR not merged or closed. Merging a step is how
  the demo quietly disappears a month later. Open PRs are fine; leave them open.

- **Bumping `@redspec/*` needs `pnpm-workspace.yaml` bumped with it.** New
  versions are younger than pnpm's minimum release age, so each one needs an
  entry under `minimumReleaseAgeExclude`. Miss it and `pnpm install
  --frozen-lockfile` fails on Vercel while working fine locally.

- **Three things keep `/spec` alive in production**, and removing any one
  404s the whole board: `publicBoard: true` in `spec.config.ts`, `publish:` in
  `proxy.ts` *and* `app/spec/_routes.ts`, and `REDSPEC_PUBLISH_BOARD=1` in
  `vercel.json`. The proxy and the routes must agree — the proxy letting a
  request through while the layout still calls `notFound()` is a blank 404.

- **Deployment Protection must stay off.** If every URL suddenly 302s to
  `vercel.com/sso-api`, it gets re-enabled; turn it off in project settings.
  Note it walls the production `.vercel.app` URL too, not only previews.

- **`/spec/<slug>/<STATE-id>` 404s until states are rendered.** That is
  `cases: {}` in `spec.ts`, the same fact as `declared-not-rendered`. It stops
  after `/render-states`, and is not a bug before then.

## Where things live

- `redspec` is a sibling checkout at `../redspec`, published to npm as
  `@redspec/*`. This repo depends on **released versions**, never `link:`.
  A fix to the kit means: fix there, release, then bump here.
- Vercel scope is `teamnate`; branch URLs are
  `https://remind-me-git-<branch>-teamnate.vercel.app`.
