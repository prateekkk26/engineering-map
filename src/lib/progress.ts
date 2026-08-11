"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reader progress — PRD §9, Phase 5, in its first and smallest form.
 *
 * One bit per topic: *I have understood this thoroughly*. Set by hand, never
 * inferred. Opening a page, scrolling it, or clicking a resource does not mark
 * anything — the whole point of the checkbox is that it means something, and it
 * only means something if nothing else can set it.
 *
 * **Keyed on the topic slug** (`frontend/javascript/event-loop`), per PRD §9's
 * Phase 5 note and CONVENTIONS §1: the slug is the topic's identity, so a mark
 * survives a topic moving folders only if the slug is what moved with it. When
 * a slug really does change, the old key is orphaned rather than wrong —
 * `pruneProgress` clears those out against the search index.
 *
 * **Storage is `localStorage`.** PRD §9 leaves the Phase 5 decision open and
 * asks for phone/laptop sync, which needs a server this app deliberately does
 * not have (§9: "no database, no auth, no server runtime"). Browser storage
 * with export is one of the three options listed there, and it is the only one
 * that keeps the build static. Export/import on `/progress` is the manual sync
 * path until that decision is actually made; nothing here assumes it stays
 * local, because every consumer goes through this module.
 *
 * Not a store of streaks, scores or ratings. PRD §2 bans gamification, and a
 * count of what is left to read is not a score — so this stays a set of slugs
 * and a date, and grows a confidence rating only if PRD §9 asks for one.
 */

const KEY = "engineering-map.progress.v1";

/** slug → ISO timestamp it was marked understood. */
export type ProgressMap = Readonly<Record<string, string>>;

const EMPTY: ProgressMap = Object.freeze({});

/**
 * The snapshot `useSyncExternalStore` compares by reference, so every read
 * returns *this* object until a write replaces it. Parsing on each call would
 * hand React a new object every render and loop forever.
 */
let snapshot: ProgressMap = EMPTY;
let loaded = false;

const listeners = new Set<() => void>();

function parse(raw: string | null): ProgressMap {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return EMPTY;
    }
    const out: Record<string, string> = {};
    for (const [slug, at] of Object.entries(value as Record<string, unknown>)) {
      // Anything shaped wrong is dropped rather than thrown on. This is the
      // reader's own hand-edited or imported file; a single bad entry should
      // not cost them the other four hundred.
      if (typeof at === "string") out[slug] = at;
    }
    return Object.freeze(out);
  } catch {
    return EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function write(next: ProgressMap) {
  snapshot = Object.freeze({ ...next });
  loaded = true;
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // Private mode, or a full quota. The in-memory snapshot still updated, so
    // the tick appears and the session behaves; it just will not survive a
    // reload. Failing loudly here would be worse than losing one mark.
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Another tab marked something. Same origin, same key, so re-read and emit. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== KEY) return;
    snapshot = parse(localStorage.getItem(KEY));
    loaded = true;
    emit();
  });
}

function getSnapshot(): ProgressMap {
  if (!loaded) {
    snapshot = parse(localStorage.getItem(KEY));
    loaded = true;
  }
  return snapshot;
}

/**
 * Empty on the server, always.
 *
 * Every page here is prerendered at build time, so the HTML cannot know what
 * this reader has covered. React renders this snapshot during hydration and
 * then re-renders with the real one, which is why the meters can show a real
 * number without a hydration mismatch — and why they render a placeholder for
 * one frame instead of flashing "0 of 24".
 */
function getServerSnapshot(): ProgressMap {
  return EMPTY;
}

export function useProgress(): ProgressMap {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * `false` until hydration finishes. Consumers use it to render a neutral
 * placeholder rather than a confident zero, so a page never claims you have
 * covered nothing on the way to saying you covered forty things.
 */
export function useProgressReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function useIsCovered(slug: string): boolean {
  const progress = useProgress();
  return slug in progress;
}

export function setCovered(slug: string, covered: boolean) {
  const current = getSnapshot();
  if (covered === slug in current) return;

  const next = { ...current };
  if (covered) next[slug] = new Date().toISOString();
  else delete next[slug];
  write(next);
}

export function useToggleCovered(slug: string): () => void {
  return useCallback(() => {
    setCovered(slug, !(slug in getSnapshot()));
  }, [slug]);
}

/**
 * How many topics under `prefix` are covered.
 *
 * Counted by slug prefix rather than by passing the subsection's slug list
 * down: a section card would otherwise ship 207 slugs to the client to render
 * one line of text. Slugs are paths, so `frontend/react/` is exactly the set of
 * that subsection's topics — the denominator comes from the server, which
 * already counted the files.
 *
 * Clamped, because an orphaned slug from renamed content would otherwise read
 * as "25 of 24". `pruneProgress` is the actual fix; this keeps the number sane
 * until it runs.
 */
export function useCoveredCount(
  prefix: string,
  total: number,
  /**
   * Slugs outside the prefix that the same list counts — the `_shared/` topics
   * a subsection surfaces (`getSubsectionCounts`). They live under
   * `_shared/`, so a prefix scan misses them, and leaving them out would make a
   * fully-read subsection stop one short of its own denominator.
   */
  extraSlugs: readonly string[] = [],
): number {
  const progress = useProgress();
  const scope = prefix.endsWith("/") ? prefix : `${prefix}/`;
  let count = 0;
  for (const slug of Object.keys(progress)) {
    if (slug.startsWith(scope)) count += 1;
  }
  for (const slug of extraSlugs) {
    if (slug in progress) count += 1;
  }
  return Math.min(count, total);
}

export function coveredCount(progress: ProgressMap): number {
  return Object.keys(progress).length;
}

export function exportProgress(): string {
  return JSON.stringify(getSnapshot(), null, 2);
}

/**
 * Merges rather than replaces: the import path exists so a phone and a laptop
 * can end up holding the same set, and replacing would make the direction of
 * the transfer matter. Keeps the earlier date when both sides have a slug —
 * the mark is a record of when you understood it, not of when you last synced.
 */
export function importProgress(raw: string): number {
  const incoming = parse(raw);
  if (incoming === EMPTY && raw.trim() !== "{}") {
    throw new Error("That doesn't look like an exported progress file.");
  }

  const merged: Record<string, string> = { ...getSnapshot() };
  let added = 0;
  for (const [slug, at] of Object.entries(incoming)) {
    if (!(slug in merged)) added += 1;
    merged[slug] = merged[slug] && merged[slug] < at ? merged[slug] : at;
  }
  write(merged);
  return added;
}

/** Drops marks whose topic no longer exists. Returns how many went. */
export function pruneProgress(validSlugs: Iterable<string>): number {
  const valid = new Set(validSlugs);
  const current = getSnapshot();
  const next: Record<string, string> = {};
  let dropped = 0;
  for (const [slug, at] of Object.entries(current)) {
    if (valid.has(slug)) next[slug] = at;
    else dropped += 1;
  }
  if (dropped > 0) write(next);
  return dropped;
}

export function resetProgress() {
  write({});
}
