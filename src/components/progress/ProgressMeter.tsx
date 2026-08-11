"use client";

import { useCoveredCount, useProgressReady } from "@/lib/progress";
import { cn } from "@/lib/utils";

/**
 * "12 of 24 covered", with a hairline bar.
 *
 * Deliberately quiet: no percentage badge, no colour that changes as you climb,
 * no celebration at 100%. PRD §2 bans gamification, and the line between "a
 * count of what's left to read" and "a score" is exactly that styling. It reads
 * like the topic counts it sits next to because it is the same kind of fact.
 *
 * `total` is the server's count of authored topics — see `useCoveredCount` for
 * why the numerator is derived from the slug prefix instead of a list.
 */
export function ProgressMeter({
  prefix,
  total,
  extraSlugs,
  className,
  showBar = true,
}: {
  prefix: string;
  total: number;
  /** `_shared/` topics counted in `total` — see `useCoveredCount`. */
  extraSlugs?: readonly string[];
  className?: string;
  showBar?: boolean;
}) {
  const ready = useProgressReady();
  const covered = useCoveredCount(prefix, total, extraSlugs);

  if (total === 0) return null;

  const percent = ready ? Math.round((covered / total) * 100) : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {showBar ? (
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={ready ? covered : undefined}
          aria-label={`${covered} of ${total} topics covered`}
        >
          <div
            className="h-full rounded-full bg-foreground/70 transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}

      {/* Until hydration the count is unknown, not zero. A non-breaking space
          holds the line's height so nothing shifts when the real number
          arrives. */}
      <p className="text-xs text-muted-foreground tabular-nums">
        {ready ? `${covered} of ${total} covered` : " "}
      </p>
    </div>
  );
}
