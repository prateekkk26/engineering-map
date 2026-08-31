import { cva } from "class-variance-authority";

/**
 * The one interaction gesture, with weight.
 *
 * Everything clickable used the same `rounded-lg p-4 hover:bg-accent/40
 * focus-visible:ring-2 focus-visible:ring-ring` string, so a whole section and
 * a single outbound link had identical visual weight. The page had no
 * hierarchy, and nothing but text size was carrying it.
 *
 * The variants are that missing hierarchy and nothing else — same radius, same
 * hover fill, same ring. What changes is the resting state: a card announces
 * itself, a line does not.
 *
 * Separate from `Button` on purpose. These wrap multi-line content in a
 * full-bleed `<Link>`; forcing them through a button component would be worse
 * than the duplication was.
 *
 * `SidebarTree`'s row style stays out of this — the rail is a denser context
 * with its own padding and hover, and collapsing the two would mean a variant
 * that fits neither.
 */
export const surface = cva(
  "block rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      level: {
        /** A destination. Section cards on home. */
        card: "p-4 ring-1 ring-border hover:bg-accent/40 hover:ring-foreground/20",
        /** A row in a list you own. Subsection rows, progress rows. */
        row: "p-4 ring-1 ring-border/60 hover:bg-accent/40",
        /** A line in a list. Topic rows, search results. No resting chrome. */
        line: "p-4 hover:bg-accent/40",
        /** A compact line in the rail column. Resources, related, prev/next. */
        inset: "p-3 hover:bg-accent/40",
      },
    },
    defaultVariants: { level: "line" },
  },
);
