import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The board reads two things off disk (@redspec/next pages.tsx): the
  // state-tier assertions, for the intent each node shows, and the rule files a
  // resolution table lives in. Both pages that do it are prerendered today, so
  // the reads happen at build -- but a board that ever stops being static would
  // lose these files on a serverless host, and silently: a missing assertion
  // renders as an unnamed node, not as an error. Naming them keeps that from
  // being a mystery.
  outputFileTracingIncludes: {
    "/spec": ["./specs/**/*", "./e2e/state/**/*"],
    "/spec/[feature]": ["./specs/**/*", "./e2e/state/**/*"],
  },
}

export default nextConfig
