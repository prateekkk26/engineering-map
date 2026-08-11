---
title: Transpilation & Browser Targets
summary: Deciding how far to down-level, and why an honest browserslist is one of the cheapest performance wins available.
level: core
minutes: 20
order: 3
tags: [tooling, babel, compatibility]

related:
  - frontend/tooling/how-bundlers-work
  - frontend/performance/javascript-bundle-budgets
  - frontend/browser-platform/feature-detection-and-progressive-enhancement

resources:
  - title: Browserslist
    url: https://github.com/browserslist/browserslist
    source: Browserslist
    type: repo
    primary: true
  - title: Baseline
    url: https://web.dev/baseline
    source: web.dev
    type: article
    minutes: 20
  - title: core-js
    url: https://github.com/zloirock/core-js
    source: core-js
    type: repo
---

## In one line

Your browser target decides how much of your code gets rewritten and how many polyfills ship, and most projects target browsers that no longer have users.

## What it is

Two distinct things travel under "transpilation". **Syntax down-levelling** rewrites newer syntax into older equivalents — optional chaining into conditionals, `async`/`await` into state machines, class fields into constructor assignments. **Polyfills** add missing runtime APIs — `Array.prototype.at`, `structuredClone`, `Object.groupBy` — and these are libraries you ship, not transformations.

The cost is asymmetric and worth internalising. Down-levelling `async`/`await` for genuinely old browsers can inflate a function several times over, and the generated regenerator runtime is measurable weight. Polyfills add bytes for everyone unless conditionally loaded. So a stale target is a tax on every user, paid to support browsers nobody in your analytics uses.

**Browserslist** is the shared configuration that build tools read — Babel, PostCSS, autoprefixer, esbuild and the bundlers all consult the same query. `defaults` is reasonable; `> 0.5%, last 2 versions, not dead` is the common explicit form. The important part is that the query should be checked against your own analytics rather than copied.

**Baseline** is the newer vocabulary and is more useful for deciding what to *use*: a feature is "newly available" once it is in all major engines, and "widely available" after 30 months. Targeting widely-available Baseline is a defensible policy that removes most of the argument.

Two shifts make this cheaper than it used to be. **Modern frameworks have raised their own floors** — Next 16 requires Chrome, Edge and Firefox 111+ and Safari 16.4+, which eliminates a lot of transpilation automatically. And **native support has caught up**: async/await, optional chaining, and modules are supported everywhere that matters, so the historical reasons for aggressive down-levelling are largely gone.

For the gaps that remain, **load polyfills conditionally** — feature-detect and fetch, or serve a differential bundle — so modern browsers pay nothing. And **check the output**: looking at the emitted code for a modern target is often the moment a team discovers it is still shipping ES5.

## Why it matters

This is a configuration change with a real bundle-size and parse-time payoff, and it is frequently untouched from whatever a project generator produced years ago.

It also interacts with correctness: transpiled code behaves subtly differently in places, so shipping the original syntax where supported is both smaller and more faithful.

## Key points

- Syntax down-levelling rewrites code; polyfills ship runtime libraries — different costs, different fixes.
- Down-levelling `async`/`await` and iterators is expensive; a stale target taxes every user.
- Browserslist is the shared query all the tooling reads — set it from your own analytics.
- Baseline "widely available" is a defensible policy for what features to use.
- Modern framework floors (Next 16: Chrome/Edge/Firefox 111+, Safari 16.4+) remove much transpilation.
- Load polyfills conditionally so modern browsers pay nothing.
- Inspect the emitted output — many projects are still shipping ES5 without knowing.
