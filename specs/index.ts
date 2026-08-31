// Every feature this repo declares. `redspec new feature` appends here.
import type { Spec } from "@redspec/core"

import accessSpec from "./access/spec"
// redspec:imports

export const specs: Spec[] = [
  accessSpec,
  // redspec:specs
]
