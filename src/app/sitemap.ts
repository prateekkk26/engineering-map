import type { MetadataRoute } from "next";

import { getSections, getSharedTopics } from "@/lib/content";
import { PROGRESS_ENABLED, SITE_URL } from "@/lib/flags";

/**
 * Every readable URL, walked from the same loaders the navigation uses.
 *
 * Around 660 entries — one file, comfortably under the 50,000 limit, and it
 * costs nothing at build because the tree is already in memory.
 *
 * **No `lastModified`.** On Vercel every file carries the checkout time, so the
 * only honest value available would be the same timestamp on all 660 URLs,
 * which tells a crawler less than omitting the field does.
 *
 * `/progress` appears only when the flag is on. The route calls `notFound()`
 * otherwise, and advertising a 404 in a sitemap is worse than not listing it.
 * `/api/*` and `/search-index.json` are machine surfaces, not pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path}`;

  const entries: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/map"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.5 },
  ];

  if (PROGRESS_ENABLED) {
    entries.push({
      url: url("/progress"),
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  for (const section of getSections()) {
    entries.push({
      url: url(`/${section.slug}`),
      changeFrequency: "monthly",
      priority: 0.8,
    });

    for (const subsection of section.subsections) {
      entries.push({
        url: url(`/${subsection.slug}`),
        changeFrequency: "monthly",
        priority: 0.6,
      });

      // A `_shared/` topic is surfaced into several subsections but has exactly
      // one URL, so it is listed once below rather than here — a sitemap with
      // the same URL four times is a sitemap a crawler distrusts.
      for (const topic of subsection.topics) {
        entries.push({
          url: url(`/${topic.slug}`),
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  for (const topic of getSharedTopics()) {
    entries.push({
      url: url(`/${topic.slug}`),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}