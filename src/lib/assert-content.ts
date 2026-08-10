/**
 * Build-time content validation.
 *
 * `docs/` is hand-authored markdown, so the failure modes are typos and
 * half-finished frontmatter, not type errors. This module turns those into a
 * failed build instead of a card that renders blank or a topic that silently
 * disappears from search.
 *
 * Scope note: this validates what the *app* needs to render. It deliberately
 * does not re-implement `scripts/check-docs.py`, which is the authoring-side
 * linter and enforces stricter editorial rules (3–5 resources, exactly one
 * primary, one-sentence summaries, the four required headings). Both can be
 * true: a file can be renderable but not yet up to authoring standard.
 */

import type { Level, Resource, ResourceType } from "@/lib/types";

export class ContentError extends Error {
  constructor(message: string) {
    super(`Content validation failed: ${message}`);
    this.name = "ContentError";
  }
}

const LEVELS: readonly Level[] = ["core", "deep"];

const RESOURCE_TYPES: readonly ResourceType[] = [
  "docs",
  "article",
  "video",
  "repo",
  "book",
  "course",
];

export function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ContentError(
      `\`${field}\` is required and must be a non-empty string.`,
    );
  }
  return value.trim();
}

export function optionalInt(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ContentError(
      `\`${field}\` must be a number, got: ${String(value)}`,
    );
  }
  return value;
}

export function requireStringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new ContentError(`\`${field}\` must be a list.`);
  }
  return value.map((item, i) => requireText(item, `${field}[${i}]`));
}

export function requireLevel(value: unknown, field: string): Level {
  if (typeof value !== "string" || !LEVELS.includes(value as Level)) {
    throw new ContentError(
      `\`${field}\` must be one of ${LEVELS.join(" | ")}, got: ${String(value)}`,
    );
  }
  return value as Level;
}

/**
 * Resources are validated loosely on purpose.
 *
 * CONVENTIONS §7 explicitly blesses a topic with good frontmatter and an empty
 * body as "a legitimate intermediate state", and the link-count and
 * exactly-one-primary rules belong to the authoring linter. What the app needs
 * is that every resource it renders has a title, a working-looking URL, a
 * source to display, and a known type for the icon.
 */
export function requireResources(value: unknown, field: string): Resource[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new ContentError(`\`${field}\` must be a list.`);
  }

  return value.map((raw, i) => {
    const at = `${field}[${i}]`;
    if (typeof raw !== "object" || raw === null) {
      throw new ContentError(`\`${at}\` must be a mapping.`);
    }
    const entry = raw as Record<string, unknown>;

    const url = requireText(entry.url, `${at}.url`);
    // Caught here rather than at render time because a malformed href renders
    // as a link that looks fine and goes nowhere — the dead end is invisible
    // until it is clicked.
    try {
      new URL(url);
    } catch {
      throw new ContentError(
        `\`${at}.url\` is not a valid absolute URL: ${url}`,
      );
    }

    const type = entry.type;
    if (
      typeof type !== "string" ||
      !RESOURCE_TYPES.includes(type as ResourceType)
    ) {
      throw new ContentError(
        `\`${at}.type\` must be one of ${RESOURCE_TYPES.join(" | ")}, got: ${String(type)}`,
      );
    }

    return {
      title: requireText(entry.title, `${at}.title`),
      url,
      source: requireText(entry.source, `${at}.source`),
      type: type as ResourceType,
      minutes: optionalInt(entry.minutes, `${at}.minutes`),
      primary: entry.primary === true,
    };
  });
}
