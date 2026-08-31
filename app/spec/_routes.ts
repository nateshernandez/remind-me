import { createSpecRoutes } from "@redspec/next"
import { specs } from "../../specs"

export const { SpecLayout, SpecIndexPage, SpecBoardPage, SpecCasePage, generateStaticParams } =
  createSpecRoutes(specs, {
    route: "/spec",
    specsDir: "specs",
    stateTestsDir: "e2e/state",
  })
