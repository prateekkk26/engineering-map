import type { Metadata } from "next";

import { SectionList } from "@/components/home/SectionList";
import { PageHeader } from "@/components/nav/PageHeader";
import { Page } from "@/components/shell/Page";
import { getSections } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { buildSearchIndex } from "@/lib/search-index";
import { formatCount, getSiteStats } from "@/lib/stats";

/**
 * The browsable index — everything, in one list, with the rail beside it.
 *
 * This is what home used to be, and it is still the right page: a search field
 * and eight section cards, reachable in one tap from anywhere. What changed is
 * that it no longer has to double as the thing that explains the site to a
 * stranger, so it can go back to being a list.
 *
 * It carries the navigation rail because it is part of the map. `/` does not —
 * see the note in `AppShell`.
 */
export const metadata: Metadata = pageMetadata({
  title: "Browse the map",
  description:
    "Every section, subsection and topic in the map — or search all of it.",
  path: "/map",
});

export default function MapPage() {
  const sections = getSections();
  const index = buildSearchIndex();
  const stats = getSiteStats();

  return (
    <Page>
      <PageHeader
        tone="section"
        className="py-6"
        lead={`${formatCount(stats.topics)} topics across ${formatCount(
          stats.sections,
        )} sections. Pick a subject, or search for the one you already know the name of.`}
      >
        Browse the map
      </PageHeader>

      <SectionList sections={sections} index={index} />
    </Page>
  );
}
