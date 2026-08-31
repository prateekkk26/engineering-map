import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SamplePreview } from "@/components/home/SamplePreview";
import { SectionList } from "@/components/home/SectionList";
import { StatsLine } from "@/components/home/StatsLine";
import { Page as Container } from "@/components/shell/Page";
import { getSections } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search-index";
import { getSiteStats } from "@/lib/stats";

/**
 * Home — PRD §4 ①, and the one page allowed to explain itself.
 *
 * §4 used to end "Nothing else. No dashboard, no charts, no hero section",
 * written when there was a single reader who already knew what this was. It is
 * now the only page a stranger lands on cold, so it answers what the map is
 * before showing them the eight cards. PRD §10 records the exemption and its
 * boundary: it does not travel to any other route.
 *
 * Everything above the section list is a server component, so the client
 * boundary is still `SectionList` and still crossed once.
 */
export default function Page() {
  const sections = getSections();
  const index = buildSearchIndex();
  const stats = getSiteStats();

  return (
    <Container>
      <Hero stats={stats} />
      <StatsLine stats={stats} className="pb-8" />

      <SectionList sections={sections} index={index} />

      <HowItWorks />
      <SamplePreview />
    </Container>
  );
}
