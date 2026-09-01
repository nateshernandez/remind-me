import { createSpecProxy } from "@redspec/next/gate"

// The production gate. It answers 404 before anything renders: a layout-level
// notFound() still serializes the page into the response body.
//
// This repo is the redspec demo, so the board is what a visitor comes to see.
// `publish` opens the route only where REDSPEC_PUBLISH_BOARD=1 is set, which is
// the deployed demo and nowhere else. spec.config.ts declares the same intent;
// `redspec check` reports `board-published` if the two ever disagree.
export const proxy = createSpecProxy({
  route: "/spec",
  publish: process.env.REDSPEC_PUBLISH_BOARD === "1",
})

// Next statically parses this at build time, so every value has to stay a
// literal -- a helper call here fails the build.
export const config = { matcher: ["/spec", "/spec/:path*"] }
