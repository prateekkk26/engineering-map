import { Github } from "lucide-react";

/**
 * The credit line at the foot of the navigation rail.
 *
 * It sits in the rail rather than under the page so it is stated once, in a
 * column that is already chrome, instead of appearing again at the end of every
 * topic. `shrink-0` keeps it pinned below the tree — the tree is the scrolling
 * part of the rail, so a long content tree scrolls past this rather than
 * pushing it out of the viewport.
 */
export function SiteFooter() {
  return (
    <div className="shrink-0 border-t border-border px-5 py-3 text-xs text-muted-foreground">
      <p className="flex items-center gap-1.5">
        Created by <span className="text-foreground">Prateek Rawat</span>
        <a
          href="https://github.com/prateekkk26/engineering-map"
          target="_blank"
          rel="noreferrer"
          aria-label="Source on GitHub"
          className="rounded outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Github className="size-3.5 shrink-0" aria-hidden />
        </a>
      </p>
    </div>
  );
}
