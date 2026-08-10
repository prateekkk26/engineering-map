import Link from "next/link";

import { TopicTitle } from "@/components/nav/TopicTitle";
import { TopicChips } from "@/components/topic/TopicChips";
import type { Topic } from "@/lib/types";

/**
 * One row of the subsection page — PRD §4 ③: "topic title, its one-line
 * summary, and small chips for level and estimated read time."
 *
 * Every row here is a link. Unlike a planned subsection, a topic in this list
 * exists on disk: CONVENTIONS §7 makes frontmatter-plus-resources with an empty
 * body a legitimate state, and that page still has a "Start here" link on it,
 * so it is not a dead end.
 */
export function TopicRow({ topic }: { topic: Topic }) {
  return (
    <Link
      href={`/${topic.slug}`}
      className="block rounded-lg p-4 outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <h2 className="font-medium leading-snug">
        <TopicTitle>{topic.title}</TopicTitle>
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {topic.summary}
      </p>
      <div className="mt-2">
        <TopicChips
          level={topic.level}
          minutes={topic.minutes}
          shared={topic.shared}
        />
      </div>
    </Link>
  );
}
