import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

// `redspec init` writes `"test": "vitest run"` and no config, so vitest's
// default include globs `e2e/**/*.spec.ts` -- the Playwright tiers -- the
// moment a feature is scaffolded, and `pnpm test` goes red on files that were
// never vitest's to run. The two tiers belong to `pnpm test:state` and
// `pnpm test:journey`; this file is the boundary between the runners, plus the
// two things the rules need to reach their implementations.
export default defineConfig({
  resolve: {
    // The rules import the code they hold to account through the same `@/`
    // alias the app uses, so a rule and a component name one module.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**"],
    // RULE-access-spec-gate drives the real proxy, and the real proxy reaches
    // for `next/server` from inside @redspec/next, which pnpm does not link
    // for a peer dependency. Inlining it lets vite resolve the peer from here.
    server: { deps: { inline: ["@redspec/next"] } },
  },
})
