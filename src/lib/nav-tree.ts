/**
 * The sidebar's view of `docs/` — every section, subsection and topic.
 *
 * A separate shape from `Section`/`Subsection`/`Topic` rather than the tree
 * itself, for one reason: the sidebar is a client component rendered in the
 * root layout, so whatever this returns is serialised into *every* page in the
 * app. `Topic` carries a body; 359 of them would put the entire knowledge base
 * in the payload of each of the 359 pages. This carries titles, slugs and
 * counts and nothing else.
 *
 * Even slim, that is roughly 40 KB of JSON per page (~10 KB over the wire).
 * Acceptable at this size and it buys a sidebar that needs no fetch. If the
 * tree doubles, move the topic level behind a static JSON file the way
 * `search-index.json` does.
 *
 * Ordering and counts are not recomputed here — they come from the loaders in
 * `content.ts`, so the rail, the subsection page and prev/next can never
 * disagree about what order the topics are in.
 */

import {
  getSections,
  getSharedTopics,
  getSubsectionCounts,
  getSubsectionTopics,
} from "@/lib/content";

export type NavTopic = {
  /** `frontend/javascript/event-loop` — also its href, minus the leading `/`. */
  slug: string;
  title: string;
  shared: boolean;
};

export type NavSubsection = {
  slug: string;
  title: string;
  /** Authored topics, `_shared/` inclusions counted. */
  written: number;
  /** Planned size from `_meta.yaml`. */
  planned: number;
  topics: NavTopic[];
};

export type NavSection = {
  slug: string;
  title: string;
  /** A lucide name, already validated by the loader against `icons.tsx`. */
  icon: string;
  /** False for the sections that have not been through Phase 2 at all. */
  specified: boolean;
  subsections: NavSubsection[];
};

export type NavTree = {
  sections: NavSection[];
  /**
   * `_shared/` topics, listed as their own group at the foot of the rail.
   *
   * They surface inside the subsections that name them, but they also live at
   * their own URL and belong to no section — before this group existed, the
   * only way to reach one directly was to search for it.
   */
  shared: NavTopic[];
};

function toNavTopic(slug: string, title: string, shared: boolean): NavTopic {
  return { slug, title, shared };
}

export function getNavTree(): NavTree {
  const sections = getSections().map<NavSection>((section) => ({
    slug: section.slug,
    title: section.title,
    icon: section.icon,
    specified: section.specified,
    subsections: section.subsections.map<NavSubsection>((subsection) => {
      const { written, planned } = getSubsectionCounts(subsection);
      return {
        slug: subsection.slug,
        title: subsection.title,
        written,
        planned,
        // The list the subsection page renders — its own topics followed by
        // the `_shared/` ones surfaced into it — so clicking down the rail
        // walks the same sequence prev/next does.
        topics: getSubsectionTopics(subsection).map((topic) =>
          toNavTopic(topic.slug, topic.title, topic.shared),
        ),
      };
    }),
  }));

  const shared = getSharedTopics().map((topic) =>
    toNavTopic(topic.slug, topic.title, true),
  );

  return { sections, shared };
}
