/**
 * Splits a topic body into its `##` blocks.
 *
 * CONVENTIONS §3 fixes four headings, in order, with exact text, and says "the
 * renderer keys off it". This is that key. Splitting rather than handing the
 * whole document to the markdown renderer buys two things: **In one line** can
 * be styled as the TL;DR it is rather than as another paragraph, and a file
 * that is half-written renders the blocks it has instead of nothing.
 *
 * Deliberately not validating. A missing or misspelled heading is the
 * authoring linter's job (`scripts/check-docs.py` checks all four, in order);
 * failing the build over it would make an intermediate state unpublishable,
 * which CONVENTIONS §7 explicitly allows.
 */

export type BodyBlock = {
  /** Heading text without the `##`. `""` for prose before the first heading. */
  heading: string;
  /** The markdown under it, trimmed. */
  markdown: string;
};

/** The TL;DR block, styled as lead text rather than as body prose. */
export const LEAD_HEADING = "In one line";

/**
 * Removes HTML comments.
 *
 * `TEMPLATE.md` writes its authoring instructions as `<!-- ... -->`, and files
 * copied from it keep notes in the same form — the `_shared/caching` topic
 * ends with one explaining why it lives there. They are invisible on GitHub,
 * which is half of what PRD §6 asks of `docs/`. `react-markdown` renders no raw
 * HTML by default, so left in place they arrive as a paragraph of literal
 * `<!--` text at the bottom of the page.
 *
 * Stripped rather than rendered: an author's note to themselves is not content.
 */
function stripComments(body: string): string {
  return body.replace(/<!--[\s\S]*?-->/g, "");
}

export function splitBody(rawBody: string): BodyBlock[] {
  const body = stripComments(rawBody);
  const blocks: BodyBlock[] = [];
  let current: BodyBlock = { heading: "", markdown: "" };
  const lines: string[] = [];

  const flush = () => {
    current.markdown = lines.join("\n").trim();
    if (current.heading || current.markdown) blocks.push({ ...current });
    lines.length = 0;
  };

  for (const line of body.split("\n")) {
    // `##` only. A `###` inside a block stays part of that block's markdown —
    // the four-heading contract is about level two, and a deeper heading is
    // content, not structure.
    const match = /^##\s+(.*?)\s*$/.exec(line);
    if (match) {
      flush();
      current = { heading: match[1], markdown: "" };
      continue;
    }
    lines.push(line);
  }
  flush();

  return blocks;
}

/**
 * A topic title as plain text — for `<title>`, where the backticks that
 * `TopicTitle` renders as code have nowhere to go.
 */
export function plainTitle(title: string): string {
  return title.replace(/`/g, "");
}
