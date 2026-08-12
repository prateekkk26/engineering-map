/**
 * The wordmark's glyph, in the page rather than the tab.
 *
 * Same shape as `public/icon.svg` — a node branching into two — but drawn in
 * `currentColor` with no tile behind it. The favicon needs a filled tile to
 * survive the browser's tab strip; here it sits next to text on the app's own
 * background, so it should read as part of the type, not as a badge.
 *
 * Deliberately not in `lib/icons.tsx`: that file is a closed map of section and
 * resource icons that the content loader validates against. This is chrome.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 16h6.5V9.5H21M16.5 16v6.5H21"
      />
      <circle cx="9.5" cy="16" r="3.4" fill="currentColor" />
      <circle cx="22.5" cy="9.5" r="2.8" fill="currentColor" />
      <circle cx="22.5" cy="22.5" r="2.8" fill="currentColor" />
    </svg>
  );
}
