import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/flags";

/**
 * Open to everything, including the AI crawlers.
 *
 * Blocking `GPTBot`, `ClaudeBot` and the rest is the obvious instinct for a
 * hand-curated map, and it is the wrong trade here: the value of this site is
 * the selection and the links, not the prose being unique, and being absent
 * from the answers people now ask assistants for is a real cost in discovery
 * for a site nobody has heard of yet. Revisit if that stops being true.
 *
 * `/api/` is disallowed because nothing under it is a page — the OG image route
 * would otherwise be indexed as content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
