"use client";

import Link from "next/link";

import { PageHeader } from "@/components/nav/PageHeader";
import { Page } from "@/components/shell/Page";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * The runtime error boundary. Must be a client component — React needs `reset`
 * to be callable from the browser.
 *
 * Every page here is prerendered from files on disk, so a render error is
 * genuinely unexpected and almost certainly transient. The message is not shown:
 * Next redacts it in production anyway, and a digest string in front of a reader
 * is noise they cannot act on.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Page>
      <PageHeader
        tone="section"
        className="py-8"
        lead="Something went wrong rendering this page. It is almost certainly temporary — the content itself is static files."
      >
        That didn&rsquo;t load
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <Button variant="brand" onClick={reset}>
          Try again
        </Button>
        <Link href="/map" className={buttonVariants({ variant: "outline" })}>
          Browse the map
        </Link>
      </div>
    </Page>
  );
}
