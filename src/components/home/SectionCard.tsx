import { createElement } from "react";
import Link from "next/link";

import { ProgressMeter } from "@/components/progress/ProgressMeter";
import { Card } from "@/components/ui/card";
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

export function SectionCard({ section }: { section: Section }) {
  const body = (
    <>
      {/* `createElement` rather than assigning to `<Icon />`: the icon comes
          from a lookup, and react-hooks/static-components reads a capitalised
          local as a component defined during render. The lookup returns a
          stable reference out of a frozen map, so the warning is a false
          positive — this avoids it without switching the rule off. */}
      {createElement(iconFor(section.icon), {
        className: cn(
          "mt-0.5 size-5 shrink-0",
          section.specified ? "text-foreground" : "text-muted-foreground",
        ),
        "aria-hidden": true,
      })}
      <div className="min-w-0 space-y-1">
        <h2 className="font-medium leading-snug">{section.title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {section.description}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {section.specified ? countLine(section) : "Not yet specified"}
        </p>
        {/* Reader progress sits under the content counts, not instead of them:
            "40 of 207 covered" only means something next to how much of the
            section is written. */}
        {section.specified ? (
          <ProgressMeter
            prefix={section.slug}
            total={section.topicCount}
            className="pt-1"
          />
        ) : null}
      </div>
    </>
  );

  // Flattened deliberately: shadcn's Card is rounded-xl with a ring, which
  // reads as a box in a grid. PRD §7 wants lists, not grids — so it keeps the
  // hairline and loses the rest. `py-4 px-4` clears the 44px tap target.
  const shell = "flex flex-row items-start gap-3 rounded-lg p-4";

  // Six of eight sections have no content yet. They render, because the eight
  // sections are the claim about what a senior should know and hiding them
  // would misrepresent the map — but they are not links, because a link to an
  // empty page is the dead end PRD §7 exists to prevent.
  if (!section.specified) {
    return (
      <Card className={cn(shell, "bg-transparent opacity-60 ring-border")}>
        {body}
      </Card>
    );
  }

  // Card is a plain div in this version of shadcn — no `asChild`/Slot — so the
  // link wraps it rather than the other way round. The whole row is the hit
  // area, not just the title.
  return (
    <Link
      href={`/${section.slug}`}
      className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className={cn(shell, "ring-border hover:bg-accent/40")}>{body}</Card>
    </Link>
  );
}
