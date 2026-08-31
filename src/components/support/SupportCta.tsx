import { Heart } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { DONATIONS_ENABLED, POLAR_CHECKOUT_URL } from "@/lib/flags";
import { cn } from "@/lib/utils";

/**
 * "Support this work" — a Polar hosted Checkout Link.
 *
 * **No server code, no secret, no webhook.** A Checkout Link is created in the
 * Polar dashboard, is tied to the organisation, never expires, and mints a new
 * checkout session per visit. The product behind it is a one-time,
 * pay-what-you-want purchase, so there is no entitlement to grant and therefore
 * nothing for a webhook to do. The URL is public by definition — it is the
 * `href` — which is why it is a `NEXT_PUBLIC_` value and not a secret.
 *
 * Both conditions fold at build, so with the flag off or the URL unset the
 * whole subtree is dropped rather than hidden.
 *
 * **Where this may appear** — PRD §10, and the list is closed: the landing page
 * below the section grid, `/about`, and the footer. Never on a topic page,
 * never in the navigation rail, never in a modal. There are 573 reading pages
 * and they are the entire reason anyone is here; a support ask on them is the
 * one change that would turn this from a reference into a content farm.
 */
export function SupportCta({
  variant = "inline",
  className,
}: {
  /** `inline` is one line for the footer; `full` is the block on /about. */
  variant?: "inline" | "full";
  className?: string;
}) {
  if (!DONATIONS_ENABLED) return null;

  // `reference_id` is Polar's own attribution parameter, so the dashboard can
  // tell the footer link from the /about block without an analytics round trip.
  const href = `${POLAR_CHECKOUT_URL}${
    POLAR_CHECKOUT_URL.includes("?") ? "&" : "?"
  }reference_id=${variant}`;

  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          buttonVariants({ variant: "link", size: "sm" }),
          "px-0",
          className,
        )}
      >
        <Heart aria-hidden />
        Support this work
      </a>
    );
  }

  return (
    <section className={cn("rounded-lg bg-card p-6 ring-1 ring-border", className)}>
      <h2 className="font-medium">Support this work</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        This is free and it stays free. What it costs is the time to keep 1,415
        hand-picked links from rotting — every one of them is re-checked on a
        schedule, and link rot is what a resource like this actually dies of.
        If the map saved you an afternoon, you can put something toward the next
        one. Pay what you think it was worth.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: "brand" }), "mt-4")}
      >
        <Heart aria-hidden />
        Support this work
      </a>
    </section>
  );
}
