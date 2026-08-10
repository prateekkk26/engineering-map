---
title: Images, Fonts & Assets
summary: What next/image and next/font actually do for your Core Web Vitals, and the Next 16 defaults that changed underneath them.
level: core
minutes: 20
order: 13
tags: [nextjs, performance, images, fonts]

related:
  - frontend/performance/image-and-media-optimisation
  - frontend/performance/font-loading-strategy
  - frontend/performance/core-web-vitals

resources:
  - title: Image Optimization
    url: https://nextjs.org/docs/app/getting-started/images
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: Font Optimization
    url: https://nextjs.org/docs/app/getting-started/fonts
    source: Next.js
    type: docs
    minutes: 20
  - title: next/image
    url: https://nextjs.org/docs/app/api-reference/components/image
    source: Next.js
    type: docs
    minutes: 30
---

## In one line

`next/image` and `next/font` exist to protect two Core Web Vitals — LCP and CLS — by reserving space, serving the right bytes, and removing the network request that makes text flash.

## What it is

`next/image` does four things. It reserves layout space from the width and height, which is what stops the image pushing content down as it loads — the largest single source of CLS. It generates a `srcset` so a phone does not download a desktop-sized file. It converts to modern formats on demand. And it lazy-loads everything except what you mark `priority`.

That last one is the recurring mistake: the hero image is the LCP element, and lazy-loading it means the browser does not even start fetching until layout runs. Mark it `priority`. Equally, marking everything `priority` removes the benefit and floods the connection.

Next 16 changed several defaults, which matters if you are reading older material. `minimumCacheTTL` went from 60 seconds to 4 hours. `qualities` now defaults to `[75]` only, and an out-of-range `quality` prop is coerced to the nearest allowed value. `16` was dropped from `imageSizes`. Local images with query strings need `images.localPatterns.search` configured. Remote hosts must be listed in `remotePatterns` — `domains` is deprecated — and local IP optimisation is blocked unless you explicitly allow it, which is an SSRF guard.

`next/font` solves a different problem. It downloads the font at build time and self-hosts it, so there is no request to a third-party origin at runtime — one less connection, no privacy hop, and no third party in your critical path. It generates a `@font-face` with a size-adjusted fallback so the swap from fallback to real font does not shift layout, and applies `font-display: swap` by default. Variable fonts are worth preferring: one file covering every weight.

Static files in `public/` are served as-is with no processing, which is fine for a favicon and wrong for a 4MB PNG. Anything user-facing should go through the image pipeline or a CDN.

## Why it matters

LCP and CLS are two of the three Core Web Vitals, and images and fonts are the usual cause of failing both. It is also the cheapest credibility signal in a take-home: raw `<img>` tags and a Google Fonts `<link>` read as not having thought about performance.

## Key points

- Width and height (or `fill` with a sized container) reserve space and are the main defence against CLS.
- Mark the LCP image `priority`; lazy-loading the hero delays the metric the page is judged on.
- Next 16 defaults changed: 4-hour `minimumCacheTTL`, `qualities: [75]`, no `16` in `imageSizes`, `localPatterns.search` for query strings.
- Use `remotePatterns` rather than the deprecated `domains`, and leave local IP optimisation blocked unless you understand the SSRF risk.
- `next/font` self-hosts at build time, removing a third-party request and the associated privacy hop.
- The generated size-adjusted fallback is what stops the font swap shifting layout; prefer variable fonts for fewer files.
- `public/` is unprocessed — don't put unoptimised product imagery there.
