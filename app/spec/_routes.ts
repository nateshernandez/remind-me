import { createSpecRoutes } from "@redspec/next"
import { specs } from "../../specs"

export const { SpecLayout, SpecIndexPage, SpecBoardPage, SpecCasePage, generateStaticParams } =
  createSpecRoutes(specs, {
    route: "/spec",
    specsDir: "specs",
    stateTestsDir: "e2e/state",
    // Must match proxy.ts: the proxy passing a request through while the layout
    // still calls notFound() is a 404 with nothing to explain it.
    publish: process.env.REDSPEC_PUBLISH_BOARD === "1",
  })
