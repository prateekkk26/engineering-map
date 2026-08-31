import dynamic from "next/dynamic";

import { PROGRESS_ENABLED } from "@/lib/flags";

/**
 * The flag boundary for the rollup meter — PRD §10.
 *
 * `next/dynamic` rather than a plain import, because a plain import is not
 * dropped by the flag. `PROGRESS_ENABLED` folds to `false` and the branch dies,
 * but the module it names is still in the importing file's graph, so its bytes
 * still land in that page's client chunk. Behind `dynamic` the implementation
 * gets a chunk of its own that nothing rendered ever references, and the
 * browser never asks for it.
 *
 * A server component on purpose: the flag is resolved before any client code is
 * chosen, so with progress off the whole subtree never reaches the boundary.
 */
const Impl = dynamic(() =>
  import("@/components/progress/ProgressMeter").then((m) => m.ProgressMeter),
);

export function Meter(props: React.ComponentProps<typeof Impl>) {
  if (!PROGRESS_ENABLED) return null;
  return <Impl {...props} />;
}
