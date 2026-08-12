/**
 * Search index construction — the server half.
 *
 * Reads the tree and flattens it into the rows a result list renders. Kept
 * separate from `search.ts` because that module is imported by a client
 * component: if the matcher and the builder shared a file, this file's
 * `node:fs` import would follow it into the browser bundle and fail the build.
 *
 * Titles, summaries and tags only — not body text. PRD §9 leaves the body-text
 * question open ("more useful and makes the index much bigger"), and §4 asks
 * only for titles and summaries, so the smaller index ships and the question
 * stays open.
 *
 * The result is served as a static `/search-index.json` route and fetched by the
 * command palette on first open, rather than serialised into every page's props.
 * That switch happened when the tree passed a couple of hundred topics: at 573
 * it is ~227KB, which is worth one fetch behind a ⌘K press and is not worth
 * shipping inside the payload of every page that renders the shell.
 */

import {
  SHARED_SECTION_TITLE,
  getSections,
  getSharedTopics,
} from "@/lib/content";
import type { SearchEntry } from "@/lib/types";

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const section of getSections()) {
    for (const subsection of section.subsections) {
      for (const topic of subsection.topics) {
        entries.push({
          slug: topic.slug,
          title: topic.title,
          summary: topic.summary,
          tags: topic.tags,
          level: topic.level,
          minutes: topic.minutes,
          shared: false,
          sectionTitle: section.title,
          subsectionTitle: subsection.title,
        });
      }
    }
  }

  for (const topic of getSharedTopics()) {
    entries.push({
      slug: topic.slug,
      title: topic.title,
      summary: topic.summary,
      tags: topic.tags,
      level: topic.level,
      minutes: topic.minutes,
      shared: true,
      sectionTitle: SHARED_SECTION_TITLE,
      subsectionTitle: "",
    });
  }

  return entries;
}
