"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { surface } from "@/lib/interactive";
import {
  coveredCount,
  exportProgress,
  importProgress,
  resetProgress,
  useCoveredCount,
  useProgress,
  useProgressReady,
} from "@/lib/progress";

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
          {ready ? `${covered} / ${section.written}` : " "}
        </span>
      </div>

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
  );

  return (
    <Link
      href={`/${section.slug}`}
      className={surface({ level: "row" })}
    >
      {body}
    </Link>
  );
}

/**
 * Moving marks between browsers.
 *
 * `localStorage` is per-origin and per-browser, so a phone and a laptop hold
 * two independent sets — see the storage note in `lib/progress.ts` for why that
 * is the trade for now.
 *
 * This used to be a raw JSON `<textarea>` with copy-and-paste instructions, a
 * "clean up moved topics" button, and a `window.confirm`. That was a
 * maintenance console for the one person who wrote it. A file download and a
 * file picker say the same thing without explaining JSON to anyone, and the
 * prune is gone: `useCoveredCount` already clamps, so an orphaned mark is
 * invisible, and no reader should be asked to garbage-collect.
 */
function TransferPanel() {
  const [note, setNote] = useState<string>();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  function onExport() {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "engineering-map-progress.json";
    link.click();
    // Revoked on the next tick rather than immediately: the click is
    // synchronous but the browser reads the blob after this frame.
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setNote("Downloaded. Open it on the other device with Import.");
  }

  async function onImport(file: File | undefined) {
    if (!file) return;
    try {
      const added = importProgress(await file.text());
      setNote(`Imported — ${added} new mark${added === 1 ? "" : "s"}.`);
    } catch (error) {
      setNote(
        error instanceof Error ? error.message : "That file could not be read.",
      );
    }
  }

  return (
    <section className="rounded-lg p-4 ring-1 ring-border">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="rounded text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Move progress between devices {open ? "\u2212" : "+"}
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your marks live in this browser and nowhere else. Export them to a
            file here, then import that file on the other device — importing
            merges, so neither side loses anything.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              Export to a file
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => picker.current?.click()}
            >
              Import a file
            </Button>
            <input
              ref={picker}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                void onImport(event.target.files?.[0]);
                // Cleared so re-picking the same file fires `change` again.
                event.target.value = "";
              }}
            />

            {/* Two clicks rather than `window.confirm`. This is the only
                destructive control in the app and the data cannot be
                re-derived, so it needs a confirmation — but a native dialog was
                the one piece of browser chrome in the whole site and read as a
                bug. */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                if (!confirming) {
                  setConfirming(true);
                  return;
                }
                resetProgress();
                setConfirming(false);
                setNote("Cleared.");
              }}
              onBlur={() => setConfirming(false)}
            >
              {confirming ? "Really clear everything?" : "Clear all"}
            </Button>
          </div>

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
}: {
  sections: SectionProgress[];
  totals: { written: number; planned: number; minutes: number };
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

      <TransferPanel />
    </div>
  );
}
