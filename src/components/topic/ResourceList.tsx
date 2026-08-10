import { createElement } from "react";
import { ArrowUpRight } from "lucide-react";

import { iconForResource } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Resource } from "@/lib/types";

/**
 * PRD §5 — "Start here" and "Go deeper".
 *
 * The split is the whole point of the block: CONVENTIONS §2 requires exactly
 * one `primary` resource, chosen "by what teaches the concept best, not by
 * what's most official", and pulling it out of the list is what makes the
 * choice visible. Everything else is a flat list underneath.
 *
 * Defensive about the count: the app validates that resources are renderable,
 * not that there is exactly one primary — that rule belongs to
 * `check-docs.py`. So a file with two primaries during authoring shows the
 * first and demotes the rest rather than failing the page.
 */
function ResourceRow({
  resource,
  emphasis = false,
}: {
  resource: Resource;
  emphasis?: boolean;
}) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex items-start gap-3 rounded-lg p-3 outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring",
        emphasis && "ring-1 ring-border",
      )}
    >
      {createElement(iconForResource(resource.type), {
        className: "mt-0.5 size-4 shrink-0 text-muted-foreground",
        "aria-hidden": true,
      })}
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug font-medium">
          {resource.title}
          <ArrowUpRight
            className="ml-1 inline size-3.5 align-[-2px] text-muted-foreground"
            aria-hidden
          />
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {resource.source}
          {" · "}
          {resource.type}
          {resource.minutes ? ` · ${resource.minutes} min` : ""}
        </span>
      </span>
    </a>
  );
}

export function ResourceList({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) return null;

  const primaryIndex = resources.findIndex((resource) => resource.primary);
  const primary = primaryIndex === -1 ? undefined : resources[primaryIndex];
  const rest = resources.filter((_, i) => i !== primaryIndex);

  return (
    <div className="space-y-6">
      {primary ? (
        <section>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Start here
          </h2>
          <ResourceRow resource={primary} emphasis />
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section>
          <h2 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {primary ? "Go deeper" : "Links"}
          </h2>
          <ul>
            {rest.map((resource) => (
              <li key={resource.url}>
                <ResourceRow resource={resource} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
