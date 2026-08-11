import type { Metadata } from "next";

import { Breadcrumb } from "@/components/nav/Breadcrumb";
import {
  ProgressOverview,
  type SectionProgress,
} from "@/components/progress/ProgressOverview";
import { Page } from "@/components/shell/Page";
import { getSections, getSharedTopics } from "@/lib/content";

/**
 * The one place that answers "how far in am I, and how much is left?"
 *
 * It is not a dashboard on the home page: PRD §4 ① keeps home to a wordmark, a
 * search box and the section list, and §7's test for anything new there is
 * whether it helps you read and find things faster. A progress summary does
 * not — it is something you go and look at, so it gets its own route and the
 * home page stays a list.
 *
 * Every number below is counted from `docs/` at build time. The reader's side
 * of the fraction is read from `localStorage` in the client component; nothing
 * about what has been covered exists in the prerendered HTML.
 */
export const metadata: Metadata = {
  title: "Progress — Engineering Map",
  description: "How much of the map you've covered, and what's left.",
};

export default function ProgressPage() {
  const sections = getSections();

  const rows: SectionProgress[] = sections.map((section) => ({
    slug: section.slug,
    title: section.title,
    written: section.topicCount,
    planned: section.plannedCount,
    minutes: section.subsections.reduce(
      (total, subsection) =>
        total +
        subsection.topics.reduce((sum, topic) => sum + topic.minutes, 0),
      0,
    ),
    specified: section.specified,
  }));

  // `_shared/` topics are not in any section's count (they are not in a
  // section), but they are pages you read and can mark — so the overall
  // denominator has to include them or covering one would count against a
  // total that never knew about it.
  const shared = getSharedTopics();

  const totals = rows.reduce(
    (sum, row) => ({
      written: sum.written + row.written,
      planned: sum.planned + row.planned,
      minutes: sum.minutes + row.minutes,
    }),
    {
      written: shared.length,
      planned: shared.length,
      minutes: shared.reduce((sum, topic) => sum + topic.minutes, 0),
    },
  );

  return (
    <Page>
      <Breadcrumb
        trail={[{ label: "Engineering Map", href: "/" }, { label: "Progress" }]}
      />

      <header className="pb-6">
        <h1 className="text-2xl leading-tight font-medium tracking-tight">
          Progress
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          A topic counts as covered when you mark it on its page — after
          reading it, and only if you could hold it up under follow-up.
        </p>
      </header>

      <ProgressOverview sections={rows} totals={totals} />
    </Page>
  );
}
