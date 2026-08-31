"use client";

import Link from "next/link";
import { Github, Search } from "lucide-react";

import { Logo } from "@/components/shell/Logo";
import { PROGRESS_ENABLED } from "@/lib/flags";

const REPO = "https://github.com/prateekkk26/engineering-map";

/**
 * The landing page's header — what stands in for the navigation rail.
 *
 * The rail is a reading tool: 74 subsections, useful once you know what they
 * are. On the landing page it was a wall of unexplained vocabulary next to the
 * sentence explaining the site, so `AppShell` drops it here and this takes its
 * place: the wordmark, the two ways into the map, and the source.
 *
 * Search stays reachable — it is the same ⌘K palette the rest of the app uses,
 * opened through the state `AppShell` already owns, so there is one search on
 * the site and not two.
 */
export function LandingHeader({ onSearch }: { onSearch: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-5">
        <Link
          href="/"
          className="flex items-center gap-2 rounded font-medium tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo className="size-5 text-brand" />
          Engineering Map
        </Link>

        <nav
          aria-label="Main"
          className="ml-auto flex items-center gap-1 text-sm"
        >
          <button
            type="button"
            onClick={onSearch}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-muted-foreground outline-none hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-border px-1 font-sans text-[0.7rem] sm:inline">
              ⌘K
            </kbd>
          </button>

          {PROGRESS_ENABLED ? (
            <Link
              href="/progress"
              className="hidden rounded-lg px-2.5 py-1.5 text-muted-foreground outline-none hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:block"
            >
              Progress
            </Link>
          ) : null}

          <Link
            href="/about"
            className="hidden rounded-lg px-2.5 py-1.5 text-muted-foreground outline-none hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:block"
          >
            About
          </Link>

          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            aria-label="Source on GitHub"
            className="rounded-lg p-2 text-muted-foreground outline-none hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Github className="size-4" aria-hidden />
          </a>

          <Link
            href="/map"
            className="ml-1 rounded-lg bg-brand px-3 py-1.5 font-medium text-brand-foreground outline-none hover:bg-brand/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Browse
          </Link>
        </nav>
      </div>
    </header>
  );
}
