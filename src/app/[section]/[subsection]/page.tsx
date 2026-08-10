import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { TopicRow } from "@/components/subsection/TopicRow";
import { TopicView } from "@/components/topic/TopicView";
import {
  SHARED_SECTION_TITLE,
  getSection,
  getSections,
  getSharedTopics,
  getSubsection,
  getSubsectionCounts,
  getSubsectionTopics,
  getTopic,
} from "@/lib/content";
import { plainTitle } from "@/lib/topic-body";
import type { Topic } from "@/lib/types";

/**
 * ③ Subsection — PRD §4, "which concept do I want?" — plus one special case.
 *
 * **The `_shared/` case.** A shared topic's slug is `_shared/caching`, and PRD
 * §6 makes path map directly to route with "no route table to maintain". That
 * URL has two segments, so it lands here rather than on the topic route. It
 * cannot have its own `app/_shared/` folder either: Next treats a leading
 * underscore on a literal folder as "private, excluded from routing".
 *
 * So this route renders a topic when the first segment is `_shared`, and a
 * subsection otherwise. The alternative — rewriting shared slugs to some
 * `/shared/...` URL — would mean the topic's identity (CONVENTIONS §1, what
 * Phase 5 progress keys off) and its address stop matching, which is a worse
 * trade than one branch here.
 */
type Params = { section: string; subsection: string };

const SHARED = "_shared";

export function generateStaticParams(): Params[] {
  const params: Params[] = [];

  for (const section of getSections()) {
    for (const subsection of section.subsections) {
      // Skip subsections with nothing in them. The section page renders those
      // rows unlinked, so the page would be unreachable except by URL.
      if (getSubsectionTopics(subsection).length === 0) continue;
      params.push({
        section: section.slug,
        subsection: subsection.slug.split("/")[1],
      });
    }
  }

  for (const topic of getSharedTopics()) {
    params.push({ section: SHARED, subsection: topic.slug.split("/")[1] });
  }

  return params;
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
  const { section, subsection } = await params;

  if (section === SHARED) {
    const topic = getTopic(`${SHARED}/${subsection}`);
    return topic
      ? {
          title: `${plainTitle(topic.title)} — Engineering Map`,
          description: topic.summary,
        }
      : {};
  }

  const found = getSubsection(section, subsection);
  return found
    ? {
        title: `${found.title} — Engineering Map`,
        description: found.description,
      }
    : {};
}

/**
 * A shared topic rendered as a topic page.
 *
 * Its breadcrumb ends at "Shared Concepts" as plain text, not a link:
 * `_shared/` "never appears on the home screen" (SECTIONS.md), so there is no
 * index page for the crumb to point at. Prev/next walks the shared folder,
 * which is the only sequence a topic with several `surfaced_in` homes can have
 * that doesn't depend on which section you arrived from.
 */
function SharedTopicPage({ topic }: { topic: Topic }) {
  const siblings = getSharedTopics();
  const at = siblings.findIndex((sibling) => sibling.slug === topic.slug);

  return (
    <TopicView
      topic={topic}
      sectionTitle={SHARED_SECTION_TITLE}
      trail={[
        { label: "Engineering Map", href: "/" },
        { label: SHARED_SECTION_TITLE },
        { label: topic.title },
      ]}
      previous={at > 0 ? siblings[at - 1] : undefined}
      next={at >= 0 ? siblings[at + 1] : undefined}
    />
  );
}

export default async function SubsectionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { section: sectionSlug, subsection: subsectionSlug } = await params;

  if (sectionSlug === SHARED) {
    const topic = getTopic(`${SHARED}/${subsectionSlug}`);
    if (!topic) notFound();
    return <SharedTopicPage topic={topic} />;
  }

  const section = getSection(sectionSlug);
  const subsection = getSubsection(sectionSlug, subsectionSlug);
  if (!section || !subsection) notFound();

  const topics = getSubsectionTopics(subsection);
  const { written, planned } = getSubsectionCounts(subsection);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16">
      <Breadcrumb
        trail={[
          { label: "Engineering Map", href: "/" },
          { label: section.title, href: `/${section.slug}` },
          { label: subsection.title },
        ]}
      />

      <header className="pb-4">
        <h1 className="text-2xl leading-tight font-medium tracking-tight text-balance">
          {subsection.title}
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {subsection.description}
        </p>
        <p className="mt-2 text-xs text-muted-foreground tabular-nums">
          {written === planned
            ? `${written} ${written === 1 ? "topic" : "topics"}`
            : `${written} of ${planned} topics written`}
        </p>
      </header>

      <ul>
        {topics.map((topic) => (
          <li key={topic.slug}>
            <TopicRow topic={topic} />
          </li>
        ))}
      </ul>
    </main>
  );
}
