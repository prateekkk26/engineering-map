import { SectionList } from "@/components/home/SectionList";
import { getSections } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search-index";

/**
 * Home — PRD §4 ①, "what can I learn?"
 *
 * A wordmark, a search box, and a single vertical list of section cards.
 * Nothing else: no dashboard, no charts, no hero. The test for anything that
 * wants to be added here is PRD §7 — does it help me read and find things
 * faster?
 *
 * Server component: the filesystem read and validation happen here, at build
 * time, and only the finished tree and the slim search index cross into the
 * client.
 */
export default function Page() {
  const sections = getSections();
  const index = buildSearchIndex();

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16">
      <h1 className="py-6 text-sm font-medium tracking-tight text-muted-foreground">
        Engineering Map
      </h1>
      <SectionList sections={sections} index={index} />
    </main>
  );
}
