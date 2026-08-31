import { defineConfig, devices } from "@playwright/test"

// Two tiers, differing by target rather than by tool. `state` points at the
// spec route -- fixtures only, no auth, no backend -- and asserts exhaustively.
// `journey` points at the real app and stays a handful of paths. Both run
// against the dev server: the spec route 404s in production by design.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  expect: { toHaveScreenshot: { stylePath: "./e2e/screenshot.css" } },
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [
    { name: "state", testDir: "./e2e/state", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } } },
    { name: "journey", testDir: "./e2e/journey", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: { command: "pnpm dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI, timeout: 120_000 },
})
