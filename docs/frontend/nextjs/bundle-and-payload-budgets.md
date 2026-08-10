---
title: Bundle & Payload Budgets
summary: What actually ships to the browser in an App Router app, how to see it, and the levers that move the number.
level: core
minutes: 25
order: 16
tags: [nextjs, performance, bundling]

related:
  - frontend/nextjs/server-vs-client-components
  - frontend/performance/javascript-bundle-budgets
  - frontend/tooling/code-splitting-strategy

resources:
  - title: Package bundling
    url: https://nextjs.org/docs/app/guides/package-bundling
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: Lazy loading
    url: https://nextjs.org/docs/app/guides/lazy-loading
    source: Next.js
    type: docs
    minutes: 20
  - title: Analyze runtime performance
    url: https://developer.chrome.com/docs/devtools/performance
    source: Chrome DevTools
    type: docs
    minutes: 25
---

## In one line

The payload is the client bundle plus the RSC payload, and the biggest lever is not code splitting — it is how much of the tree is behind a `'use client'` boundary at all.

## What it is

Two things travel to the browser. The **JavaScript bundle** for client components and their imports, and the **RSC payload** describing the server-rendered tree. Server component code is in neither, which is why the boundary placement is the dominant factor: moving one `'use client'` from a layout to a leaf can delete more bytes than every other optimisation combined.

Next 16 removed the `size` and `First Load JS` columns from `next build` output, on the grounds that they were inaccurate for server-driven architectures and the two bundlers disagreed on how to count client payloads. So the number you used to quote is gone; measure with `@next/bundle-analyzer`, Lighthouse, or the DevTools coverage panel instead.

The levers, roughly in order of impact. Keep client components at the leaves. Import narrowly — a default import from a barrel file can pull in a whole library, which is what `optimizePackageImports` mitigates for known packages. `next/dynamic` for genuinely heavy, genuinely optional UI: a chart library, a rich text editor, a modal that most users never open. Add `ssr: false` only for browser-only components, and know that it costs you the server-rendered HTML.

Then the usual suspects: a date library that is smaller or native (`Intl` handles most formatting), an icon set imported per-icon rather than wholesale, and a polyfill set targeting browsers you no longer support. Next 16 raised the browser baseline to Chrome/Edge/Firefox 111+ and Safari 16.4+, which quietly removes a lot of transpiled output.

The RSC payload has its own budget. Passing a large object to a client component serialises the whole thing into the payload, whether or not the component reads all of it — so select fields at the boundary. This is the same discipline as not leaking user records, seen from the performance side.

## Why it matters

Bundle size maps directly to INP and to how the app feels on a mid-range Android on a train, which is the honest test. In interviews it comes up as "your app takes 6 seconds to become interactive, what do you do?" — and the App Router answer starts with the client boundary, not with code splitting.

## Key points

- Server component code never ships; the client boundary is the largest single lever on payload size.
- Next 16 dropped `size` and `First Load JS` from build output — measure with the bundle analyzer, Lighthouse, or coverage instead.
- Barrel-file imports can drag in whole libraries; import narrowly and lean on `optimizePackageImports`.
- `next/dynamic` is for heavy optional UI; `ssr: false` also gives up the server-rendered HTML.
- The RSC payload counts too — passing a fat object to a client component serialises all of it.
- The Next 16 browser baseline removes a chunk of legacy transpilation and polyfilling for free.
