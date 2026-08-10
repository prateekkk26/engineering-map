import { Fragment } from "react";

/**
 * Renders a topic title, honouring backticks as inline code.
 *
 * Titles in `docs/` are written as markdown fragments — `` `this` and Function
 * Binding ``, `` Promises, `async`/`await` & Combinators `` — because they read
 * that way on GitHub, which PRD §6 makes an equal surface to the app. Rendered
 * as plain text they show the backticks, which looks like a bug on every list
 * the title appears in.
 *
 * A three-line splitter rather than a markdown renderer: titles are one line of
 * text, and the block-level parser would wrap each one in a paragraph.
 */
export function TopicTitle({ children }: { children: string }) {
  const parts = children.split("`");

  return (
    <>
      {parts.map((part, i) =>
        // Odd indices sit between a pair of backticks. An unbalanced backtick
        // therefore renders as text, which is the right failure: it shows the
        // typo instead of swallowing half the title into a code span.
        i % 2 === 1 && i < parts.length - 1 ? (
          <code
            key={i}
            className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]"
          >
            {part}
          </code>
        ) : (
          <Fragment key={i}>{i % 2 === 1 ? `\`${part}` : part}</Fragment>
        ),
      )}
    </>
  );
}
