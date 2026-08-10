import type { MetadataRoute } from "next";

/**
 * Web app manifest — PRD §8 Phase 3: "installable to the home screen".
 *
 * The whole point of the map is that it is reachable from a phone, on a train,
 * in three taps. Installing it removes the browser chrome and the URL bar from
 * that path.
 *
 * `display: "standalone"` rather than `fullscreen` so the status bar stays —
 * this is a reading app used in short sessions, not something to be immersed in.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Engineering Map",
    short_name: "Eng Map",
    description:
      "A knowledge map for senior engineering interviews — browse a subject, drill down, follow the links out.",
    start_url: "/",
    display: "standalone",
    // Matches the light and dark `--background` tokens in globals.css. The
    // manifest cannot express a media query, so this is the light value; the
    // page itself still follows the system setting.
    background_color: "#ffffff",
    theme_color: "#ffffff",
  };
}
