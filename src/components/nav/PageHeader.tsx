import { cn } from "@/lib/utils";

/**
 * The page heading, stated once.
 *
 * Four page types repeated the same `text-2xl font-medium tracking-tight`
 * string, which meant home, a section, a subsection and a topic were
 * typographically identical — the only cue about where you were was the
 * breadcrumb above it.
 *
 * `tone` is the depth, not a size. Home is the widest because it is the only
 * page a stranger lands on cold; the topic page is the tightest because it is
 * the one you are here to read, and a title that shouts is a title competing
 * with its own prose. A caller passing `size="4xl"` is how a scale drifts, so
 * the prop does not accept one.
 */
const tones = {
  home: "text-3xl sm:text-4xl leading-[1.1] font-semibold tracking-tight",
  section: "text-2xl sm:text-3xl leading-tight font-medium tracking-tight",
  subsection: "text-2xl leading-tight font-medium tracking-tight",
  topic: "text-2xl leading-tight font-medium tracking-tight",
} as const;

export function PageHeader({
  tone,
  children,
  lead,
  chips,
  className,
}: {
  tone: keyof typeof tones;
  children: React.ReactNode;
  /** The one-line description under the title. */
  lead?: React.ReactNode;
  /** Level and read-time chips, counts — anything that sits below the lead. */
  chips?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn(className)}>
      <h1 className={cn(tones[tone], "text-balance")}>{children}</h1>
      {lead ? (
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          {lead}
        </p>
      ) : null}
      {chips ? <div className="mt-3">{chips}</div> : null}
    </header>
  );
}
