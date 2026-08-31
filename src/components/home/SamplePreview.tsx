import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { TopicTitle } from "@/components/nav/TopicTitle";
import { Prose } from "@/components/topic/TopicBody";
import { TopicChips } from "@/components/topic/TopicChips";
import { getTopic } from "@/lib/content";
import { splitBody, LEAD_HEADING } from "@/lib/topic-body";

/**
 * One real topic page, shown rather than described.
 *
 * The pitch for this site is the writing, and no amount of copy about the
 * writing is as convincing as a paragraph of it. So this renders an actual
 * topic — its title, chips, and its "In one line" block, straight out of
 * `docs/` at build time. Nothing here is a mock-up, which is also why it cannot
 * drift: rewrite the topic and this changes with it.
 *
 * Deliberately the lead block and not the whole body. The point is a taste of
 * the register, and the link below it is how you get the rest.
 */
const SAMPLE_SLUG = "ai/agents/the-agent-loop";

export function SamplePreview() {
  const topic = getTopic(SAMPLE_SLUG);
  // A missing sample is a content change, not an outage — the section drops out
  // rather than failing the build, because home has to render either way.
  if (!topic) return null;

  const lead = splitBody(topic.body).find(
    (block) => block.heading === LEAD_HEADING,
  );
  if (!lead) return null;

  return (
    <section aria-labelledby="sample" className="py-16">
      <h2 id="sample" className="text-2xl font-medium tracking-tight">
        This is what a page looks like
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Not a summary of a summary. Every topic opens with one sentence that
        commits to an answer, then says why it matters and where to read more.
      </p>

      <div className="mt-6 rounded-lg bg-background p-6 ring-1 ring-border">
        <h3 className="text-lg leading-snug font-medium tracking-tight">
          <TopicTitle>{topic.title}</TopicTitle>
        </h3>
        <div className="mt-2">
          <TopicChips
            level={topic.level}
            minutes={topic.minutes}
            shared={topic.shared}
          />
        </div>

        <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {LEAD_HEADING}
        </p>
        <div className="mt-1">
          <Prose markdown={lead.markdown} lead />
        </div>

        <Link
          href={`/${topic.slug}`}
          className="mt-4 inline-flex items-center gap-1 rounded text-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          Read the rest
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
