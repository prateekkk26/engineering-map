import { ImageResponse } from "next/og";

/**
 * The link-preview card, rendered on demand.
 *
 * **Why a route handler and not `opengraph-image.tsx`.** Next statically
 * optimises generated images by default, so a file colocated under
 * `[section]/[subsection]/[topic]/` would render one Satori image for every one
 * of the 573 prerendered topic params — minutes of build time and tens of
 * megabytes of PNGs, on a project whose defining property is a fast static
 * build. Reading `searchParams` makes this request-time by definition, so it is
 * never prerendered; the CDN caches the responses instead, and the build does
 * not know these exist.
 *
 * Satori supports a subset of CSS: flexbox only, `display: "flex"` stated on
 * every container with more than one child, and no CSS variables — so the
 * palette is written out as literals here rather than read from `globals.css`.
 * They are the light-scheme tokens, because a link preview is composited on
 * whatever surface the reader's client uses and cannot follow their theme.
 */
export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

/** `--background`, `--foreground`, `--muted-foreground`, `--brand`, `--border`. */
const BG = "#ffffff";
const FG = "#252525";
const MUTED = "#8e8e8e";
const BRAND = "#3d4fd4";
const BORDER = "#ebebeb";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  // Clamped rather than shrunk to fit: a runaway title would otherwise set the
  // type size for every card. 90 characters is the longest topic title plus
  // room, and the ellipsis is honest about the cut.
  const raw = params.get("title")?.slice(0, 120) ?? "Engineering Map";
  const title = raw.length === 120 ? `${raw.trimEnd()}…` : raw;
  const kicker = params.get("kicker")?.slice(0, 80);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: FG,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {kicker ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: MUTED,
                marginBottom: 28,
              }}
            >
              {kicker}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: title.length > 48 ? 66 : 82,
              lineHeight: 1.1,
              letterSpacing: -2,
              fontWeight: 600,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            borderTop: `2px solid ${BORDER}`,
            paddingTop: 28,
            fontSize: 28,
          }}
        >
          {/* The wordmark's glyph, inline: Satori renders SVG children but
              cannot fetch `/icon.svg`, and an external request here would put
              the network on the path of every preview. */}
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <path
              d="M9 16h6M15 16V9h8M15 16v7h8"
              stroke={BRAND}
              strokeWidth="2.4"
            />
            <circle cx="6" cy="16" r="3.4" fill={BRAND} />
            <circle cx="26" cy="9" r="3.4" fill={BRAND} />
            <circle cx="26" cy="23" r="3.4" fill={BRAND} />
          </svg>
          <div style={{ display: "flex", fontWeight: 600 }}>Engineering Map</div>
          <div style={{ display: "flex", color: MUTED }}>
            what a senior engineer is expected to know
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        // The card for a given title never changes, and the CDN is what keeps
        // this off the render path for the second reader who shares the link.
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
