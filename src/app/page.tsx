import { SectionList } from "@/components/home/SectionList";
import { Page as Container } from "@/components/shell/Page";
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
    <Container>
      {/* The wordmark lives in the rail and the mobile top bar now, so the
          heading here says what the page is instead of repeating it. */}
      <h1 className="py-6 text-2xl leading-tight font-medium tracking-tight">
        Everything in the map
      </h1>
      <SectionList sections={sections} index={index} />
    </Container>
  );
}
