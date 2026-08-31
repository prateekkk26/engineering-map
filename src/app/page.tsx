import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SamplePreview } from "@/components/home/SamplePreview";
import { SectionGrid } from "@/components/home/SectionGrid";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SupportCta } from "@/components/support/SupportCta";
import { buttonVariants } from "@/components/ui/button";
import { getSections } from "@/lib/content";
import { getSiteStats } from "@/lib/stats";

/**
 * The landing page — PRD §4 ①, and the one route allowed to explain itself.
 *
 * §4 used to end "Nothing else. No dashboard, no charts, no hero section",
 * written when there was a single reader who already knew what this was. This
 * is now the only page someone arrives at from a link, so it answers what the
 * map is before showing them a single subsection name. PRD §10 records the
 * exemption and its boundary: it does not travel to any other route.
 *
 * It renders without the navigation rail — see the note in `AppShell` — so it
 * lays out its own full-width sections and closes with the footer itself rather
 * than going through `Page`.
 *
 * The order is an argument, in the order someone actually asks it: what is
 * this, what is in it, is the writing any good, how do I use it, where do I
 * start.
 */
export default function Page() {
  const sections = getSections();
  const stats = getSiteStats();

  return (
    <>
      <Hero stats={stats} />
      <SectionGrid sections={sections} />

      <div className="border-y border-border bg-sidebar">
        <div className="mx-auto w-full max-w-5xl px-5">
          <SamplePreview />
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-5">
        <HowItWorks />
      </div>

      <section className="mx-auto w-full max-w-5xl px-5 pt-4 pb-20 text-center">
        <h2 className="text-2xl font-medium tracking-tight text-balance">
          Start with whatever you are worst at.
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          The whole map is open — no account, no paywall, nothing to sign up
          for. Press ⌘K anywhere to search all of it.
        </p>
        <Link
          href="/map"
          className={`${buttonVariants({ variant: "brand", size: "lg" })} mt-6`}
        >
          Browse the map
          <ArrowRight aria-hidden />
        </Link>

        {/* Below the section grid, the sample and the how-to — after the value
            has been shown, never before it. */}
        <div className="mt-6 flex justify-center">
          <SupportCta variant="inline" />
        </div>
      </section>

      <SiteFooter className="max-w-5xl px-5" />
    </>
  );
}
