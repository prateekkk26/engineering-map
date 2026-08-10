/**
 * The single content loader — reads `docs/` at build time.
 *
 * `docs/` is both the human-readable knowledge base and the app's content
 * source (PRD §6): it reads well on GitHub and renders here. That is why the
 * folder sits at the repo root rather than inside `src/`, and why nothing in
 * this module writes to it.
 *
 * No page or component reads the filesystem directly. Everything goes through
 * here, which makes this the one place validation is guaranteed to run. On a
 * statically prerendered route that means a malformed file fails `next build`
 * rather than shipping a blank card.
 */

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import yaml from "js-yaml";

import {
  ContentError,
  optionalInt,
  requireLevel,
  requireResources,
  requireStringArray,
  requireText,
} from "@/lib/assert-content";
import { isKnownIcon } from "@/lib/icons";
import type { Section, Subsection, Topic } from "@/lib/types";

const DOCS_DIR = path.join(process.cwd(), "docs");

/**
 * `_meta/` is authoring infrastructure — TEMPLATE.md, CONVENTIONS.md,
 * SECTIONS.md. It is documentation *about* the content, not content, and
 * TEMPLATE.md in particular would parse as a topic with empty everything.
 */
const NOT_A_SECTION = new Set(["_meta"]);

/**
 * `_shared/` holds cross-cutting topics. Per `docs/_meta/SECTIONS.md` it "never
 * appears on the home screen" — it is loaded for search and for the
 * `surfaced_in` rendering that subsection pages will need, but it is not a
 * section card.
 */
const SHARED_DIR = "_shared";

type MetaFile = Record<string, unknown>;

function readMeta(dir: string): MetaFile {
  const file = path.join(dir, "_meta.yaml");
  if (!fs.existsSync(file)) return {};
  const parsed = yaml.load(fs.readFileSync(file, "utf8"));
  if (parsed === null || parsed === undefined) return {};
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ContentError(`${file} must contain a YAML mapping.`);
  }
  return parsed as MetaFile;
}

function directoriesIn(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function markdownFilesIn(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name.replace(/\.md$/, ""));
}

/**
 * Applies the ordering rule every `_meta.yaml` in `docs/` states in a comment,
 * and PRD §6 states in prose:
 *
 *   > Any folder not listed in `subsections` still renders, appended
 *   > alphabetically. A new folder is never invisible just because the meta
 *   > file wasn't updated.
 *
 * So: listed names first, in listed order; everything else after, sorted. A
 * name listed in `_meta.yaml` but absent from disk is *planned work*, not an
 * error — the build is depth-first and the tree is deliberately ahead of the
 * writing (SECTIONS.md). It is dropped here and counted separately.
 */
function applyOrder(listed: string[], found: string[]): string[] {
  const onDisk = new Set(found);
  const ordered = listed.filter((name) => onDisk.has(name));
  const seen = new Set(ordered);
  const rest = found.filter((name) => !seen.has(name)).sort();
  return [...ordered, ...rest];
}

function loadTopic(dir: string, name: string, slug: string): Topic {
  const file = path.join(dir, `${name}.md`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  // Every error below names the file, because the frontmatter field alone
  // ("`title` is required") is useless when 200-odd files could be the source.
  const at = path.relative(process.cwd(), file);

  try {
    return {
      slug,
      title: requireText(data.title, "title"),
      summary: requireText(data.summary, "summary"),
      level: requireLevel(data.level, "level"),
      minutes: optionalInt(data.minutes, "minutes") ?? 0,
      order: optionalInt(data.order, "order"),
      tags: requireStringArray(data.tags, "tags"),
      related: requireStringArray(data.related, "related"),
      resources: requireResources(data.resources, "resources"),
      body: content.trim(),
      shared: slug.startsWith(`${SHARED_DIR}/`),
      surfacedIn: requireStringArray(data.surfaced_in, "surfaced_in"),
    };
  } catch (error) {
    if (error instanceof ContentError) {
      throw new ContentError(
        `${at}: ${error.message.replace(/^Content validation failed: /, "")}`,
      );
    }
    throw error;
  }
}

/**
 * Sorts authored topics.
 *
 * `_meta.yaml`'s `topics:` list is primary — it is what every subsection in
 * `docs/` actually uses, and PRD §6 makes the folder's meta file the home of
 * ordering. Frontmatter `order` (CONVENTIONS §2) is the fallback for files the
 * list does not mention, then alphabetical. Two mechanisms exist because
 * CONVENTIONS §7 treats adding to the list as optional; this reconciles them
 * rather than picking a winner.
 */
function sortTopics(listed: string[], topics: Topic[]): Topic[] {
  const rank = new Map(listed.map((name, i) => [name, i]));
  const nameOf = (topic: Topic) => topic.slug.split("/").pop() as string;

  return [...topics].sort((a, b) => {
    const ra = rank.get(nameOf(a));
    const rb = rank.get(nameOf(b));
    if (ra !== undefined && rb !== undefined) return ra - rb;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;

    if (a.order !== undefined && b.order !== undefined)
      return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;

    return a.title.localeCompare(b.title);
  });
}

function loadSubsection(sectionSlug: string, name: string): Subsection {
  const dir = path.join(DOCS_DIR, sectionSlug, name);
  const meta = readMeta(dir);
  const slug = `${sectionSlug}/${name}`;
  const listed = requireStringArray(meta.topics, `${slug}/_meta.yaml: topics`);

  const topics = markdownFilesIn(dir).map((file) =>
    loadTopic(dir, file, `${slug}/${file}`),
  );

  return {
    slug,
    title: requireText(meta.title, `${slug}/_meta.yaml: title`),
    description: requireText(
      meta.description,
      `${slug}/_meta.yaml: description`,
    ),
    order: optionalInt(meta.order, `${slug}/_meta.yaml: order`),
    topics: sortTopics(listed, topics),
    // The planned size is the `topics:` list, which runs ahead of what is
    // authored. `scripts/check-docs.py` draws the same planned-vs-authored
    // line; if the two ever disagree, one of them has the ordering rule wrong.
    plannedCount: Math.max(listed.length, topics.length),
  };
}

function loadSection(slug: string): Section {
  const dir = path.join(DOCS_DIR, slug);
  const meta = readMeta(dir);
  const listed = requireStringArray(
    meta.subsections,
    `${slug}/_meta.yaml: subsections`,
  );
  const names = applyOrder(listed, directoriesIn(dir));
  const subsections = names.map((name) => loadSubsection(slug, name));

  const icon = requireText(meta.icon, `${slug}/_meta.yaml: icon`);
  // Fails the build rather than rendering a card with a hole where the icon
  // should be. `icons.tsx` is an explicit map for exactly this reason.
  if (!isKnownIcon(icon)) {
    throw new ContentError(
      `${slug}/_meta.yaml: icon \`${icon}\` is not mapped in src/lib/icons.tsx. ` +
        `Add it there, or use one of the names already mapped.`,
    );
  }

  return {
    slug,
    title: requireText(meta.title, `${slug}/_meta.yaml: title`),
    description: requireText(
      meta.description,
      `${slug}/_meta.yaml: description`,
    ),
    icon,
    order: optionalInt(meta.order, `${slug}/_meta.yaml: order`),
    subsections,
    topicCount: subsections.reduce((n, s) => n + s.topics.length, 0),
    plannedCount: subsections.reduce((n, s) => n + s.plannedCount, 0),
    specified: subsections.length > 0,
  };
}

/**
 * Read once per process. In a static build that is once, at build time.
 *
 * **Off in development, on purpose.** `docs/` is read with `fs`, not imported,
 * so it is not in the module graph the dev server watches — nothing invalidates
 * this cache when a topic file is added. A `next dev` process started before a
 * subsection was written would keep serving "0 of 24 topics" and an unlinked
 * row until someone restarted it, which reads exactly like a bug in the page.
 *
 * Re-reading the tree per request in dev costs a few milliseconds and makes a
 * new topic file appear on the next reload. The build is unaffected: it runs in
 * production mode, where the cache is live and the read happens once.
 */
const CACHE_TREE = process.env.NODE_ENV === "production";

let cachedSections: Section[] | undefined;
let cachedShared: Topic[] | undefined;

export function getSections(): Section[] {
  if (CACHE_TREE && cachedSections) return cachedSections;

  const slugs = directoriesIn(DOCS_DIR).filter(
    (name) => !NOT_A_SECTION.has(name) && name !== SHARED_DIR,
  );

  cachedSections = slugs.map(loadSection).sort((a, b) => {
    // `order` in each section's `_meta.yaml` is the reading order from PRD §3.
    // Unordered sections fall to the end alphabetically rather than to the
    // front, so forgetting the field is a visible-but-harmless mistake.
    if (a.order !== undefined && b.order !== undefined)
      return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.title.localeCompare(b.title);
  });

  return cachedSections;
}

/**
 * Topics under `docs/_shared/`. Not a section — see `SHARED_DIR` above.
 *
 * Included in search because a concept you know the name of should be one
 * search away (PRD §4) regardless of which folder it happens to live in.
 */
export function getSharedTopics(): Topic[] {
  if (CACHE_TREE && cachedShared) return cachedShared;

  const dir = path.join(DOCS_DIR, SHARED_DIR);
  cachedShared = fs.existsSync(dir)
    ? markdownFilesIn(dir).map((file) =>
        loadTopic(dir, file, `${SHARED_DIR}/${file}`),
      )
    : [];

  return cachedShared;
}

/** The label a `_shared/` topic browses under, since it has no section. */
export const SHARED_SECTION_TITLE = "Shared Concepts";

export function getSection(slug: string): Section | undefined {
  return getSections().find((section) => section.slug === slug);
}

export function getSubsection(
  sectionSlug: string,
  subsectionSlug: string,
): Subsection | undefined {
  return getSection(sectionSlug)?.subsections.find(
    (subsection) => subsection.slug === `${sectionSlug}/${subsectionSlug}`,
  );
}

/**
 * What a subsection page actually lists: its own topics, then the `_shared/`
 * topics that named it in `surfaced_in`.
 *
 * PRD §4 ③ — "Shared topics pulled in from `_shared/` appear in this list too,
 * marked so it's clear they live elsewhere." They go last rather than
 * interleaved: `_meta.yaml`'s `topics:` list is a deliberate reading order, and
 * a shared topic has no place in it to claim.
 *
 * This is also the sequence prev/next walks, so the two never disagree about
 * what "the next topic" is.
 */
export function getSubsectionTopics(subsection: Subsection): Topic[] {
  return [...subsection.topics, ...surfacedInto(subsection)];
}

function surfacedInto(subsection: Subsection): Topic[] {
  return getSharedTopics().filter((topic) =>
    topic.surfacedIn.includes(subsection.slug),
  );
}

/**
 * Written-versus-planned for a subsection, counted over the list the reader
 * actually sees.
 *
 * `Subsection.plannedCount` comes from `_meta.yaml`'s `topics:` list, which
 * knows nothing about `_shared/`. Surfaced topics are written by definition —
 * they exist on disk — so they raise both numbers. Counting them on only one
 * side is what produced "17 of 16 topics".
 */
export function getSubsectionCounts(subsection: Subsection): {
  written: number;
  planned: number;
} {
  const surfaced = surfacedInto(subsection).length;
  return {
    written: subsection.topics.length + surfaced,
    planned: subsection.plannedCount + surfaced,
  };
}

/** Every authored topic, shared included, keyed by slug. */
function topicIndex(): Map<string, Topic> {
  if (CACHE_TREE && cachedIndex) return cachedIndex;

  cachedIndex = new Map();
  for (const section of getSections()) {
    for (const subsection of section.subsections) {
      for (const topic of subsection.topics) {
        cachedIndex.set(topic.slug, topic);
      }
    }
  }
  for (const topic of getSharedTopics()) {
    cachedIndex.set(topic.slug, topic);
  }

  return cachedIndex;
}

let cachedIndex: Map<string, Topic> | undefined;

export function getTopic(slug: string): Topic | undefined {
  return topicIndex().get(slug);
}

/**
 * Resolves a `related:` slug to a topic, or `undefined` if it is planned but
 * not written.
 *
 * Both are normal. `check-docs.py` treats a related slug that appears in some
 * `_meta.yaml` as planned work rather than a broken link, and the tree is
 * deliberately ahead of the writing — so the renderer's job is to show the
 * unwritten one as text instead of a link to a 404.
 */
export function resolveRelated(slugs: readonly string[]): {
  slug: string;
  topic?: Topic;
}[] {
  return slugs.map((slug) => ({ slug, topic: getTopic(slug) }));
}
