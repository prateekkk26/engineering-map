import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { TopicTitle } from "@/components/nav/TopicTitle";
import type { Topic } from "@/lib/types";

/**
 * PRD §5 — "move through the subsection without going back up".
 *
 * The sequence is the subsection's display order (`getSubsectionTopics`), so
 * what "next" means here is exactly what the list above showed. It does not
 * roll over into the next subsection: `_meta.yaml`'s order is a reading order
 * *within* one coherent area, and silently crossing that boundary would make
 * the breadcrumb lie about where you are.
 */
export function PrevNext({
  previous,
  next,
}: {
  previous?: Topic;
  next?: Topic;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Topics in this subsection"
      className="flex items-stretch gap-2 border-t border-border pt-4"
    >
      {previous ? (
        <Link
          href={`/${previous.slug}`}
          rel="prev"
          className="flex flex-1 items-center gap-2 rounded-lg p-3 outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">
              Previous
            </span>
            <span className="block text-sm leading-snug font-medium">
              <TopicTitle>{previous.title}</TopicTitle>
            </span>
          </span>
        </Link>
      ) : (
        // Holds the column so a lone "Next" stays on the right, where it is on
        // every other page in the subsection.
        <span className="flex-1" />
      )}

      {next ? (
        <Link
          href={`/${next.slug}`}
          rel="next"
          className="flex flex-1 items-center justify-end gap-2 rounded-lg p-3 text-right outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Next</span>
            <span className="block text-sm leading-snug font-medium">
              <TopicTitle>{next.title}</TopicTitle>
            </span>
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </Link>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}
