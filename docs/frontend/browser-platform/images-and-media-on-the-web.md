---
title: Images & Media on the Web
summary: Responsive images, modern formats, and the markup that decides whether the browser downloads the right bytes.
level: core
minutes: 20
order: 18
tags: [browser, images, performance, media]

related:
  - frontend/performance/image-and-media-optimisation
  - frontend/nextjs/images-fonts-and-assets
  - frontend/performance/core-web-vitals

resources:
  - title: Responsive images
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
    source: MDN
    type: docs
    minutes: 30
    primary: true
  - title: Choose the right image format
    url: https://web.dev/articles/choose-the-right-image-format
    source: web.dev
    type: article
    minutes: 20
  - title: Lazy loading images
    url: https://web.dev/articles/browser-level-image-lazy-loading
    source: web.dev
    type: article
    minutes: 15
---

## In one line

`srcset` and `sizes` let the browser choose the right file for the device before layout is known, `<picture>` lets you choose the format or the crop, and `width`/`height` reserve the space that stops the page jumping.

## What it is

Images are usually the largest bytes on a page and the most common LCP element, so the markup matters more than it looks.

**`srcset` with `sizes`** is for the same image at different resolutions. `srcset` lists candidates with their intrinsic widths (`photo-800.jpg 800w`), and `sizes` tells the browser how wide the image will be rendered at each breakpoint — necessary because the preload scanner picks a candidate before CSS has been applied. A wrong `sizes` value is the single most common cause of a responsive image still downloading a 2000px file on a phone.

**`<picture>`** is for genuinely different sources: art direction (a different crop on mobile) or format negotiation, with the browser taking the first `<source>` it supports. That is how you serve AVIF to browsers that handle it and fall back to WebP and JPEG.

On formats: AVIF is smallest and slowest to encode, WebP is the safe default with universal support, JPEG remains the fallback, PNG is for transparency and flat graphics, and SVG for anything vector. For animation, a muted autoplaying `<video>` is dramatically smaller than an animated GIF and should be the default.

**`loading="lazy"`** is native lazy loading with no observer required — but never on the LCP image, where it delays the metric you are judged on. `fetchpriority="high"` marks the hero, and `decoding="async"` keeps decode off the critical path.

**`width` and `height` attributes** are not legacy. The browser computes an aspect ratio from them and reserves the box before the image loads, which is what prevents cumulative layout shift. With CSS sizing, `aspect-ratio` does the same job.

Video adds its own: `preload="metadata"` to avoid downloading the whole file, `poster` for an immediate first frame, captions as a real requirement rather than a nicety, and HLS or DASH for anything long enough to need adaptive bitrate.

## Why it matters

Images dominate LCP and CLS, the two Core Web Vitals most often failed, so this is the highest-yield markup knowledge in performance work.

It also comes up in review: `<img>` without dimensions, a lazy-loaded hero, or a 3MB PNG are the fastest signals that nobody thought about loading.

## Key points

- `srcset` plus a correct `sizes` is what stops phones downloading desktop-sized images; the preload scanner needs `sizes` because CSS has not run yet.
- `<picture>` is for art direction and format negotiation, not resolution switching.
- AVIF then WebP with a JPEG fallback covers modern delivery; use muted video instead of animated GIFs.
- `loading="lazy"` for below-the-fold images only — never the LCP image, which wants `fetchpriority="high"`.
- Always set `width` and `height` (or `aspect-ratio`) to reserve space and prevent layout shift.
- For video, set `preload="metadata"` and a `poster`, and treat captions as required.
