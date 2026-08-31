import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionCard } from "@/components/home/SectionCard";
import { PageHeader } from "@/components/nav/PageHeader";
import { Page } from "@/components/shell/Page";
import { buttonVariants } from "@/components/ui/button";
import { getSections } from "@/lib/content";

/**
 * The 404.
 *
 * Without this file Next renders its own — black text on white, outside the
 * root layout's shell, with no wordmark and no way back but the browser button.
 * That was the worst page on the site and every mistyped or moved URL landed on
 * it. Being a route in `app/`, this one is wrapped by the layout, so the rail
 * and the search come with it.
 *
 * It lists the eight sections rather than apologising in a sentence. Someone
 * who reaches a 404 here was looking for something specific and is one slug
 * away from it; the map is the most useful thing to hand them.
 */
export default function NotFound() {
  const sections = getSections();

  return (
    <Page>
      <PageHeader
        tone="section"
        className="py-8"
        lead="The URL doesn't match anything in the map. It may have been renamed — topics keep their slug when they move, but not when they are rewritten."
      >
        That page isn&rsquo;t here
      </PageHeader>

      <div className="flex flex-wrap gap-3 pb-8">
        <Link href="/map" className={buttonVariants({ variant: "brand" })}>
          Browse the map
          <ArrowRight aria-hidden />
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
      </div>

      <p className="pb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Or start from a subject
      </p>
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.slug}>
            <SectionCard section={section} />
          </li>
        ))}
      </ul>
    </Page>
  );
}
