import { Breadcrumb, type Crumb } from "@/components/nav/Breadcrumb";
import { TopicTitle } from "@/components/nav/TopicTitle";
import { CoveredToggle } from "@/components/progress/CoveredToggle";
import { Page } from "@/components/shell/Page";
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
    <Page wide>
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

      {/* One grid, two placements. Below `xl` the aside is the second row and
          reads exactly as it always has: prose, rule, links. At `xl` the same
          markup becomes a sticky column beside the prose, so the reading
          measure stays put and the links are in view while you read.
          One instance either way — two would duplicate every link for a
          screen reader. */}
      {/* The prose column takes the leftover space but stops at 54rem. Past
          that the extra width becomes gap, not line length — which is the
          point of a rail: the links go to the edge of the window, the text
          stays a comfortable measure. */}
      <div className="grid gap-x-10 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start xl:gap-x-12 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 xl:col-start-1 xl:row-start-1 xl:max-w-[54rem]">
          <TopicBody body={topic.body} />
        </div>

        {/* PRD §5 — resources and related links are never written in the body.
            They come from frontmatter and are rendered here, which is what
            keeps every page the same shape. */}
        <aside
          aria-label="Actions and links"
          className="mt-10 space-y-6 border-t border-border pt-6 xl:sticky xl:top-6 xl:col-start-2 xl:row-start-1 xl:mt-0 xl:border-t-0 xl:pt-0"
        >
          <ResourceList resources={topic.resources} />
          <RelatedTopics slugs={topic.related} />
          <LookItUp topic={topic} sectionTitle={sectionTitle} />
        </aside>

        {/* Source order is the §5 block order — prose, links, prev/next — so
            the small-screen page is unchanged. The placement classes only
            move the aside sideways at `xl`. */}
        <div className="mt-10 space-y-10 xl:col-start-1 xl:row-start-2 xl:max-w-[54rem]">
          {/* After the reading, before the way out. Marking is the last thing
              you do on the page, and prev/next is what you do after that. */}
          <CoveredToggle slug={topic.slug} />
          <PrevNext previous={previous} next={next} />
        </div>
      </div>
    </Page>
  );
}
