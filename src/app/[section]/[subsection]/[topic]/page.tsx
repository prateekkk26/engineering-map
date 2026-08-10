import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TopicView } from "@/components/topic/TopicView";
import {
  getSection,
  getSections,
  getSubsection,
  getSubsectionTopics,
  getTopic,
} from "@/lib/content";
import { plainTitle } from "@/lib/topic-body";

/**
 * ④ Topic — the terminal page. PRD §3: "There is no fifth level, and topics do
 * not nest."
 *
 * That rule is why this route is the deepest one in the app and why it has no
 * catch-all segment. A topic that outgrows its page becomes a sibling, not a
 * child, so a fourth dynamic segment would only ever match a mistake.
 *
 * The page shape itself lives in `TopicView`, shared with the `_shared/` case
 * one level up. This route resolves the slug and works out prev/next.
 */
type Params = { section: string; subsection: string; topic: string };

export function generateStaticParams(): Params[] {
  const params: Params[] = [];

  for (const section of getSections()) {
    for (const subsection of section.subsections) {
      // `subsection.topics`, not `getSubsectionTopics` — the surfaced
      // `_shared/` ones are rendered in the list here but live at their own
      // `_shared/...` URL, and prerendering them under a section path too
      // would give one topic two addresses.
      for (const topic of subsection.topics) {
        params.push({
          section: section.slug,
          subsection: subsection.slug.split("/")[1],
          topic: topic.slug.split("/")[2],
        });
      }
    }
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
  const { section, subsection, topic } = await params;
  const found = getTopic(`${section}/${subsection}/${topic}`);
  if (!found) return {};
  return {
    title: `${plainTitle(found.title)} — Engineering Map`,
    description: found.summary,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const {
    section: sectionSlug,
    subsection: subsectionSlug,
    topic: topicSlug,
  } = await params;

  const section = getSection(sectionSlug);
  const subsection = getSubsection(sectionSlug, subsectionSlug);
  const topic = getTopic(`${sectionSlug}/${subsectionSlug}/${topicSlug}`);
  if (!section || !subsection || !topic) notFound();

  // Walks the list the subsection page showed, shared topics included, so
  // "next" means the row under this one there.
  const siblings = getSubsectionTopics(subsection);
  const at = siblings.findIndex((sibling) => sibling.slug === topic.slug);

  return (
    <TopicView
      topic={topic}
      sectionTitle={section.title}
      trail={[
        { label: "Engineering Map", href: "/" },
        { label: section.title, href: `/${section.slug}` },
        { label: subsection.title, href: `/${subsection.slug}` },
        { label: topic.title },
      ]}
      previous={at > 0 ? siblings[at - 1] : undefined}
      next={at >= 0 ? siblings[at + 1] : undefined}
    />
  );
}
