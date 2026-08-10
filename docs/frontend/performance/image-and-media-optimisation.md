---
title: Image & Media Optimisation
summary: Serving the smallest acceptable bytes for the actual display size, and the pipeline decisions behind it.
level: core
minutes: 20
order: 9
tags: [performance, images, media]

related:
  - frontend/browser-platform/images-and-media-on-the-web
  - frontend/nextjs/images-fonts-and-assets
  - frontend/performance/network-and-delivery

resources:
  - title: Optimize your images
    url: https://web.dev/learn/performance/image-performance
    source: web.dev
    type: article
    minutes: 30
    primary: true
  - title: Squoosh
    url: https://squoosh.app/
    source: GoogleChromeLabs
    type: docs
    minutes: 10
  - title: Optimize web video
    url: https://web.dev/learn/performance/video-performance
    source: web.dev
    type: article
    minutes: 25
---

## In one line

Most image weight comes from serving a file far larger than the space it is displayed in, so the fix is dimensions and format before it is compression settings.

## What it is

Work through it in order of impact.

**Dimensions first.** A 4000px photo displayed in a 400px column is 100 times the pixels needed. Generate a set of widths and let `srcset` pick. Account for device pixel ratio — a 400px slot on a 2x screen wants an 800px file, not a 4000px one.

**Format second.** AVIF is typically 30–50% smaller than WebP at similar quality and slower to encode; WebP is the safe universal default; JPEG is the fallback; PNG only for transparency or flat graphics; SVG for vectors, minified and ideally inlined when small. Serve modern formats with `<picture>` fallbacks, or let a CDN negotiate by `Accept` header.

**Quality third.** Perceptual quality around 75–80 is usually indistinguishable from 100 at a fraction of the size, and the difference between 80 and 90 is mostly bytes. Test on the actual content — photographs tolerate compression far better than screenshots with text.

Then the delivery decisions. An **image CDN** that transforms on the fly by URL parameters is the pragmatic default: one original, every variant derived, cached at the edge. It removes the build-time generation problem and handles format negotiation. The alternative — building variants at deploy time — works when the set of images is fixed and small.

For **video**, the wins are larger and less well known. Replacing an animated GIF with a muted, looping, `playsinline` MP4 or WebM typically cuts size by an order of magnitude. Set `preload="metadata"` so the browser does not fetch the whole file, provide a `poster` so there is something immediately, and use HLS or DASH for adaptive bitrate on anything long.

Two frequent oversights: an SVG exported from a design tool often carries kilobytes of editor metadata that SVGO strips, and a hero image loaded lazily delays LCP — mark it `fetchpriority="high"` instead.

## Why it matters

Images are typically the majority of page weight and the usual LCP element, so this is the highest-yield optimisation on most sites — often larger than every JavaScript change combined.

It is also cheap to demonstrate: a before-and-after on total transfer size is the most legible performance result you can show a stakeholder.

## Key points

- Serving files larger than their display size is the dominant cost — fix dimensions before compression.
- Account for device pixel ratio; a 2x screen needs double, not ten times.
- AVIF for smallest, WebP as the safe default, JPEG as fallback; SVG for vectors, minified with SVGO.
- Quality 75–80 is usually visually lossless for photographs; test on your actual content.
- An image CDN transforming by URL is the pragmatic default and handles format negotiation for you.
- Replace animated GIFs with muted looping video for order-of-magnitude savings.
- Never lazy-load the LCP image; mark it high priority instead.
