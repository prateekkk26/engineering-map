---
title: Font Loading Strategy
summary: Avoiding invisible text and the layout shift that follows, with subsetting, self-hosting and a matched fallback.
level: core
minutes: 20
order: 10
tags: [performance, fonts, typography]

related:
  - frontend/nextjs/images-fonts-and-assets
  - frontend/performance/core-web-vitals
  - frontend/browser-platform/critical-rendering-path

resources:
  - title: Best practices for fonts
    url: https://web.dev/articles/font-best-practices
    source: web.dev
    type: article
    minutes: 25
    primary: true
  - title: font-display
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
    source: MDN
    type: docs
    minutes: 15
  - title: Improved font fallbacks
    url: https://developer.chrome.com/blog/font-fallbacks
    source: Chrome
    type: article
    minutes: 20
---

## In one line

A web font is discovered late, blocks or swaps text when it arrives, and changes the metrics of everything on the page — so the strategy is to shorten the wait and make the fallback match.

## What it is

Fonts are late-discovered by design: the browser only knows it needs one after parsing the CSS that references it and finding an element that uses it. That is two dependencies deep before the request even starts, which is why `<link rel="preload" as="font" crossorigin>` for the one or two critical faces is standard practice. The `crossorigin` attribute is required even for same-origin fonts, and omitting it causes a duplicate fetch.

`font-display` decides what happens while waiting. `block` hides text briefly then swaps — the invisible-text failure (FOIT). `swap` shows the fallback immediately and swaps when ready, guaranteeing visible text at the cost of a visible reflow (FOUT). `optional` gives a very short window and otherwise sticks with the fallback for that page load, which is the best choice for CLS because it will not swap late. `swap` is the common default; `optional` is the right one when the brand font is not essential.

The swap is where CLS comes from: the fallback and the web font have different metrics, so text reflows when it changes. The modern fix is a **metrics-adjusted fallback** — `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` on a `@font-face` for the local fallback, tuned so it occupies the same space. Next's `next/font` generates this automatically, and it turns a visible jump into an almost imperceptible one.

The other levers are about size. **Subsetting** to the characters you actually use (Latin only, dropping unused glyphs) often cuts a font by more than half. **Variable fonts** replace four or five static weight files with one, and are usually smaller in total if you use more than two weights. WOFF2 is the only format worth shipping.

**Self-host.** Third-party font hosting means an extra connection, an extra DNS lookup, a privacy consideration under GDPR, and no ability to preload effectively across origins. Build-time self-hosting is what `next/font` does, and it is strictly better.

## Why it matters

Fonts are a top-three cause of CLS and a common cause of slow-feeling text rendering, both of which are Core Web Vitals concerns.

It is also visible design quality: FOIT looks broken, and a large late reflow looks amateurish, so this is one of the performance topics that non-engineers notice.

## Key points

- Fonts are discovered two levels deep in the CSS, so preload the critical faces — with `crossorigin`, even same-origin.
- `swap` guarantees visible text with a reflow; `optional` avoids the late swap entirely and is best for CLS.
- Layout shift comes from metric differences — override the fallback's metrics so it occupies the same space.
- Subset to the characters you use; it frequently halves the file.
- Prefer one variable font over several static weights, in WOFF2 only.
- Self-host rather than using a third-party font CDN: fewer connections, better preloading, no privacy question.
