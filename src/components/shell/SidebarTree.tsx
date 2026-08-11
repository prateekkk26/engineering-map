"use client";

import { createElement, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { TopicTitle } from "@/components/nav/TopicTitle";
import { iconFor } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { NavSection, NavSubsection, NavTopic, NavTree } from "@/lib/nav-tree";

/**
 * The navigation rail — all three levels of `docs/`.
 *
 * Two rules shape the whole component:
 *
 * **Collapsed children are not rendered.** 359 topics in the DOM of every page
 * is not free, and nothing but the open branch is ever visible. A fully
 * collapsed tree is eight rows.
 *
 * **The initial expansion is derived from the URL.** It has to be, or the
 * server and the client would render different trees and React would throw a
 * hydration mismatch. Nothing is read from storage for the same reason.
 *
 * Each row is a link *and* a disclosure: the label navigates to the section or
 * subsection page, the chevron beside it opens the branch without leaving the
 * page you are reading. Collapsing the two into one control would mean either
 * losing the section pages or making the rail unable to preview a branch.
 */

/** The section and subsection slugs on the way to the current URL. */
function ancestorsOf(pathname: string): string[] {
  const parts = pathname.split("/").filter(Boolean);
  const trail: string[] = [];
  if (parts.length >= 1) trail.push(parts[0]);
  if (parts.length >= 2) trail.push(`${parts[0]}/${parts[1]}`);
  return trail;
}

function rowClasses(active: boolean): string {
  return cn(
    "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring",
    active && "bg-accent font-medium text-accent-foreground",
  );
}

function Chevron({
  open,
  label,
  onClick,
}: {
  open: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
      className="shrink-0 rounded-md p-1 text-muted-foreground outline-none hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ChevronRight
        className={cn("size-3.5 transition-transform", open && "rotate-90")}
        aria-hidden
      />
    </button>
  );
}

function TopicRow({ topic, active }: { topic: NavTopic; active: boolean }) {
  return (
    <li>
      <Link
        href={`/${topic.slug}`}
        aria-current={active ? "page" : undefined}
        className={cn(rowClasses(active), "text-sm text-muted-foreground", active && "text-accent-foreground")}
      >
        <span className="truncate">
          <TopicTitle>{topic.title}</TopicTitle>
        </span>
      </Link>
    </li>
  );
}

function SubsectionRow({
  subsection,
  pathname,
  open,
  onToggle,
}: {
  subsection: NavSubsection;
  pathname: string;
  open: boolean;
  onToggle: () => void;
}) {
  const active = pathname === `/${subsection.slug}`;
  const count =
    subsection.written === subsection.planned
      ? `${subsection.planned}`
      : `${subsection.written}/${subsection.planned}`;

  // Same rule the section page applies to its rows: a subsection with nothing
  // written renders, because the plan is part of the claim about what a senior
  // should know — but it is not a link, because the page it would open is
  // empty.
  if (subsection.written === 0) {
    return (
      <li className="flex items-center gap-1 pl-5 opacity-50">
        <span className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm">
          <span className="truncate">{subsection.title}</span>
        </span>
        <span className="shrink-0 pr-1 text-xs text-muted-foreground tabular-nums">
          {subsection.planned}
        </span>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center gap-1 pl-3">
        <Chevron open={open} label={subsection.title} onClick={onToggle} />
        <Link
          href={`/${subsection.slug}`}
          aria-current={active ? "page" : undefined}
          className={cn(rowClasses(active), "text-sm")}
        >
          <span className="truncate">{subsection.title}</span>
        </Link>
        <span className="shrink-0 pr-1 text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>

      {open ? (
        <ul className="mt-0.5 ml-[1.4rem] space-y-0.5 border-l border-border pl-2">
          {subsection.topics.map((topic) => (
            <TopicRow
              key={topic.slug}
              topic={topic}
              active={pathname === `/${topic.slug}`}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function SectionRow({
  section,
  pathname,
  expanded,
  onToggle,
}: {
  section: NavSection;
  pathname: string;
  expanded: Set<string>;
  onToggle: (key: string) => void;
}) {
  const active = pathname === `/${section.slug}`;
  const open = expanded.has(section.slug);

  const icon = createElement(iconFor(section.icon), {
    className: cn(
      "size-4 shrink-0",
      section.specified ? "text-muted-foreground" : "text-muted-foreground/70",
    ),
    "aria-hidden": true,
  });

  // Six of the eight sections have no content yet. Shown, muted, unclickable —
  // the same trade the home page makes.
  if (!section.specified) {
    return (
      <li className="flex items-center gap-1 opacity-50">
        <span className="w-[1.4rem] shrink-0" />
        <span className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm">
          {icon}
          <span className="truncate">{section.title}</span>
        </span>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center gap-1">
        <Chevron
          open={open}
          label={section.title}
          onClick={() => onToggle(section.slug)}
        />
        <Link
          href={`/${section.slug}`}
          aria-current={active ? "page" : undefined}
          className={cn(rowClasses(active), "text-sm font-medium")}
        >
          {icon}
          <span className="truncate">{section.title}</span>
        </Link>
      </div>

      {open ? (
        <ul className="mt-0.5 space-y-0.5">
          {section.subsections.map((subsection) => (
            <SubsectionRow
              key={subsection.slug}
              subsection={subsection}
              pathname={pathname}
              open={expanded.has(subsection.slug)}
              onToggle={() => onToggle(subsection.slug)}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function SidebarTree({ tree }: { tree: NavTree }) {
  const pathname = usePathname();
  const scroller = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(ancestorsOf(pathname)),
  );

  /**
   * Open the branch for the current page when the navigation came from
   * somewhere other than the rail — prev/next, a related topic, ⌘K.
   *
   * Adjusted during render rather than in an effect. React documents this as
   * the way to react to a changed input, and the alternative — `setState`
   * inside `useEffect` — is both a cascading render and a lint error under the
   * compiler's rules.
   *
   * No `sessionStorage` here, deliberately: the rail is mounted by the root
   * layout, so it does not unmount between navigations and its expansion and
   * scroll position already survive them. The only thing storage would buy is
   * state across a full reload, and on a reload the URL-derived branch is the
   * right thing to show anyway.
   */
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    const ancestors = ancestorsOf(pathname);
    if (ancestors.some((key) => !expanded.has(key))) {
      setExpanded(new Set([...expanded, ...ancestors]));
    }
  }

  // Bring the active row into view when it is below the fold — deep in
  // Frontend, the highlighted topic is otherwise 150 rows down. DOM only, so
  // an effect is the right place for it.
  useEffect(() => {
    const active = scroller.current?.querySelector('[aria-current="page"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    /* `overflow-x-hidden` matters: `scrollIntoView` nudges the nearest
       scrollable ancestor on both axes, and a deep row plus its indentation is
       wide enough to shift the whole rail sideways without it. */
    <div
      ref={scroller}
      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pb-8"
    >
      <nav aria-label="Sections">
        <ul className="space-y-0.5">
          {tree.sections.map((section) => (
            <SectionRow
              key={section.slug}
              section={section}
              pathname={pathname}
              expanded={expanded}
              onToggle={toggle}
            />
          ))}
        </ul>
      </nav>

      {/* `_shared/` topics live at their own URL and belong to no section, so
          without this group the only way to open one directly is search. */}
      {tree.shared.length > 0 ? (
        <nav aria-label="Shared concepts" className="mt-4 border-t border-border pt-3">
          <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Shared concepts
          </p>
          <ul className="space-y-0.5">
            {tree.shared.map((topic) => (
              <TopicRow
                key={topic.slug}
                topic={topic}
                active={pathname === `/${topic.slug}`}
              />
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
