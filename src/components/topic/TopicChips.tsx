import { Badge } from "@/components/ui/badge";
import type { Level } from "@/lib/types";

/**
 * The two chips PRD §4 ③ and §5 ask for: level, and estimated read time.
 *
 * `core` is outlined and `deep` is filled, so the differentiator topics are the
 * ones that catch the eye in a list of twenty. Read time is plain text rather
 * than a third badge — it is a number, not a category, and PRD §7 wants the
 * icon-and-chip vocabulary small.
 *
 * `minutes: 0` renders nothing. CONVENTIONS §2 requires the field, but a topic
 * mid-authoring can carry a placeholder, and "0 min" is a worse lie than
 * silence.
 */
export function TopicChips({
  level,
  minutes,
  shared = false,
}: {
  level: Level;
  minutes: number;
  shared?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <Badge variant={level === "deep" ? "default" : "outline"}>{level}</Badge>
      {minutes > 0 ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          {minutes} min
        </span>
      ) : null}
      {/* PRD §4 ③ — a `_shared/` topic surfaced into this list lives elsewhere
          on disk, and the marker is what makes the shared URL unsurprising. */}
      {shared ? <Badge variant="secondary">shared</Badge> : null}
    </span>
  );
}
