/**
 * Section icons.
 *
 * PRD §7: "Icons for recognition only — one per section, one per resource type.
 * A small consistent set, no decoration." So this is a closed map, not a
 * dynamic lookup into lucide: an unmapped name fails the build (see
 * `loadSection` in `content.ts`) instead of rendering a gap where the icon goes.
 *
 * The names come from each section's `_meta.yaml` and already match lucide's,
 * so adding a section is one line here.
 */

import {
  Binary,
  BookOpen,
  Code2,
  Database,
  FileText,
  GraduationCap,
  Monitor,
  Network,
  Newspaper,
  Play,
  Server,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { ResourceType } from "@/lib/types";

const ICONS = {
  binary: Binary,
  database: Database,
  monitor: Monitor,
  network: Network,
  server: Server,
  sparkles: Sparkles,
  users: Users,
  wrench: Wrench,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function isKnownIcon(name: string): name is IconName {
  return name in ICONS;
}

/**
 * The other half of PRD §7's "one per section, one per resource type".
 *
 * Total, not a lookup: `ResourceType` is a closed union validated in
 * `assert-content.ts`, so adding a type to the union fails here at compile time
 * rather than at render.
 */
const RESOURCE_ICONS = {
  docs: FileText,
  article: Newspaper,
  video: Play,
  repo: Code2,
  book: BookOpen,
  course: GraduationCap,
} as const satisfies Record<ResourceType, LucideIcon>;

export function iconForResource(type: ResourceType): LucideIcon {
  return RESOURCE_ICONS[type];
}

export function iconFor(name: string): LucideIcon {
  if (!isKnownIcon(name)) {
    // Unreachable via the loader, which validates at build time. Kept as a
    // real throw rather than a fallback glyph so a future caller that skips
    // validation fails loudly instead of shipping a wrong icon.
    throw new Error(`Unknown icon: ${name}`);
  }
  return ICONS[name];
}
