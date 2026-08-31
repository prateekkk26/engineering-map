import type { Metadata } from "next";

/**
 * Per-page Open Graph and Twitter metadata, in one place.
 *
 * Four routes were each about to grow the same eight-line block, which is how
 * one of them ends up with a stale description or no card at all.
 *
 * The title is passed without the `— Engineering Map` suffix: `metadata.title.
 * template` in the root layout appends it, and doing both would double it. The
 * OG image is `/api/og`, a route handler rather than a colocated
 * `opengraph-image.tsx` — see the comment there for why that distinction is
 * worth minutes of build time.
 */
export function pageMetadata({
  title,
  description,
  kicker,
  path,
}: {
  /** Plain text, no backticks — pass topic titles through `plainTitle` first. */
  title: string;
  description: string;
  /** The trail above the title in the card, e.g. `Frontend › React`. */
  kicker?: string;
  /** Absolute path, leading slash. Resolved against `metadataBase`. */
  path: string;
}): Metadata {
  const image = `/api/og?title=${encodeURIComponent(title)}${
    kicker ? `&kicker=${encodeURIComponent(kicker)}` : ""
  }`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: "Engineering Map",
      url: path,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
