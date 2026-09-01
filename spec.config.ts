import { defineSpecConfig } from "@redspec/core"

export default defineSpecConfig({
  framework: "next",
  route: "/spec",
  caseViewport: { width: 1280, height: 720 },
  // "witnessed" makes every waiver name the INV- that would go red if it stopped holding.
  waivers: "free",
  // Must exit 0 in the same invocation for `redspec accept` to stamp anything.
  accept: { command: "pnpm test && pnpm test:state" },
  // Which agent harnesses `redspec sync` writes context for.
  harnesses: ["claude","codex"],
  // This repo exists to show the method, so the board is the product. Every
  // other repo leaves this off and 404s the route in production.
  publicBoard: true,
})
