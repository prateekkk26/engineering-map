import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Subsection } from "@/lib/types";

/**
 * One row of the section page — PRD §4 ②: "title, one-line description, topic
 * count."
 *
 * The counts are passed in rather than read off `subsection.topics`, because
 * both sides of "written of planned" have to account for the `_shared/` topics
 * surfaced into this subsection. `getSubsectionCounts` owns that arithmetic.
 */
function countLine(written: number, planned: number): string {
  const noun = planned === 1 ? "topic" : "topics";
  return written === planned
    ? `${planned} ${noun}`
    : `${written} of ${planned} ${noun}`;
}

export function SubsectionRow({
  subsection,
  written,
  planned,
}: {
  subsection: Subsection;
  written: number;
  planned: number;
}) {
  const body = (
    <div className="min-w-0 space-y-1">
      <h2 className="font-medium leading-snug">{subsection.title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {subsection.description}
      </p>
      <p className="text-xs text-muted-foreground tabular-nums">
        {written === 0
          ? `Not yet written · ${planned} planned`
          : countLine(written, planned)}
      </p>
    </div>
  );

  const shell = "block rounded-lg p-4 ring-1 ring-border";

  // Same rule as an unspecified section on the home page: the row renders,
  // because the planned subsections are part of the claim about what a senior
  // should know — but it is not a link, because a link to an empty topic list
  // is the dead end PRD §7 exists to prevent.
  if (written === 0) {
    return <div className={cn(shell, "opacity-60")}>{body}</div>;
  }

  return (
    <Link
      href={`/${subsection.slug}`}
      className={cn(
        shell,
        "outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {body}
    </Link>
  );
}
