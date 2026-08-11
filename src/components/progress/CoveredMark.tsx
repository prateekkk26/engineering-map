"use client";

import { Check } from "lucide-react";

import { useIsCovered } from "@/lib/progress";

/**
 * The covered tick on a topic row. Read-only, and that is the point: marking
 * happens on the topic page, after reading it, via `CoveredToggle`. A tickable
 * list is a checklist you can clear without opening anything, which is the one
 * failure mode that would make every other number here meaningless.
 *
 * Absent rather than greyed when uncovered — a list of 24 empty boxes reads as
 * a to-do list; a list with four ticks in it reads as progress.
 */
export function CoveredMark({ slug }: { slug: string }) {
  const covered = useIsCovered(slug);
  if (!covered) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-muted-foreground"
      title="You've marked this covered"
    >
      <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
      Covered
    </span>
  );
}
