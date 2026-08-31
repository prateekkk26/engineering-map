import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StatsLine } from "@/components/home/StatsLine";
import { Logo } from "@/components/shell/Logo";
import { buttonVariants } from "@/components/ui/button";
import { formatCount, type SiteStats } from "@/lib/stats";

/**
 * What this is, for someone who has never seen it.
 *
 * Home used to open with "Everything in the map" and eight unexplained cards.
 * That was right when there was one reader who already knew what it was. It is
 * now the whole page a stranger sees before deciding whether to stay, so it has
 * about five seconds to say what this is and why the links can be trusted.
 *
 * Centred and large, against every other page in the app, and deliberately:
 * this is the one screen with a single job. The reading pages stay left-aligned
 * at a fixed measure because they are read; this one is looked at.
 *
 * The claim is the counts. They are the only evidence above the fold that this
 * is a finished thing rather than a started one, and they are counted from
 * `docs/` rather than typed, so they cannot go stale.
 */
export function Hero({ stats }: { stats: SiteStats }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* A single soft wash of the accent behind the headline. The palette is
          otherwise achromatic and PRD §7 keeps it that way — this is the one
          page allowed to be looked at rather than read, and it is a background,
          not a sixth use of the accent on a control. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[28rem] bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,var(--brand-muted),transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-3xl px-5 pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
        <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
          <Logo className="size-3.5 text-brand" />
          {formatCount(stats.topics)} topics · free · open source
        </p>

        {/* No manual line break: `text-balance` distributes the three lines
            evenly at every width, and a hardcoded <br> fought it — producing a
            short first line on a wide screen and a stranded word on a narrow
            one. */}
        <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Everything a senior engineer is expected to know
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-balance sm:text-lg">
          The browser, React, backend, data, distributed systems and building
          with models — mapped into {formatCount(stats.topics)} short pages that
          each say what a thing is, why it matters, and exactly where to go next.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/map" className={buttonVariants({ variant: "brand", size: "lg" })}>
            Browse the map
            <ArrowRight aria-hidden />
          </Link>
          <Link
            href="/about"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            How it was built
          </Link>
        </div>

        <StatsLine stats={stats} className="mt-10" align="center" />

        <p className="mt-6 text-xs text-muted-foreground">
          Written and maintained by{" "}
          <span className="text-foreground">Prateek Rawat</span>
        </p>
      </div>
    </section>
  );
}
