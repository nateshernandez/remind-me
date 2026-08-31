import { createSpecProxy } from "@redspec/next/gate"

// The production gate. It answers 404 before anything renders: a layout-level
// notFound() still serializes the page into the response body.
export const proxy = createSpecProxy({ route: "/spec" })

// Next statically parses this at build time, so every value has to stay a
// literal -- a helper call here fails the build.
export const config = { matcher: ["/spec", "/spec/:path*"] }
