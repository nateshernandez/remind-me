# remind-me

This repo is a **demo of the redspec flow**, not a product. Its output is the
sequence of spec boards someone can click through to watch a feature go from
declared-and-red to green, one step per branch.

- Every spec-flow step ends by being **published**: its own branch, its own
  `STEP.md`, its own live board URL. **Run `/publish-step` to do that** — it
  carries the branch naming, the checks, and the traps this repo has already
  hit. Read it before pushing anything.
- **Never merge or delete a `step-*` branch.** Merging one deletes its
  deployment 30 days later, and the deployment is the demo.
- `@redspec/*` comes from npm, never a `link:` to `../redspec`. Fixing the kit
  means fixing it there, releasing, then bumping here.
- **Run the redspec CLI through the `pnpm spec*` scripts, never bare `npx
  redspec`.** The CLI loads `specs/` with jiti, and jiti does not read
  `tsconfig` paths unless `JITI_TSCONFIG_PATHS=1` is set. The sketches import
  `@/components/ui/*`, so without it every command dies on `Cannot find module
  '@/lib/utils'`. The scripts (`spec`, `spec:status`, `spec:board`,
  `spec:accept`) set it.

Where things stand is in `STEP.md` on the current step branch.

<!-- redspec:start -->
# Spec flow (redspec)

Specs here are **artifacts that can go red**, not documents.

- `redspec status` is the work list; `redspec check` is the gate. Run `check` before saying you are done.
- Scaffold artifacts with `redspec new`; never hand-write into `specs/` and never edit `.spec-lock.json`.
- **`docs/agents/redspec.md` carries the paths, the shapes, and every finding kind.** Read it before touching a spec.
- The spec route is published in production here (`publicBoard: true`), but both Playwright tiers still run against the dev server.
<!-- redspec:end -->
