import dynamic from "next/dynamic";

import { PROGRESS_ENABLED } from "@/lib/flags";

/** The flag boundary for the read-only tick on a topic row. See `Meter.tsx`. */
const Impl = dynamic(() =>
  import("@/components/progress/CoveredMark").then((m) => m.CoveredMark),
);

export function Mark(props: React.ComponentProps<typeof Impl>) {
  if (!PROGRESS_ENABLED) return null;
  return <Impl {...props} />;
}
