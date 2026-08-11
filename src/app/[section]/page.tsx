import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { SubsectionRow } from "@/components/section/SubsectionRow";
import { Page } from "@/components/shell/Page";
import {
  getSection,
  getSections,
  getSubsectionCounts,
  getSubsectionTopics,
} from "@/lib/content";

/**
 * ② Section — PRD §4, "what's inside this subject?"
 *
 * "Breadcrumb, section title and description, then a list of subsections. Each
 * row: title, one-line description, topic count." Nothing else — no topic
 * previews, no search box. Search lives on the home page because it spans the
 * whole tree; scoping a second one to this section would be a different tool
 * wearing the same clothes.
 */
type Params = { section: string };

export function generateStaticParams(): Params[] {
  // Unspecified sections are excluded rather than rendered empty: the home page
  // already declines to link them, so a prerendered page for one would exist
  // only to be reachable by typing the URL.
  return getSections()
    .filter((section) => section.specified)
    .map((section) => ({ section: section.slug }));
}

/**
 * `true`, deliberately — and it has to be a literal, so this cannot be
 * environment-conditional.
 *
 * `false` is the tempting choice: every URL is known at build time, so anything
 * else could be rejected without rendering. It breaks development. The dev
 * server evaluates `generateStaticParams` once and reuses the result, so a
 * topic file written after startup is refused before the page runs — a full
 * reload of the new URL works while a click from the section page 404s, which
 * reads as a broken app rather than a stale process.
 *
 * Nothing is lost by allowing the render: the route resolves the slug against
 * `docs/` and calls `notFound()` when it does not exist, so an unknown URL is
 * still a 404. It just costs one render to say so.
 */
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const section = getSection((await params).section);
  if (!section) return {};
  return {
    title: `${section.title} — Engineering Map`,
    description: section.description,
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const section = getSection((await params).section);
  if (!section || !section.specified) notFound();

  return (
    <Page>
      <Breadcrumb
        trail={[
          { label: "Engineering Map", href: "/" },
          { label: section.title },
        ]}
      />

      <header className="pb-6">
        <h1 className="text-2xl leading-tight font-medium tracking-tight text-balance">
          {section.title}
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {section.description}
        </p>
      </header>

      <ul className="space-y-2">
        {section.subsections.map((subsection) => {
          // Both counts include the `_shared/` topics surfaced into the
          // subsection, because those are rows the reader will see there — a
          // "0 topics" label on a page that lists two is just wrong.
          const { written, planned } = getSubsectionCounts(subsection);
          // Same reason the counts include them: a surfaced `_shared/` topic is
          // a row on that page, so it belongs in both sides of the progress
          // fraction. Its slug is outside the subsection's prefix, so it has to
          // travel as a list.
          const sharedSlugs = getSubsectionTopics(subsection)
            .filter((topic) => topic.shared)
            .map((topic) => topic.slug);
          return (
            <li key={subsection.slug}>
              <SubsectionRow
                subsection={subsection}
                written={written}
                planned={planned}
                sharedSlugs={sharedSlugs}
              />
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
