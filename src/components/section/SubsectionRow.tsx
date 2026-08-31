import Link from "next/link";

import { Meter } from "@/components/progress/Meter";
import { surface } from "@/lib/interactive";
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
  sharedSlugs,
}: {
  subsection: Subsection;
  written: number;
  planned: number;
  /** `_shared/` topics surfaced into this row's list, counted in `written`. */
  sharedSlugs: readonly string[];
}) {
  const body = (
    <div className="min-w-0 space-y-1">
      <h2 className="font-medium leading-snug">{subsection.title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {subsection.description}
      </p>
      <p className="text-xs text-muted-foreground tabular-nums">
        {countLine(written, planned)}
      </p>
      <Meter
        prefix={subsection.slug}
        total={written}
        extraSlugs={sharedSlugs}
        className="pt-1"
      />
    </div>
  );

  return (
    <Link
      href={`/${subsection.slug}`}
      className={surface({ level: "row" })}
    >
      {body}
    </Link>
  );
}
