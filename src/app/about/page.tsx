import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { PageHeader } from "@/components/nav/PageHeader";
import { StatsLine } from "@/components/home/StatsLine";
import { Page } from "@/components/shell/Page";
import { ANALYTICS_ENABLED, PROGRESS_ENABLED } from "@/lib/flags";
import { formatCount, getSiteStats } from "@/lib/stats";

/**
 * The page that answers the questions home does not have room for: how the
 * content was chosen, how the site is built, and what it does and does not do
 * with the reader's data.
 *
 * The selection rule is the interesting part and it is quoted rather than
 * paraphrased — it is the whole reason the map is 573 topics and not 5,000.
 */
export const metadata: Metadata = {
  title: "About",
  description:
    "What this map is, how the topics were chosen, and how the site is built.",
};

const REPO = "https://github.com/prateekkk26/engineering-map";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="mt-3 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  const stats = getSiteStats();

  return (
    <Page>
      <Breadcrumb
        trail={[{ label: "Engineering Map", href: "/" }, { label: "About" }]}
      />

      <PageHeader
        tone="section"
        className="pb-2"
        lead="A map of what a senior engineer is expected to know, with the best thing to read about each of it."
      >
        About
      </PageHeader>
      <StatsLine stats={stats} className="pt-4" />

      <Section title="What it is">
        <p>
          Preparing for senior engineering interviews means holding a wide
          surface area in your head — the browser, React, backend design,
          databases, distributed systems, and increasingly how to actually build
          with models. The material exists, scattered across bookmarks, tabs and
          half-remembered blog posts. There was no single place saying{" "}
          <em>
            here is the set of things a senior engineer is expected to have a
            real grasp of, and here is where to go learn each one
          </em>
          .
        </p>
        <p>
          So: {formatCount(stats.sections)} sections, {formatCount(stats.subsections)}{" "}
          subsections, {formatCount(stats.topics)} topics. Four levels and it
          stops there — the topic page is terminal, and depth comes from the{" "}
          {formatCount(stats.links)} links out rather than from more nesting.
        </p>
      </Section>

      <Section title="How the topics were chosen">
        <p>
          One rule, applied to every page:{" "}
          <strong className="font-medium text-foreground">
            a topic earns a page if it can plausibly come up in a real interview
            round, or if you need it to answer something that does.
          </strong>{" "}
          A topic is skipped if it is real but never asked — deep browser-engine
          trivia, deprecated APIs, framework history for its own sake.
        </p>
        <p>
          That is why there is no algorithms grind here and why the AI and LLM
          section is as large as it is. It is also why every page has to say what
          the thing is <em>and</em> why it matters: a definition you cannot
          motivate is a definition you will not hold under a follow-up question.
        </p>
      </Section>

      <Section title="How it is built">
        <p>
          Markdown files in a folder, read at build time. Every page in the map
          is prerendered as static HTML — there is no database behind the
          content, no CMS, and no admin UI. The whole tree is{" "}
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="text-brand underline underline-offset-4"
          >
            on GitHub
          </a>
          , so the content reads as files there and renders as pages here.
        </p>
        <p>
          A script checks every outbound link on a schedule, which is the only
          reason a map of {formatCount(stats.links)} links stays worth trusting.
          Link rot is the failure mode a resource like this actually dies of.
        </p>
      </Section>

      <Section title="What it knows about you">
        <p>
          No accounts, no sign-up, no comments.{" "}
          {PROGRESS_ENABLED ? (
            <>
              The one thing the site remembers — which topics you have marked as
              covered — is stored in your own browser and is never sent
              anywhere. Clearing your site data clears it.
            </>
          ) : (
            <>Nothing you do here is stored against you.</>
          )}
        </p>
        {ANALYTICS_ENABLED ? (
          <p>
            Google Analytics is used to count visits, which is how I know
            whether any of this is read. It sets cookies and reports aggregate
            page views; it is not tied to anything you do on the site, and there
            is no advertising integration.
          </p>
        ) : null}
      </Section>

      <Section title="Who made it">
        <p>
          Built by Prateek Rawat, originally for my own interview preparation,
          which is why it is opinionated. Writing it for one reader is what let
          it take positions; opening it up cost nothing.
        </p>
        <p>
          <Link
            href="/"
            className="text-brand underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start reading →
          </Link>
        </p>
      </Section>
    </Page>
  );
}
