import Link from "next/link";

import { TopicTitle } from "@/components/nav/TopicTitle";
import { Badge } from "@/components/ui/badge";
import type { SearchEntry } from "@/lib/types";

/**
 * Search results.
 *
 * The breadcrumb here is plain text, not the shadcn `Breadcrumb` component:
 * that renders a `<nav>` per instance, and a list of twenty results would hand
 * a screen reader twenty navigation landmarks. Breadcrumb proper belongs on the
 * section and topic pages, where there is one per page.
 */
export function SearchResults({
  results,
  query,
}: {
  results: SearchEntry[];
  query: string;
}) {
  if (results.length === 0) {
    return (
      <p className="px-1 py-8 text-sm text-muted-foreground">
        No topics match “{query}”.
      </p>
    );
  }

  return (
    <>
      <p className="px-1 pb-1 text-xs text-muted-foreground tabular-nums">
        {results.length} {results.length === 1 ? "topic" : "topics"}
      </p>
      <ul className="space-y-1">
        {results.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/${entry.slug}`}
              className="block rounded-lg p-4 outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="text-xs text-muted-foreground">
                {entry.sectionTitle}
                {entry.subsectionTitle ? ` › ${entry.subsectionTitle}` : ""}
              </p>
              <p className="mt-1 font-medium leading-snug">
                <TopicTitle>{entry.title}</TopicTitle>
                {/* `_shared/` topics live once on disk and surface in several
                    sections, so the marker says where this one actually is
                    (PRD §4 ③). */}
                {entry.shared ? (
                  <Badge variant="secondary" className="ml-2 align-middle">
                    shared
                  </Badge>
                ) : null}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {entry.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
