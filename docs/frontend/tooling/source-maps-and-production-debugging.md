---
title: Source Maps & Production Debugging
summary: Turning a minified stack trace back into your code, without publishing your source to the world.
level: core
minutes: 20
order: 11
tags: [tooling, debugging, observability]

related:
  - frontend/architecture/frontend-observability
  - frontend/security/client-side-data-exposure
  - frontend/tooling/systematic-frontend-debugging

resources:
  - title: Source maps
    url: https://developer.chrome.com/docs/devtools/javascript/source-maps
    source: Chrome DevTools
    type: docs
    minutes: 25
    primary: true
  - title: Source map upload
    url: https://docs.sentry.io/platforms/javascript/sourcemaps/
    source: Sentry
    type: docs
    minutes: 25
  - title: SourceMap specification
    url: https://tc39.es/ecma426/
    source: TC39
    type: docs
    minutes: 30
---

## In one line

A source map translates minified positions back to original ones, and the only decision that matters is whether it is served publicly or uploaded privately to your error tracker.

## What it is

Minified code is unreadable by design — `a.b.c is not a function` at `main.4f3a.js:1:88214` names nothing. A source map is a JSON file with an encoded mapping from generated positions to original file, line and column, so tooling can present the original.

**The exposure question decides the setup.** A `.map` file served next to the bundle means anyone can reconstruct your source, comments included. For open-source that is fine. For proprietary code it usually is not, and the standard arrangement is to **generate maps, upload them to the error tracker at build time, and not serve them** — Sentry, Datadog and the rest all support this, and the trace is de-minified server-side where only your team can see it.

Two safer middle grounds exist: serve maps but restrict access to authenticated internal users, or use `hidden-source-map` in webpack terms — maps generated without the `sourceMappingURL` comment, so browsers do not fetch them but the upload still works.

**Correlation is what makes them useful.** Every error report needs a release identifier, and the uploaded maps must be tagged with the same one, or the tracker de-minifies against the wrong build and produces confidently wrong line numbers. Commit SHA or build id, set consistently in both places, is the fix.

**Generation modes trade fidelity for build time.** `source-map` is full fidelity and slow, `eval-source-map` is fast and good for development, `hidden-source-map` is the production upload case. Getting this wrong shows up as either slow builds or unusable traces.

Beyond maps, production debugging has a few other levers. **Preserve function names** in minification (`keepNames`) so traces stay legible even when a map is missing. **Log a correlation id** on every request so a browser error can be joined to a server trace. And use **session replay** carefully — it is the fastest way to understand a report, and it captures whatever the user typed, so field masking is mandatory before it is switched on.

## Why it matters

Without maps, production error reports are noise, and a tracker full of unreadable traces gets ignored — which wastes the entire investment in error monitoring.

The exposure trade-off is also a question that comes up in security review, and knowing the upload-not-serve pattern is the expected answer.

## Key points

- A source map maps generated positions back to original file, line, and column.
- Serving maps publicly publishes your source; the standard setup is generate, upload to the tracker, do not serve.
- `hidden-source-map` or authenticated access are the middle grounds.
- Tag releases consistently in both the error reports and the uploaded maps, or de-minification is wrong.
- Choose the generation mode deliberately — full fidelity is slow, `eval` variants are for development.
- Preserve function names so traces stay legible even without a map.
- Emit a correlation id to join browser errors to server traces, and mask fields before enabling session replay.
