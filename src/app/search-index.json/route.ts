import { buildSearchIndex } from "@/lib/search-index";

/**
 * The search index as a static file.
 *
 * The home page gets its index as props, which is what keeps its search box
 * instant with no spinner (PRD §7). The ⌘K palette cannot: it exists in the
 * root layout, so props would mean the index — every title, summary and tag —
 * inlined into all 359 prerendered pages to serve a box most visits never
 * open. This is fetched once, on first open.
 *
 * `force-static` makes it a file emitted by `next build` rather than a
 * function, which is the same "no server runtime" trade every other route in
 * the app makes.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
