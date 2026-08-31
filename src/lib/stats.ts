import { getSections, getSharedTopics } from "@/lib/content";

/**
 * The map, in numbers — for the home page, `/about` and the OG image.
 *
 * Counted from the same loaders the pages use, so home cannot claim 573 topics
 * while the tree renders 570. Nothing here is a literal: adding a topic file
 * updates the headline, which is the only way a count on a public page stays
 * true.
 *
 * **Unique outbound URLs, not resource entries.** The same MDN page is cited by
 * several topics, and the larger number would be a claim about how much was
 * typed rather than about how much was curated. It is also the figure
 * `scripts/check-links.py` reports, so the two never disagree.
 *
 * No caching. `getSections()` and `getSharedTopics()` are already memoised in
 * production, so this is arithmetic over a tree that is already in memory.
 */
export type SiteStats = {
  sections: number;
  subsections: number;
  /** Authored topics, `_shared/` included. */
  topics: number;
  /** Distinct resource URLs across every topic. */
  links: number;
  /** Summed `minutes` frontmatter — the reading time of the whole map. */
  minutes: number;
};

export function getSiteStats(): SiteStats {
  const sections = getSections();
  const shared = getSharedTopics();

  const urls = new Set<string>();
  let topics = 0;
  let subsections = 0;
  let minutes = 0;

  const count = (topic: { minutes: number; resources: { url: string }[] }) => {
    topics += 1;
    minutes += topic.minutes;
    for (const resource of topic.resources) urls.add(resource.url);
  };

  for (const section of sections) {
    subsections += section.subsections.length;
    for (const subsection of section.subsections) {
      // `subsection.topics` and not `getSubsectionTopics()`: that merges in the
      // `_shared/` topics surfaced into the subsection, and a shared topic
      // surfaced into four of them would then be counted four times. They are
      // added once, below.
      for (const topic of subsection.topics) count(topic);
    }
  }
  for (const topic of shared) count(topic);

  return { sections: sections.length, subsections, topics, links: urls.size, minutes };
}

/** `1415` → `1,415`. The counts are large enough that grouping is not fussy. */
export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

/** Total reading time, at the altitude a headline wants: `191 hours`. */
export function formatHours(minutes: number): string {
  return `${Math.round(minutes / 60).toLocaleString("en-US")} hours`;
}
