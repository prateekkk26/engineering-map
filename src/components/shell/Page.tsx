import { cn } from "@/lib/utils";

/**
 * The content column, in one place.
 *
 * All four page types used to repeat the same container string, which is how
 * they drifted apart in width the moment one of them was edited. PRD §7's
 * "max-width text, generous line height" is a single decision, so it is stated
 * once here.
 *
 * `wide` is for the topic page only. At `xl` that page grows a second column
 * for the Actions & links rail, and stops being a centred block: it spans the
 * space the sidebar leaves, so the rail sits against the right edge of the
 * window rather than floating in from it. The prose column is capped
 * separately in `TopicView`, so widening the container widens the gap between
 * prose and links, never the reading measure.
 *
 * A ceiling at `2xl` all the same — on a 34-inch monitor, edge-to-edge means
 * the rail is a head-turn away from the text it belongs to.
 */
export function Page({
  children,
  wide = false,
  className,
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-4xl px-4 pb-16",
        wide && "xl:max-w-none xl:px-8 2xl:max-w-[104rem]",
        className,
      )}
    >
      {children}
    </main>
  );
}
