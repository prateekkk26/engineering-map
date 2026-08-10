---
title: Migrating Pages to App Router
summary: Running both routers side by side, the API-by-API translation table, and how to sequence a migration that never blocks feature work.
level: deep
minutes: 25
order: 18
tags: [nextjs, migration, architecture]

related:
  - frontend/nextjs/app-router-mental-model
  - frontend/architecture/large-scale-migrations
  - frontend/nextjs/data-fetching-in-the-app-router

resources:
  - title: Migrating from Pages to App Router
    url: https://nextjs.org/docs/app/guides/migrating/app-router-migration
    source: Next.js
    type: docs
    minutes: 40
    primary: true
  - title: Codemods
    url: https://nextjs.org/docs/app/guides/upgrading/codemods
    source: Next.js
    type: docs
    minutes: 20
  - title: How to upgrade to version 16
    url: https://nextjs.org/docs/app/guides/upgrading/version-16
    source: Next.js
    type: docs
    minutes: 35
---

## In one line

`app/` and `pages/` coexist in one project with `app/` taking precedence for conflicting routes, which makes an incremental route-by-route migration the only sensible plan.

## What it is

Both routers can run in the same app. That is the fact the whole strategy rests on: you move one route at a time, ship each one, and never maintain a long-lived rewrite branch. If a path exists in both, `app/` wins.

The translation table is most of the mechanical work. `getServerSideProps` becomes an `await` in an async server component. `getStaticProps` becomes a cached fetch or `use cache`, and `getStaticPaths` becomes `generateStaticParams`. `_app.tsx` and `_document.tsx` collapse into the root `layout.tsx`. `next/head` becomes the Metadata API. `next/router` becomes `next/navigation`, where `useRouter` no longer exposes `query` — `useParams` and `useSearchParams` split that role. API routes become route handlers, or disappear entirely when a server action replaces them.

The conceptual work is harder and less mechanical. Every component in `app/` is a server component by default, so a page that used hooks, context, or event handlers throughout needs its client boundary drawn deliberately — and the temptation to put `'use client'` at the top of the page and move on defeats the entire point of migrating.

A sensible order: start with a low-traffic leaf route to shake out the build and deploy path; move shared layout and providers into the root layout early, since everything depends on them; migrate data-heavy routes next, where server components actually pay; and leave the most complex interactive routes for last, when the team knows the model.

Two things to watch. Shared state between a Pages route and an App route does not exist — a client-side store is remounted when you cross between them, so plan the cut lines around navigation flows rather than by folder. And the two routers have different behaviours for scroll restoration, `next/link` prefetching, and 404 handling, so cross-router navigation is where the odd bugs live.

For the version upgrade itself, the codemods do real work — the Next 16 `upgrade` codemod handles the `turbopack` config move, the `middleware`-to-`proxy` rename, and unstable prefix removal, and a separate codemod migrates the async request APIs.

## Why it matters

Most companies hiring for senior React roles have a Pages Router codebase and a migration in flight, so "how would you migrate this?" is a live question rather than a hypothetical. The answer they want is incremental, route by route, with a named order — not a rewrite.

## Key points

- `app/` and `pages/` coexist, with `app/` winning conflicts — migrate one route at a time and ship each.
- The mechanical mapping: `getServerSideProps` → `await`, `getStaticPaths` → `generateStaticParams`, `_app`/`_document` → root layout, `next/head` → Metadata API.
- `next/router` becomes `next/navigation`; `query` splits into `useParams` and `useSearchParams`.
- Drawing the client boundary is the real work — `'use client'` at the top of a migrated page wastes the migration.
- Order the work: low-traffic leaf first, shared layout early, data-heavy next, most interactive last.
- Client state does not survive navigation between the two routers, so cut along navigation flows.
- Use the codemods for the mechanical parts, including the Next 16 `proxy` rename and async request APIs.
