---
title: Metadata & SEO
summary: The Metadata API, generateMetadata, and the handful of things that actually decide whether a Next app is indexable.
level: core
minutes: 20
order: 12
tags: [nextjs, seo, metadata]

related:
  - frontend/nextjs/rendering-strategies
  - frontend/nextjs/internationalised-routing
  - frontend/performance/core-web-vitals

resources:
  - title: Metadata and OG images
    url: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: generateMetadata
    url: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
    source: Next.js
    type: docs
    minutes: 30
  - title: sitemap.xml
    url: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
    source: Next.js
    type: docs
    minutes: 15
---

## In one line

Export a `metadata` object for static tags or a `generateMetadata` function for per-route ones, and let the framework render the head — there is no `<head>` to write by hand.

## What it is

A layout or page exports `metadata` and Next renders the corresponding tags, merging down the tree so a root layout can set the title template and site defaults while each page overrides the parts it owns. `title.template` gives you `"%s | Site Name"` without repeating it.

When the values depend on data, export `async function generateMetadata({ params })` instead. It runs on the server, and requests it makes are deduplicated against the page's own fetches, so fetching the article twice does not cost two queries.

Open Graph images have a file convention: an `opengraph-image.tsx` exporting a component is rendered to an image at build or request time via `ImageResponse`. In Next 16 the props to those image functions — `params` and the `id` from `generateImageMetadata` — are promises and must be awaited, matching the async request APIs change.

`sitemap.ts`, `robots.ts`, and `manifest.ts` are the same idea: a file that default-exports a plain object or array and gets served at the right URL, typed rather than hand-written XML.

The things that actually decide indexability are less glamorous. Metadata must be server-rendered — a title set from a `useEffect` is invisible to most crawlers. Canonical URLs via `alternates.canonical` prevent duplicate-content splits from query strings. `robots` directives at the page level keep staging and filtered views out of the index. And under Cache Components, uncached data reads inside `generateMetadata` produce the same blocking-route warnings as in a page, which can quietly cost you the static shell.

Crawlers are also served differently: Next detects bots by user agent and renders the full page dynamically instead of the shell, so anything the shell depends on must work at request time too.

## Why it matters

For any public product this is a revenue line, not a nicety, and it is the part of a frontend that the rest of the business notices. In interviews it usually appears as a follow-up — "how do you handle SEO for dynamic pages?" — where `generateMetadata` plus canonicals plus a sitemap is a complete answer.

## Key points

- Static `metadata` exports merge down the tree; `title.template` avoids repeating the site name.
- `generateMetadata` handles data-dependent tags and shares deduplicated requests with the page.
- `opengraph-image.tsx` renders OG images via `ImageResponse`; its `params` and `id` are promises in Next 16.
- `sitemap.ts`, `robots.ts`, and `manifest.ts` replace hand-written files with typed exports.
- Metadata set in a client effect is effectively invisible to crawlers — it has to be server-rendered.
- Set canonicals and page-level robots directives, or query-string variants will fragment your indexing.
- Uncached reads in `generateMetadata` can cost the route its static shell under Cache Components.
