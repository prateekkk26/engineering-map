import { formatCount, formatHours, type SiteStats } from "@/lib/stats";
import { cn } from "@/lib/utils";

/**
 * The counts, as one line.
 *
 * A row and not a grid of stat cards, because PRD §7's "lists, not grids"
 * survived going public and a four-tile dashboard is exactly what §4 rules out.
 * This reads as a sentence that happens to contain numbers, which is also how
 * the section and subsection counts elsewhere in the app are set — same
 * `tabular-nums`, same muted label beside a foreground figure.
 *
 * The link count is the one that earns trust: it is the number of distinct
 * places this points at, every one of them chosen by hand and checked by
 * `scripts/check-links.py`.
 */
function Figure({ value, label }: { value: string; label: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="font-medium text-foreground tabular-nums">{value}</span>{" "}
      {label}
    </span>
  );
}

export function StatsLine({
  stats,
  className,
  align = "start",
}: {
  stats: SiteStats;
  className?: string;
  /** The hero centres it; every other placement reads as a left-aligned line. */
  align?: "start" | "center";
}) {
  return (
    <p
      className={className}
      // A list of facts about one thing, read as a sentence. The separators are
      // decoration, so they are hidden rather than announced.
    >
      <span
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground",
          align === "center" && "justify-center",
        )}
      >
        <Figure value={formatCount(stats.topics)} label="topics" />
        <span aria-hidden>·</span>
        <Figure value={formatCount(stats.subsections)} label="subsections" />
        <span aria-hidden>·</span>
        <Figure value={formatCount(stats.links)} label="curated links" />
        <span aria-hidden>·</span>
        <Figure value={formatHours(stats.minutes)} label="of reading" />
      </span>
    </p>
  );
}
