import Link from "next/link";

import { TopicTitle } from "@/components/nav/TopicTitle";
import { resolveRelated } from "@/lib/content";

/**
 * PRD §5 — "internal links to siblings and across sections, so `Caching` in
 * Backend can point at `HTTP Caching` in Frontend".
 *
 * The tree is deliberately ahead of the writing, so roughly half of these
 * slugs point at topics that do not exist yet. Those render as muted text with
 * their slug's last segment humanised: still a signal that the concept is
 * coming, never a tap that lands on a 404.
 */
function humanise(slug: string): string {
  const name = slug.split("/").pop() ?? slug;
  return name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function RelatedTopics({ slugs }: { slugs: string[] }) {
  if (slugs.length === 0) return null;

  const related = resolveRelated(slugs);

  return (
    <section>
      <h2 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Related topics
      </h2>
      <ul>
        {related.map(({ slug, topic }) => (
          <li key={slug}>
            {topic ? (
              <Link
                href={`/${slug}`}
                className="block rounded-lg p-3 text-sm leading-snug outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <TopicTitle>{topic.title}</TopicTitle>
              </Link>
            ) : (
              <span className="block p-3 text-sm leading-snug text-muted-foreground">
                {humanise(slug)}
                <span className="ml-2 text-xs">not written yet</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
