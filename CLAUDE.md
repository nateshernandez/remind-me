<!-- redspec:start -->
# Spec flow (redspec)

Specs here are **artifacts that can go red**, not documents.

- `redspec status` is the work list; `redspec check` is the gate. Run `check` before saying you are done.
- Scaffold artifacts with `redspec new`; never hand-write into `specs/` and never edit `.spec-lock.json`.
- **`docs/agents/redspec.md` carries the paths, the shapes, and every finding kind.** Read it before touching a spec.
- The spec route 404s in production, so both Playwright tiers run against the dev server.
<!-- redspec:end -->
