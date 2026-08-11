"use client";

import { useState } from "react";
import Link from "next/link";

import {
  coveredCount,
  exportProgress,
  importProgress,
  pruneProgress,
  resetProgress,
  useCoveredCount,
  useProgress,
  useProgressReady,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

/**
 * One row's worth of server-side facts. Everything here is content state
 * counted at build time; the reader's side of it is read from `localStorage`
 * in this component and never crosses the boundary in the other direction.
 */
export type SectionProgress = {
  slug: string;
  title: string;
  /** Authored topics — the denominator you can actually cover today. */
  written: number;
  /** What the section's `_meta.yaml` files plan, authored or not. */
  planned: number;
  /** Summed `minutes` frontmatter across authored topics. */
  minutes: number;
  specified: boolean;
};

function hours(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = minutes / 60;
  return `${h < 10 ? h.toFixed(1) : Math.round(h)}h`;
}

function SectionRow({ section }: { section: SectionProgress }) {
  const ready = useProgressReady();
  const covered = useCoveredCount(section.slug, section.written);
  const percent = section.written
    ? Math.round((covered / section.written) * 100)
    : 0;

  // Time left is the average read time of the section's topics times what is
  // left of it. An estimate of an estimate, so it is labelled as one — the
  // alternative is summing the minutes of exactly the uncovered topics, which
  // would mean shipping all 444 topics' frontmatter to the client.
  const perTopic = section.written ? section.minutes / section.written : 0;
  const remaining = Math.max(section.written - covered, 0) * perTopic;

  const body = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-medium">{section.title}</h2>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {section.specified
            ? ready
              ? `${covered} / ${section.written}`
              : " "
            : "not yet written"}
        </span>
      </div>

      {section.specified ? (
        <>
          <div
            className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={section.written}
            aria-valuenow={ready ? covered : undefined}
            aria-label={`${section.title}: ${covered} of ${section.written} topics covered`}
          >
            <div
              className="h-full rounded-full bg-foreground/70 transition-[width] duration-300"
              style={{ width: `${ready ? percent : 0}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground tabular-nums">
            {ready
              ? `${percent}% covered · about ${hours(remaining)} of reading left`
              : " "}
            {section.planned > section.written
              ? ` · ${section.planned - section.written} more planned`
              : ""}
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          Not specified yet — nothing to cover until it is written.
        </p>
      )}
    </>
  );

  const shell = "block rounded-lg p-4 ring-1 ring-border";

  if (!section.specified) {
    return <div className={cn(shell, "opacity-60")}>{body}</div>;
  }

  return (
    <Link
      href={`/${section.slug}`}
      className={cn(
        shell,
        "outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {body}
    </Link>
  );
}

/**
 * The manual-sync panel. `localStorage` is per-browser, so a phone and a laptop
 * hold two independent sets until one is pasted into the other — see the
 * storage note in `lib/progress.ts` for why that is the trade for now.
 */
function TransferPanel({ indexUrl }: { indexUrl: string }) {
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState<string>();
  const [open, setOpen] = useState(false);

  async function onPrune() {
    try {
      const response = await fetch(indexUrl);
      const entries: { slug: string }[] = await response.json();
      const dropped = pruneProgress(entries.map((entry) => entry.slug));
      setNote(
        dropped === 0
          ? "Nothing to clean up — every mark points at a topic that exists."
          : `Cleared ${dropped} mark${dropped === 1 ? "" : "s"} for topics that no longer exist.`,
      );
    } catch {
      setNote("Couldn't load the topic index to check against.");
    }
  }

  return (
    <section className="rounded-lg p-4 ring-1 ring-border">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Move progress between devices {open ? "−" : "+"}
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Marks are stored in this browser. Copy the export from one device
            and paste it into the other — importing merges, so neither side
            loses anything.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft(exportProgress());
                setNote("Exported below — copy it.");
              }}
              className="rounded-md px-3 py-1.5 text-sm ring-1 ring-border outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Export
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  const added = importProgress(draft);
                  setNote(
                    `Imported — ${added} new mark${added === 1 ? "" : "s"}.`,
                  );
                } catch (error) {
                  setNote(
                    error instanceof Error ? error.message : "Import failed.",
                  );
                }
              }}
              disabled={draft.trim() === ""}
              className="rounded-md px-3 py-1.5 text-sm ring-1 ring-border outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              Import what&rsquo;s below
            </button>
            <button
              type="button"
              onClick={onPrune}
              className="rounded-md px-3 py-1.5 text-sm ring-1 ring-border outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clean up moved topics
            </button>
            <button
              type="button"
              onClick={() => {
                // Deliberately a confirm: this is the only destructive control
                // in the app, and the data behind it cannot be re-derived.
                if (
                  window.confirm(
                    "Clear every mark in this browser? This cannot be undone.",
                  )
                ) {
                  resetProgress();
                  setNote("Cleared.");
                }
              }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground ring-1 ring-border outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear all
            </button>
          </div>

          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
            rows={6}
            aria-label="Progress data"
            placeholder="Exported progress appears here, or paste an export to import."
            className="w-full rounded-md bg-transparent p-2 font-mono text-xs ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {note ? (
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {note}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function ProgressOverview({
  sections,
  totals,
  indexUrl = "/search-index.json",
}: {
  sections: SectionProgress[];
  totals: { written: number; planned: number; minutes: number };
  indexUrl?: string;
}) {
  const ready = useProgressReady();
  const progress = useProgress();
  const covered = Math.min(coveredCount(progress), totals.written);
  const percent = totals.written
    ? Math.round((covered / totals.written) * 100)
    : 0;
  const perTopic = totals.written ? totals.minutes / totals.written : 0;
  const remaining = Math.max(totals.written - covered, 0) * perTopic;

  return (
    <div className="space-y-6">
      <section className="rounded-lg p-4 ring-1 ring-border">
        <p className="text-3xl leading-none font-medium tabular-nums">
          {ready ? `${covered}` : "—"}
          <span className="text-base text-muted-foreground">
            {" "}
            of {totals.written} topics
          </span>
        </p>

        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totals.written}
          aria-valuenow={ready ? covered : undefined}
          aria-label={`${covered} of ${totals.written} topics covered overall`}
        >
          <div
            className="h-full rounded-full bg-foreground/70 transition-[width] duration-300"
            style={{ width: `${ready ? percent : 0}%` }}
          />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground tabular-nums">
          {ready ? (
            <>
              {percent}% of everything written so far. About {hours(remaining)}{" "}
              of reading left at the estimates on each page
              {totals.planned > totals.written
                ? `, plus ${totals.planned - totals.written} topics still to be written`
                : ""}
              .
            </>
          ) : (
            " "
          )}
        </p>
      </section>

      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.slug}>
            <SectionRow section={section} />
          </li>
        ))}
      </ul>

      <TransferPanel indexUrl={indexUrl} />
    </div>
  );
}
