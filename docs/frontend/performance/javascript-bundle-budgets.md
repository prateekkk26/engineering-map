---
title: JavaScript Bundle Budgets
summary: Why shipped JavaScript is the most expensive resource on the page, and how to set a limit that actually holds.
level: core
minutes: 20
order: 5
tags: [performance, bundling, budgets]

related:
  - frontend/nextjs/bundle-and-payload-budgets
  - frontend/tooling/tree-shaking-and-side-effects
  - frontend/performance/performance-budgets-in-ci

resources:
  - title: Reduce JavaScript payloads with code splitting
    url: https://web.dev/articles/reduce-javascript-payloads-with-code-splitting
    source: web.dev
    type: article
    minutes: 25
    primary: true
  - title: Performance budgets 101
    url: https://web.dev/articles/performance-budgets-101
    source: web.dev
    type: article
    minutes: 20
  - title: Bundlephobia
    url: https://bundlephobia.com/
    source: Bundlephobia
    type: docs
    minutes: 10
---

## In one line

A kilobyte of JavaScript costs far more than a kilobyte of image, because it must be downloaded, parsed, compiled and executed on the main thread before anything else can happen.

## What it is

The asymmetry is the point. An image is downloaded and decoded, often off the main thread, and a slow one delays a picture. JavaScript is downloaded, parsed, compiled, and executed — all on the thread that also handles rendering and input. 200KB of JavaScript can cost half a second of CPU on a mid-range Android before a single pixel changes.

Which means the number to watch is not the compressed transfer size that build tools report. Gzip and Brotli shrink the download but not the parse and execute cost, which scales with the *uncompressed* size. A 200KB gzipped bundle is roughly 700KB of code the device must actually process.

Budgets work when they are specific and enforced. Pick a number per route, in uncompressed JavaScript, based on a real device target rather than a round figure — and enforce it in CI so a regression is a failed build, not a discovery six months later. `size-limit` and bundlesize do this in a few lines. A budget nobody enforces is a comment.

Finding the weight is mechanical: a bundle analyzer shows what is in there, and the answers are usually the same handful. A date library that could be `Intl`. An icon set imported wholesale. Lodash imported by default rather than per function. A charting library on a page with one sparkline. Two copies of the same dependency at different versions. A polyfill bundle for browsers you no longer support.

The structural levers matter more than shaving individual libraries. Route-level splitting so a visitor pays only for the page they opened. Dynamic imports for heavy optional UI. And in an RSC codebase, moving work behind the server boundary, which removes the code entirely rather than deferring it.

One caveat on measurement: Next 16 removed `size` and `First Load JS` from build output because they were inaccurate for server-driven architectures, so use the analyzer or Lighthouse rather than a number the build no longer prints.

## Why it matters

Bundle size maps almost linearly onto time-to-interactive and INP on mid-range devices, which is what most of your users have even if your team does not.

"How big should the bundle be?" is a common question, and the strong answer is a per-route budget enforced in CI against a named device target — not a number.

## Key points

- JavaScript costs download, parse, compile, and execute on the main thread — unlike images, which mostly cost bytes.
- Parse and execute scale with uncompressed size, so the gzipped number understates the real cost.
- Set per-route budgets in uncompressed bytes against a real device target, and enforce them in CI.
- A bundle analyzer usually finds the same suspects: date libraries, whole icon sets, default lodash imports, duplicated dependencies.
- Route splitting and dynamic imports beat micro-optimising individual libraries.
- Moving code behind the server boundary deletes it from the client rather than deferring it.
