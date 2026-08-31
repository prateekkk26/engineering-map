"use client";

import { useEffect, useState } from "react";

/**
 * How many people have read any of this.
 *
 * Fetched from the browser after paint rather than rendered on the server, and
 * that is the load-bearing decision: awaiting it in a page would opt that page
 * out of the prerender and put the Google Analytics API on the critical path of
 * the HTML.
 *
 * Renders nothing at all when the number is unavailable — flag off, no service
 * account, GA unreachable. There is no state in which this shows a zero.
 */
export function VisitorCount({ className }: { className?: string }) {
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((response) => response.json())
      .then((data: { visitors: number | null }) => {
        if (!cancelled && typeof data.visitors === "number") {
          setVisitors(data.visitors);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (visitors === null) return null;

  return (
    <span className={className}>
      <span className="text-foreground tabular-nums">
        {visitors.toLocaleString("en-US")}
      </span>{" "}
      readers so far
    </span>
  );
}
