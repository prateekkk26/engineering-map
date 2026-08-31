"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

const KEY = "engineering-map.liked.v1";

/**
 * Whether this browser has already clicked, as an external store.
 *
 * `useSyncExternalStore` rather than reading storage in an effect and calling
 * `setState`: the server has no `localStorage`, so the value has to come from a
 * snapshot pair — and the effect version is what the compiler's
 * `set-state-in-effect` rule exists to catch. `src/lib/progress.ts` reaches for
 * the same hook for the same reason.
 */
let liked = false;
let hydrated = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): boolean {
  if (!hydrated) {
    hydrated = true;
    try {
      liked = window.localStorage.getItem(KEY) === "1";
    } catch {
      // Private mode, or storage disabled. The button still works; it just
      // will not remember across reloads, which is the right degradation.
    }
  }
  return liked;
}

/** Frozen `false` on the server, so the prerendered HTML claims nothing. */
const getServerSnapshot = () => false;

function remember() {
  liked = true;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {}
  for (const listener of listeners) listener();
}

/**
 * One count for the whole site.
 *
 * Not labelled "Like": that word imports a social-media frame a reference site
 * does not want, and there is nothing here to be popular. It is a show of hands
 * for whether any of this was worth reading, and it is the only number a reader
 * can add to.
 *
 * It renders `null` until the count arrives and `null` forever if the route
 * says the store is unavailable — no skeleton, no error text, no retry. A
 * missing vanity counter should be indistinguishable from a page that never had
 * one.
 *
 * Per PRD §10 this appears in the footer and on the landing page, and never on
 * a topic page.
 */
export function LikeButton({ className }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null);
  const hasLiked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/likes")
      .then((response) => response.json())
      .then((data: { ok: boolean; count: number | null }) => {
        if (!cancelled && data.ok && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const onClick = useCallback(() => {
    if (hasLiked) return;
    remember();
    // Optimistic: the response reconciles it, and if the request fails the
    // reader has already been told their click landed. Overstating a vanity
    // count by one is a better failure than a button that appears to do
    // nothing.
    setCount((current) => (current === null ? current : current + 1));

    fetch("/api/likes", { method: "POST" })
      .then((response) => response.json())
      .then((data: { ok: boolean; count: number | null }) => {
        if (data.ok && typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {});
  }, [hasLiked]);

  if (count === null) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={hasLiked}
      aria-label={`${count} ${count === 1 ? "person" : "people"} found this useful${
        hasLiked ? ", including you" : ""
      }`}
      title={hasLiked ? "Thanks" : "Found this useful?"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring",
        hasLiked ? "text-brand" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Heart
        className="size-4"
        fill={hasLiked ? "currentColor" : "none"}
        aria-hidden
      />
      <span className="tabular-nums">{count.toLocaleString("en-US")}</span>
      <span className="sr-only sm:not-sr-only">found this useful</span>
    </button>
  );
}
