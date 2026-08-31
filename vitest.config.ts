import { defineConfig } from "vitest/config"

// `redspec init` writes `"test": "vitest run"` and no config, so vitest's
// default include globs `e2e/**/*.spec.ts` -- the Playwright tiers -- the
// moment a feature is scaffolded, and `pnpm test` goes red on files that were
// never vitest's to run. The two tiers belong to `pnpm test:state` and
// `pnpm test:journey`; this file is only the boundary between the runners.
export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**"],
  },
})
