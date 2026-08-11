"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { SectionCard } from "@/components/home/SectionCard";
import { SearchResults } from "@/components/home/SearchResults";
import { Input } from "@/components/ui/input";
import { searchTopics } from "@/lib/search";
import type { Section, SearchEntry } from "@/lib/types";

/**
 * The home screen body — PRD §4 ①.
 *
 * The only stateful thing on the page: an empty query shows the section list,
 * a non-empty one replaces it with results. Browsing is for discovering what
 * you didn't know was there; search is for the concept you already know the
 * name of.
 *
 * No debounce. The index is a few KB and the match is a substring scan, so the
 * work per keystroke is far below a frame — a debounce would only add latency
 * to the thing PRD §7 asks to be fast.
 */
export function SectionList({
  sections,
  index,
}: {
  sections: Section[];
  index: SearchEntry[];
}) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const results = useMemo(
    () => (trimmed ? searchTopics(index, trimmed) : []),
    [index, trimmed],
  );

  return (
    <>
      {/* `top-12` clears the mobile top bar, which is sticky at the same edge.
          On `lg` the rail replaces that bar, so the offset goes away. */}
      <div className="sticky top-12 z-10 bg-background pb-3 lg:top-0">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search every topic…"
            aria-label="Search every topic"
            className="h-11 pl-9"
          />
        </div>
      </div>

      {trimmed ? (
        <SearchResults results={results} query={trimmed} />
      ) : (
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.slug}>
              <SectionCard section={section} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
