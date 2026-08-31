import Link from "next/link";
import { Github } from "lucide-react";

import { Logo } from "@/components/shell/Logo";
import { LikeButton } from "@/components/stats/LikeButton";
import { VisitorCount } from "@/components/stats/VisitorCount";
import { SupportCta } from "@/components/support/SupportCta";
import { LIKES_ENABLED, PROGRESS_ENABLED, VISITORS_ENABLED } from "@/lib/flags";
import { cn } from "@/lib/utils";

const REPO = "https://github.com/prateekkk26/engineering-map";

/**
 * The site footer — a real `<footer>`, under the content.
 *
 * It used to be one line inside the navigation rail: "Created by Prateek
 * Rawat". That put the only statement of what this is and who made it in a
 * column of chrome, and on a phone it was reachable only by opening the drawer.
 *
 * It renders on every page because that is what a footer is, but it stays
 * small. Per PRD §10 the topic page carries no counter and no support ask, and
 * those live in the blocks home and `/about` add around this — not here.
 */
export function SiteFooter({
  wide = false,
  className,
}: {
  /** Match the topic page's wider container. See `Page`. */
  wide?: boolean;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        "mx-auto w-full max-w-4xl px-4 pb-10",
        wide && "xl:max-w-none xl:px-8 2xl:max-w-[104rem]",
        className,
      )}
    >
      <div className="flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded font-medium text-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo className="size-4" />
            Engineering Map
          </Link>
          <p className="mt-1 max-w-sm leading-relaxed">
            A knowledge map for senior engineering interviews. Built by Prateek
            Rawat.
          </p>

          {/* The two public numbers and the support line, together and quiet.
              PRD §10 puts them here and on the landing page, and nowhere near a
              topic page. Each renders nothing when its flag is off or its
              backing service is unreachable, so this row can be empty. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {VISITORS_ENABLED ? <VisitorCount /> : null}
            {LIKES_ENABLED ? <LikeButton className="-mx-2 text-xs" /> : null}
            <SupportCta variant="inline" />
          </div>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link
            href="/about"
            className="rounded outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            About
          </Link>
          {PROGRESS_ENABLED ? (
            <Link
              href="/progress"
              className="rounded outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Progress
            </Link>
          ) : null}
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Github className="size-3.5" aria-hidden />
            Source
          </a>
        </nav>
      </div>
    </footer>
  );
}
