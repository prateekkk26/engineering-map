import { createElement } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { iconFor } from "@/lib/icons";
import { surface } from "@/lib/interactive";
import type { Section } from "@/lib/types";

/**
 * The eight sections, as the landing page's way in.
 *
 * A grid here and a list on `/map`, which looks like a contradiction with PRD
 * §7's "lists, not grids" and is the same exemption §10 grants home. The reason
 * §7 prefers lists is that they read better, and reading is what `/map` is for.
 * This is a chooser: eight peers, scanned rather than read, and eight full-width
 * rows on a landing page is a page of scrolling before anyone sees what else is
 * on it.
 *
 * Each card links straight into its section, so the landing is not a dead end
 * that only offers one door.
 */
export function SectionGrid({ sections }: { sections: Section[] }) {
  return (
    <section aria-labelledby="sections" className="mx-auto w-full max-w-5xl px-5 py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="sections" className="text-2xl font-medium tracking-tight">
          Eight subjects, {sections.length === 8 ? "start anywhere" : "pick one"}
        </h2>
        <Link
          href="/map"
          className={buttonVariants({ variant: "link", size: "sm" })}
        >
          Browse everything
          <ArrowRight aria-hidden />
        </Link>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <li key={section.slug}>
            <Link
              href={`/${section.slug}`}
              className={surface({
                level: "card",
                className: "group h-full",
              })}
            >
              {createElement(iconFor(section.icon), {
                className: "size-5 text-brand",
                "aria-hidden": true,
              })}
              <h3 className="mt-3 font-medium leading-snug">{section.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {section.description}
              </p>
              <p className="mt-3 text-xs text-muted-foreground tabular-nums">
                {section.subsections.length} subsections ·{" "}
                {section.topicCount} topics
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
