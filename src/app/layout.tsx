import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Engineering Map",
  description:
    "A knowledge map for senior engineering interviews — browse a subject, drill down, follow the links out.",
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
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
