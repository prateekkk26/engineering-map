/**
 * Search matching — the client half.
 *
 * This module is imported by a client component, so it must stay free of
 * anything that touches the filesystem. Building the index is the server's job
 * and lives in `search-index.ts`; keeping the two apart is what stops
 * `node:fs` being dragged into the browser bundle through this import chain.
 *
 * PRD §4: search "filters across every topic title and summary in the tree, so
 * a concept you already know the name of is one search away instead of three
 * taps". It is the primary navigation path for anything you are looking for on
 * purpose.
 */

import type { SearchEntry } from "@/lib/types";

/**
 * Case-insensitive substring match, no fuzzy library.
 *
 * Every term must match somewhere in the entry, so "react state" narrows rather
 * than widens. Ranking is title-before-summary, then alphabetical — enough
 * structure to put the obvious hit first without pretending to be a real
 * search engine.
 */
export function searchTopics(
  index: readonly SearchEntry[],
  query: string,
): SearchEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { entry: SearchEntry; score: number }[] = [];

  for (const entry of index) {
    const title = entry.title.toLowerCase();
    const haystack = [
      title,
      entry.summary.toLowerCase(),
      entry.tags.join(" ").toLowerCase(),
      // The path is searchable too, so "javascript event" finds the topic even
      // though "javascript" appears in neither its title nor its summary.
      entry.slug.toLowerCase(),
    ].join(" ");

    if (!terms.every((term) => haystack.includes(term))) continue;

    const inTitle = terms.filter((term) => title.includes(term)).length;
    scored.push({ entry, score: inTitle });
  }

  return scored
    .sort(
      (a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title),
    )
    .map(({ entry }) => entry);
}
