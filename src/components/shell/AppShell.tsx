"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { CircleDashed, Menu, Search } from "lucide-react";

import { CommandPalette } from "@/components/shell/CommandPalette";
import { SidebarTree } from "@/components/shell/SidebarTree";
import type { NavTree } from "@/lib/nav-tree";

/**
 * The app frame: navigation rail on the left, page in the middle.
 *
 * PRD §7 says "one column, always", written when this was a phone-only reading
 * app. It still holds below `lg` — the rail is a drawer there and the page is
 * exactly what it was. Above `lg` the single column left two empty gutters and
 * made every topic a three-page walk from wherever you were, so the rail is
 * always visible instead.
 *
 * This component owns two pieces of state and nothing else: whether the mobile
 * drawer is open, and whether the palette is. Both are here rather than in the
 * components that render them because the top bar has to be able to open both.
 */
function SidebarHeader({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="shrink-0 px-3 py-3">
      <Link
        href="/"
        className="block rounded-md px-2 py-1 text-sm font-medium tracking-tight outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
      >
        Engineering Map
      </Link>

      {/* A button dressed as a field, not a field. The input lives in the
          palette; duplicating a real one here would mean two search states to
          keep in step. */}
      <button
        type="button"
        onClick={onSearch}
        className="mt-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground ring-1 ring-border outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border px-1 font-sans text-[0.7rem]">
          ⌘K
        </kbd>
      </button>

      {/* The only nav entry that isn't part of the content tree, so it sits
          with the search button rather than in the tree below it. */}
      <Link
        href="/progress"
        className="mt-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CircleDashed className="size-4 shrink-0" aria-hidden />
        Progress
      </Link>
    </div>
  );
}

export function AppShell({
  tree,
  children,
}: {
  tree: NavTree;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);

  /**
   * The drawer is open *for a particular page*.
   *
   * Storing the path it was opened at, rather than a boolean plus an effect
   * that closes it on navigation, makes "a tap in the drawer closes it" fall
   * out of the state itself: the tap changes `pathname`, the two stop
   * matching, and the drawer is shut on the same render that shows the new
   * page — no effect, no flash of the drawer over the page you just asked for.
   */
  const [openedAt, setOpenedAt] = useState<string>();
  const drawerOpen = openedAt === pathname;

  const setDrawerOpen = (open: boolean) =>
    setOpenedAt(open ? pathname : undefined);

  return (
    <div className="lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] 2xl:grid-cols-[21rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarHeader onSearch={() => setPaletteOpen(true)} />
        <SidebarTree tree={tree} />
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex h-12 items-center gap-1 border-b border-border bg-background/90 px-2 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="rounded-md p-2 outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <Link
            href="/"
            className="flex-1 truncate rounded-md px-1 py-1 text-sm font-medium tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Engineering Map
          </Link>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search every topic"
            className="rounded-md p-2 outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="size-5" aria-hidden />
          </button>
        </div>

        {children}
      </div>

      {/* Radix rather than a hand-rolled panel: the drawer covers the page, so
          it needs the focus trap, the escape key and the scroll lock, and none
          of those are worth reimplementing. */}
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 flex w-[19rem] max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground shadow-xl outline-none lg:hidden"
          >
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <SidebarHeader
              onSearch={() => {
                setDrawerOpen(false);
                setPaletteOpen(true);
              }}
            />
            <SidebarTree tree={tree} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
