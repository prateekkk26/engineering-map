import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { LEAD_HEADING, splitBody } from "@/lib/topic-body";
import { cn } from "@/lib/utils";

/**
 * The prose half of the topic page — the four blocks of CONVENTIONS §3.
 *
 * No `@tailwindcss/typography`: the body vocabulary here is paragraphs, bullets,
 * inline code, bold and links, and an explicit component map is both smaller
 * and the only way the reading measure stays under this project's control.
 *
 * Rendered on the server. `react-markdown` never reaches the client bundle,
 * which matters because the alternative — shipping the parser plus every
 * topic's body — is exactly the "fast over fancy" trade PRD §7 rules out.
 */
const components: Components = {
  p: ({ children }) => (
    <p className="mt-4 leading-relaxed first:mt-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 space-y-2 first:mt-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 first:mt-0">{children}</ol>
  ),
  li: ({ children }) => (
    // Hanging bullet rather than `list-disc`, so a wrapped bullet — most of
    // them, on a phone — aligns under its own text instead of under the marker.
    <li className="relative pl-5 leading-relaxed before:absolute before:left-1 before:text-muted-foreground before:content-['—'] [ol_&]:pl-0 [ol_&]:before:content-none">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-3 text-sm first:mt-0">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="underline underline-offset-4 hover:text-muted-foreground"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-2 border-border pl-4 text-muted-foreground first:mt-0">
      {children}
    </blockquote>
  ),
  // Level-two headings are the block structure and are rendered by the block
  // loop below, so anything reaching this map is a `###` inside a block.
  h3: ({ children }) => (
    <h3 className="mt-6 font-medium first:mt-0">{children}</h3>
  ),
};

function Prose({ markdown, lead }: { markdown: string; lead: boolean }) {
  return (
    <div className={cn("text-sm", lead && "text-base leading-relaxed")}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </Markdown>
    </div>
  );
}

export function TopicBody({ body }: { body: string }) {
  const blocks = splitBody(body).filter((block) => block.markdown.length > 0);

  // CONVENTIONS §7: "A topic with good frontmatter, real resources, and an
  // empty body is a legitimate intermediate state — it's already useful." So
  // say so plainly and let the links below carry the page, rather than
  // rendering a blank stretch the reader has to interpret.
  if (blocks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Not written yet — the links below are the page for now.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {blocks.map((block, i) => {
        const isLead = block.heading === LEAD_HEADING;
        return (
          <section key={`${block.heading}-${i}`}>
            {block.heading ? (
              <h2 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {block.heading}
              </h2>
            ) : null}
            <Prose markdown={block.markdown} lead={isLead} />
          </section>
        );
      })}
    </div>
  );
}
