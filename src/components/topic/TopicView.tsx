import { Breadcrumb, type Crumb } from "@/components/nav/Breadcrumb";
import { TopicTitle } from "@/components/nav/TopicTitle";
import { LookItUp } from "@/components/topic/LookItUp";
import { PrevNext } from "@/components/topic/PrevNext";
import { RelatedTopics } from "@/components/topic/RelatedTopics";
import { ResourceList } from "@/components/topic/ResourceList";
import { TopicBody } from "@/components/topic/TopicBody";
import { TopicChips } from "@/components/topic/TopicChips";
import type { Topic } from "@/lib/types";

/**
 * The topic page contract — PRD §5, "every leaf page renders the same shape,
 * every time. Predictability is the feature."
 *
 * So the shape lives here rather than in the route, and both routes that can
 * render a topic (`/section/subsection/topic`, and `/_shared/topic` — see
 * `app/[section]/[subsection]/page.tsx`) go through it. Two copies of this
 * layout would drift, and the reader would learn two page shapes instead of
 * one.
 *
 * The block order is the table in §5: breadcrumb, title and chips, the prose
 * blocks, Actions & links, prev/next.
 */
export function TopicView({
  topic,
  trail,
  sectionTitle,
  previous,
  next,
}: {
  topic: Topic;
  trail: Crumb[];
  /** Used for the "Look it up" query — the browsing context, not the folder. */
  sectionTitle: string;
  previous?: Topic;
  next?: Topic;
}) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16">
      <Breadcrumb trail={trail} />

      <header className="pb-8">
        <h1 className="text-2xl leading-tight font-medium tracking-tight text-balance">
          <TopicTitle>{topic.title}</TopicTitle>
        </h1>
        <div className="mt-3">
          <TopicChips
            level={topic.level}
            minutes={topic.minutes}
            shared={topic.shared}
          />
        </div>
      </header>

      <TopicBody body={topic.body} />

      {/* One rule from §5 worth stating: resources and related links are never
          written in the body. They come from frontmatter and are rendered
          here, which is what keeps every page the same shape. */}
      <div className="mt-10 space-y-6 border-t border-border pt-6">
        <ResourceList resources={topic.resources} />
        <RelatedTopics slugs={topic.related} />
        <LookItUp topic={topic} sectionTitle={sectionTitle} />
      </div>

      <div className="mt-10">
        <PrevNext previous={previous} next={next} />
      </div>
    </main>
  );
}
