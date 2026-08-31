import { createElement } from "react";
import Link from "next/link";

import { ProgressMeter } from "@/components/progress/ProgressMeter";
import { iconFor } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Section } from "@/lib/types";

/**
 * The count line — PRD §4 asks for `6 subsections · 48 topics`.
 *
 * Taken literally that renders "14 subsections · 207 topics" for Frontend,
 * which leads to 16 readable pages. So authored and planned are both shown when
 * they differ. This is content state at build time, not reader progress: it
 * does not collide with the Phase 5 progress tracking, or with the PRD §2 ban
 * on gamification.
 */
function countLine(section: Section): string {
  const subsections = `${section.subsections.length} ${
    section.subsections.length === 1 ? "subsection" : "subsections"
  }`;

  const noun = section.plannedCount === 1 ? "topic" : "topics";
  const topics =
    section.topicCount === section.plannedCount
      ? `${section.plannedCount} ${noun}`
      : `${section.topicCount} of ${section.plannedCount} ${noun}`;

  return `${subsections} · ${topics}`;
}

/**
 * One section, as a row on the home page.
 *
 * Every section is authored now, so this is always a link. The card used to
 * carry an unlinked variant for sections that had no content yet — a link to
 * an empty page is the dead end PRD §7 exists to prevent — but all eight are
 * written, so that branch could not run and the `<Link>`-wrapping-`<Card>`
 * shape it forced is gone with it.
 *
 * Flattened deliberately rather than using shadcn's `Card`: that is
 * `rounded-xl` with a ring, which reads as a box in a grid, and PRD §7 wants
 * lists. `p-4` clears the 44px tap target.
 */
export function SectionCard({ section }: { section: Section }) {
  return (
    <Link
      href={`/${section.slug}`}
      className="flex flex-row items-start gap-3 rounded-lg p-4 outline-none ring-1 ring-border hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* `createElement` rather than assigning to `<Icon />`: the icon comes
          from a lookup, and react-hooks/static-components reads a capitalised
          local as a component defined during render. The lookup returns a
          stable reference out of a frozen map, so the warning is a false
          positive — this avoids it without switching the rule off. */}
      {createElement(iconFor(section.icon), {
        className: cn("mt-0.5 size-5 shrink-0 text-foreground"),
        "aria-hidden": true,
      })}
      <div className="min-w-0 space-y-1">
        <h2 className="font-medium leading-snug">{section.title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {section.description}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {countLine(section)}
        </p>
        {/* Reader progress sits under the content counts, not instead of them:
            "40 of 207 covered" only means something next to how much of the
            section is written. */}
        <ProgressMeter
          prefix={section.slug}
          total={section.topicCount}
          className="pt-1"
        />
      </div>
    </Link>
  );
}
