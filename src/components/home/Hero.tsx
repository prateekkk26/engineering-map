import { PageHeader } from "@/components/nav/PageHeader";
import { Logo } from "@/components/shell/Logo";
import { formatCount, type SiteStats } from "@/lib/stats";

/**
 * What this is, for someone who has never seen it — PRD §4, and the one place
 * §7's austerity is lifted.
 *
 * Home used to open with "Everything in the map" and eight unexplained cards.
 * That was right when there was one reader who already knew what it was. It is
 * the whole page a stranger sees before deciding whether to stay, so it now has
 * to answer what this is, who wrote it, and why the links can be trusted —
 * inside about five seconds, and without becoming a marketing page.
 *
 * The claim is the counts. They are the only evidence available above the fold
 * that this is a finished thing rather than a started one, and they are counted
 * from `docs/` rather than typed, so they cannot go stale.
 */
export function Hero({ stats }: { stats: SiteStats }) {
  return (
    <div className="pt-8 pb-6">
      <Logo className="mb-5 size-8 text-brand" />

      <PageHeader
        tone="home"
        lead={
          <>
            The surface area a senior engineer is expected to hold — the
            browser, React, backend, data, distributed systems, and building
            with models — mapped into {formatCount(stats.topics)} short pages
            that each say what a thing is, why it matters, and where to go next.
          </>
        }
      >
        Everything a senior engineer is expected to know
      </PageHeader>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Written for interview preparation, useful as a reference. Free, open
        source, no account, nothing to sign up for.
      </p>
    </div>
  );
}
