import dynamic from "next/dynamic";

import { PROGRESS_ENABLED } from "@/lib/flags";

/** The flag boundary for the only control that writes progress. See `Meter.tsx`. */
const Impl = dynamic(() =>
  import("@/components/progress/CoveredToggle").then((m) => m.CoveredToggle),
);

export function Toggle(props: React.ComponentProps<typeof Impl>) {
  if (!PROGRESS_ENABLED) return null;
  return <Impl {...props} />;
}
