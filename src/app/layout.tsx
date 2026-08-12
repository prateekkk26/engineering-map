import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { AppShell } from "@/components/shell/AppShell";
import { getNavTree } from "@/lib/nav-tree";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Engineering Map",
  description:
    "A knowledge map for senior engineering interviews — browse a subject, drill down, follow the links out.",
  // One SVG for the tab, shared with the manifest, rather than the usual pile
  // of PNG sizes: the mark is three circles and a line, so it rasterises
  // cleanly at every size a browser asks for.
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  // PRD §7: respect system light/dark, no theme switcher. Two entries so the
  // browser chrome follows the OS the same way the page tokens do.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read here, in a server component, so `docs/` is walked at build time and
  // only the slim nav tree crosses into the client shell.
  const tree = getNavTree();

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-dvh">
        <AppShell tree={tree}>{children}</AppShell>
      </body>
    </html>
  );
}
