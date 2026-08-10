---
title: The App Router Mental Model
summary: How the file system becomes a route tree, what each special file does, and why layouts persisting across navigation is the idea everything else rests on.
level: core
minutes: 25
order: 1
tags: [nextjs, routing, app-router]

related:
  - frontend/nextjs/server-vs-client-components
  - frontend/nextjs/rendering-strategies
  - frontend/react/react-server-components

resources:
  - title: Layouts and Pages
    url: https://nextjs.org/docs/app/getting-started/layouts-and-pages
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: Project structure and organization
    url: https://nextjs.org/docs/app/getting-started/project-structure
    source: Next.js
    type: docs
    minutes: 25
  - title: Parallel routes
    url: https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes
    source: Next.js
    type: docs
    minutes: 20
  - title: Linking and navigating
    url: https://nextjs.org/docs/app/getting-started/linking-and-navigating
    source: Next.js
    type: docs
    minutes: 20
---

## In one line

A folder under `app/` is a route segment, a small set of reserved filenames give that segment its page, layout, loading and error behaviour, and layouts above a page persist across navigation instead of re-rendering.

## What it is

Routing is the folder tree. `app/blog/[slug]/page.tsx` serves `/blog/my-post`. Only a `page.tsx` (or `route.ts`) makes a segment publicly routable — every other folder is just structure, which is why you can group files next to the route that uses them without accidentally publishing them.

The reserved filenames are the whole API surface. `layout.tsx` wraps everything below it, `page.tsx` is the leaf UI, `loading.tsx` is a Suspense boundary, `error.tsx` is a client error boundary, `not-found.tsx` handles `notFound()`, `template.tsx` is a layout that deliberately remounts, and `route.ts` makes the segment an HTTP endpoint instead of a page. Learn those seven and you can read any App Router codebase.

Nesting is the payoff. Layouts compose down the tree, and on client navigation only the segments that actually changed re-render. A sidebar in `app/dashboard/layout.tsx` keeps its scroll position and state as you move between dashboard pages, because that layout never unmounted. This is also why a layout cannot read the current page's `searchParams` — it is not re-rendered for them.

Three escapes from strict path-mirroring cover most real structures. Route groups `(marketing)` organise folders without adding a URL segment, and are how you give two sections different root layouts. Private folders `_components` are excluded from routing entirely. Dynamic segments come as `[slug]`, `[...slug]` for catch-all, and `[[...slug]]` for optional catch-all.

Parallel routes (`@modal`) and intercepting routes (`(.)photo`) are the advanced pair, used together for the "modal over the feed on click, full page on refresh" pattern. In Next 16 every parallel slot must have a `default.tsx` or the build fails — a change from earlier versions.

Navigation is client-side after the first load: `<Link>` prefetches, the router fetches only the changed segments as an RSC payload, and the shared layout is not re-requested.

## Why it matters

Every question about caching, streaming, or server components in this framework is really a question about which segment something lives in, so the tree model has to be solid first. Interviewers open with "how would you structure this app?" and are listening for route groups, layout boundaries, and where the client boundary sits.

## Key points

- A folder is a route segment, but only `page.tsx` or `route.ts` makes it routable — everything else is safe to colocate.
- Layouts persist across navigation and do not re-render, which is why they hold long-lived UI and cannot read `searchParams`.
- Route groups `(name)` organise without affecting the URL; private folders `_name` are excluded from routing.
- `template.tsx` is the opt-out: a layout that remounts on every navigation when you need state reset.
- Parallel and intercepting routes give you modal-over-content that still deep-links correctly; Next 16 requires `default.tsx` in every slot.
- Client navigation fetches only changed segments as an RSC payload, so shared layouts cost nothing on the second visit.
