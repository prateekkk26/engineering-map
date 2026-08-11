"use client";

import { Check } from "lucide-react";

import { useIsCovered, useProgressReady, useToggleCovered } from "@/lib/progress";
import { cn } from "@/lib/utils";

/**
 * The one control that writes progress — PRD §9 Phase 5, kept manual on
 * purpose: "I have understood this thoroughly" is a claim only the reader can
 * make, so nothing else in the app sets it.
 *
 * It sits at the end of the topic page rather than beside the title. Marking is
 * something you do *after* reading, and putting it at the top invites ticking
 * things on the way past — which would quietly turn the number into a record of
 * pages opened.
 */
export function CoveredToggle({ slug }: { slug: string }) {
  const ready = useProgressReady();
  const covered = useIsCovered(slug);
  const toggle = useToggleCovered(slug);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={ready ? covered : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg p-4 text-left ring-1 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        covered
          ? "bg-accent/40 ring-border"
          : "ring-border hover:bg-accent/40",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-[0.25rem] ring-1",
          covered
            ? "bg-foreground text-background ring-foreground"
            : "ring-border",
        )}
        aria-hidden
      >
        {covered ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>

      <span className="min-w-0 text-sm">
        <span className="block font-medium">
          {covered ? "You've covered this" : "I understand this thoroughly"}
        </span>
        <span className="block text-muted-foreground">
          {covered
            ? "Tap to unmark if it stops feeling true."
            : "Only tick it when you could explain it under follow-up."}
        </span>
      </span>
    </button>
  );
}
