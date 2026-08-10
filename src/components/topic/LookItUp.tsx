import { MessageSquare, Search } from "lucide-react";

import type { Topic } from "@/lib/types";

/**
 * PRD §5 — "one-tap outbound actions for when the curated links aren't enough".
 *
 * Two, and only two: search the web, or open Claude with the question already
 * typed. This is the escape hatch from a page that didn't go deep enough, not
 * a toolbar — anything else added here has to pass the §7 test first.
 *
 * The Claude prompt carries the section and summary as well as the title,
 * because "explain closures" and "explain closures, as asked in a senior
 * frontend interview" get materially different answers. PRD §2 rules out AI
 * *features*; a pre-filled link to a chat is a link.
 */
function claudePrompt(topic: Topic, sectionTitle: string): string {
  return [
    `Explain "${topic.title}" to me.`,
    topic.summary,
    "",
    `Context: I'm preparing for senior frontend and full-stack interviews, and this is a ${sectionTitle} topic.`,
    "Assume I'm a competent engineer. Go deeper than an overview: cover the mechanism, the failure modes, and what a strong answer to an interview follow-up sounds like.",
  ].join("\n");
}

function ActionRow({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: typeof Search;
  label: string;
  hint: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-lg p-3 outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0">
        <span className="block text-sm leading-snug font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {hint}
        </span>
      </span>
    </a>
  );
}

export function LookItUp({
  topic,
  sectionTitle,
}: {
  topic: Topic;
  sectionTitle: string;
}) {
  const query = `${topic.title} ${sectionTitle}`;

  return (
    <section>
      <h2 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Look it up
      </h2>
      <ul>
        <li>
          <ActionRow
            href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
            icon={Search}
            label="Search the web"
            hint={query}
          />
        </li>
        <li>
          <ActionRow
            href={`https://claude.ai/new?q=${encodeURIComponent(claudePrompt(topic, sectionTitle))}`}
            icon={MessageSquare}
            label="Explain this in Claude"
            hint="Opens a new chat with the question pre-filled"
          />
        </li>
      </ul>
    </section>
  );
}
