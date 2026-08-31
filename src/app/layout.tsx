import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/shell/AppShell";
import { SITE_URL } from "@/lib/flags";
import { getNavTree } from "@/lib/nav-tree";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

// A large share of topic titles carry a backticked identifier — `this` and
// Function Binding, Promises, `async`/`await` & Combinators — so inline code
// appears in almost every list in the app. Without this it rendered in the
// system monospace, which is a second typeface nobody chose.
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

const DESCRIPTION =
  "A knowledge map for senior engineering interviews — browse a subject, drill down, follow the links out.";

export const metadata: Metadata = {
  // Required before anything else here: without it every relative URL in
  // `openGraph.images` warns at build and unfurls as a broken preview.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Engineering Map",
    // Replaces the `— Engineering Map` suffix each route used to append by
    // hand, which is one page away from being forgotten.
    template: "%s — Engineering Map",
  },
  description: DESCRIPTION,
  applicationName: "Engineering Map",
  authors: [{ name: "Prateek Rawat" }],
  openGraph: {
    type: "website",
    siteName: "Engineering Map",
    locale: "en_US",
    url: "/",
    title: "Engineering Map",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Map",
    description: DESCRIPTION,
  },
  // One SVG for the tab, shared with the manifest, rather than the usual pile
  // of PNG sizes: the mark is three circles and a line, so it rasterises
  // cleanly at every size a browser asks for.
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  // PRD §7: respect system light/dark, no theme switcher. Two entries so the
  // browser chrome follows the OS the same way the page tokens do.
  // The literal sRGB of `--background` in each scheme. Browser chrome cannot
  // read a CSS variable, so these are the one place the palette is duplicated —
  // change them with the tokens in `globals.css` or the address bar stops
  // matching the page.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1215" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read here, in a server component, so `docs/` is walked at build time and
  // only the slim nav tree crosses into the client shell.
  const tree = getNavTree();

  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, geistMono.variable)}
    >
      <body className="min-h-dvh">
        <AppShell tree={tree}>{children}</AppShell>
      </body>
    </html>
  );
}
