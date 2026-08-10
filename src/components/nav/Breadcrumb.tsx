import Link from "next/link";

import { TopicTitle } from "@/components/nav/TopicTitle";

/**
 * `Frontend › JavaScript › Event Loop` — PRD §5, "each level tappable".
 *
 * One per page, at the top, which is why this is a real `<nav>` landmark
 * (unlike the plain-text crumb in `SearchResults`, where a list of twenty
 * results would hand a screen reader twenty landmarks).
 *
 * The last crumb is the page you are on: rendered as text, not a link to
 * itself. It stays in the trail because the trail is orientation — on a phone,
 * three levels down, it is the only thing on screen that says where you are.
 */
export type Crumb = { label: string; href?: string };

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
        {trail.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden>›</span> : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                <TopicTitle>{crumb.label}</TopicTitle>
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                <TopicTitle>{crumb.label}</TopicTitle>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
