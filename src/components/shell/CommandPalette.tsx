"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { Search } from "lucide-react";

import { TopicTitle } from "@/components/nav/TopicTitle";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { searchTopics } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { SearchEntry } from "@/lib/types";

/**
 * ⌘K search, on every page.
 *
 * PRD §4 calls search "the primary navigation path for anything you're looking
 * for on purpose", but until now it existed only on the home page — three taps
 * away from wherever you were reading. This is the same matcher
 * (`searchTopics`) over the same index, reachable from anywhere.
 *
 * **The index is fetched, not shipped.** The home page can afford to serialise
 * it into its props; the root layout cannot, because that would add ~70 KB of
 * summaries to all 359 prerendered pages to serve a box most of them never
 * open. It is fetched once on first open from the static
 * `/search-index.json` and kept for the rest of the session.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [index, setIndex] = useState<SearchEntry[]>();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // ⌘K anywhere. Also Ctrl-K, because the same map gets read on a Linux
  // machine, and `/` is deliberately not bound — it would swallow the
  // character in the home page's own search box.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    fetch("/search-index.json")
      .then((response) => response.json())
      .then((data: SearchEntry[]) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        // Leaves the palette in its "still loading" state rather than
        // asserting "no topics match", which would be a lie about the content.
      });
    return () => {
      cancelled = true;
    };
  }, [open, index]);

  const trimmed = query.trim();
  const results = useMemo(
    () => (index && trimmed ? searchTopics(index, trimmed).slice(0, 50) : []),
    [index, trimmed],
  );

  // Keep the highlighted row visible while arrowing past the fold.
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (entry: SearchEntry | undefined) => {
    if (!entry) return;
    onOpenChange(false);
    setQuery("");
    router.push(`/${entry.slug}`);
  };

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) =>
        results.length === 0 ? 0 : (i - 1 + results.length) % results.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-[10vh] left-1/2 z-50 flex max-h-[70vh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-border outline-none"
        >
          <Dialog.Title className="sr-only">Search every topic</Dialog.Title>

          <div className="relative border-b border-border">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                // Reset the highlight here rather than in an effect on
                // `query`: typing is the only thing that reorders the list.
                setActive(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search every topic…"
              aria-label="Search every topic"
              className="h-12 rounded-none border-0 pl-9 focus-visible:ring-0"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {!trimmed ? (
              <p className="p-4 text-sm text-muted-foreground">
                Type to search titles, summaries and tags. ↑↓ to move, ↵ to
                open, esc to close.
              </p>
            ) : !index ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : results.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No topics match “{trimmed}”.
              </p>
            ) : (
              <ul ref={listRef} role="listbox" aria-label="Search results">
                {results.map((entry, i) => (
                  <li
                    key={entry.slug}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(entry)}
                    className={cn(
                      "cursor-pointer rounded-lg p-3",
                      i === active && "bg-accent",
                    )}
                  >
                    <p className="text-xs text-muted-foreground">
                      {entry.sectionTitle}
                      {entry.subsectionTitle ? ` › ${entry.subsectionTitle}` : ""}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug font-medium">
                      <TopicTitle>{entry.title}</TopicTitle>
                      {entry.shared ? (
                        <Badge variant="secondary" className="ml-2 align-middle">
                          shared
                        </Badge>
                      ) : null}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {entry.summary}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
