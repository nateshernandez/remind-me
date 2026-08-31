import { join } from "node:path"

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {
    // The three @redspec packages are pnpm `link:` symlinks to ../redspec.
    // Turbopack infers its root as this directory and refuses to resolve
    // anything outside it, so every `@redspec/*` import fails -- including the
    // one in proxy.ts, which takes the whole app down with it. Rooting at the
    // parent directory puts the sibling checkout back in scope.
    //
    // This root is also the base Tailwind scans from, and the parent is not a
    // git root, so nothing ignores node_modules there. app/globals.css pins the
    // scan back to this project with source("../"); dropping that pin hangs
    // `next dev` under thousands of postcss workers. Change the two together.
    root: join(import.meta.dirname, ".."),
  },
}

export default nextConfig
