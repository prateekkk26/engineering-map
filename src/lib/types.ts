/**
 * The shape of `docs/`, as the app sees it.
 *
 * These types mirror the schema of record in `docs/_meta/CONVENTIONS.md` §2.
 * If that file and this one disagree, CONVENTIONS.md wins and this file is the
 * bug.
 */

/** CONVENTIONS §2 — `core` = expected of any senior; `deep` = differentiator. */
export type Level = "core" | "deep";

export type ResourceType =
  | "docs"
  | "article"
  | "video"
  | "repo"
  | "book"
  | "course";

export type Resource = {
  title: string;
  url: string;
  source: string;
  type: ResourceType;
  minutes?: number;
  /** Exactly one per topic. Rendered on its own as "Start here" (PRD §5). */
  primary?: boolean;
};

export type Topic = {
  /**
   * Full path without extension — `frontend/javascript/event-loop`.
   *
   * This is the topic's *identity*, not just its address: CONVENTIONS §1 notes
   * that Phase 5 progress tracking keys off it, which is why it is derived from
   * the file path and never stored separately.
   */
  slug: string;
  title: string;
  summary: string;
  level: Level;
  minutes: number;
  /** Frontmatter ordering hint. See `content.ts` for how it ranks against `_meta.yaml`. */
  order?: number;
  tags: string[];
  related: string[];
  resources: Resource[];
  /**
   * The markdown body, frontmatter stripped — everything under the four
   * headings of CONVENTIONS §3.
   *
   * Server-side only. It is never put in the search index and never crosses
   * into a client component; a subsection with 24 topics would otherwise ship
   * every word of all 24 to render a list of titles.
   *
   * An empty string is a legitimate state: CONVENTIONS §7 blesses "good
   * frontmatter, real resources, and an empty body" as useful.
   */
  body: string;
  /** True for topics under `docs/_shared/`. */
  shared: boolean;
  /** `_shared/` only — `section/subsection` paths that should surface this topic. */
  surfacedIn: string[];
};

export type Subsection = {
  /** `frontend/javascript` */
  slug: string;
  title: string;
  description: string;
  order?: number;
  /** Authored topic files on disk, ordered. */
  topics: Topic[];
  /** Length of the `topics:` list in `_meta.yaml` — the planned size. */
  plannedCount: number;
};

export type Section = {
  /** `frontend` */
  slug: string;
  title: string;
  description: string;
  /** A lucide icon name. Validated against the map in `icons.tsx` at build time. */
  icon: string;
  order?: number;
  subsections: Subsection[];
  /** Authored topic files across all subsections. */
  topicCount: number;
  /** Planned topics across all subsections. */
  plannedCount: number;
  /**
   * Whether the section has been through Phase 2 specification at all.
   *
   * Six of the eight sections are `false` today. The home page renders them
   * muted rather than hiding them: the eight sections *are* the claim about
   * what a senior should know, so the map is incomplete without them showing.
   */
  specified: boolean;
};

/**
 * One row in the client-side search index.
 *
 * Deliberately slim — this is the only content that crosses into the client
 * bundle, so it carries what a result row renders and nothing else. No body
 * text, no resources.
 */
export type SearchEntry = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  level: Level;
  minutes: number;
  shared: boolean;
  /** Display titles, not slugs — `Frontend Engineering` › `JavaScript Deep Dive`. */
  sectionTitle: string;
  subsectionTitle: string;
};
