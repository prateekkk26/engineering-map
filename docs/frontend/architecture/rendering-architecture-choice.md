---
title: Choosing a Rendering Architecture
summary: SPA, SSR, SSG, ISR and RSC — what each optimises for, and the questions that pick one.
level: core
minutes: 25
order: 1
tags: [architecture, rendering, ssr]

related:
  - frontend/nextjs/rendering-strategies
  - frontend/performance/hydration-cost-and-islands
  - frontend/react/react-server-components

resources:
  - title: Rendering on the Web
    url: https://web.dev/articles/rendering-on-the-web
    source: web.dev
    type: article
    minutes: 35
    primary: true
  - title: Server and Client Components
    url: https://nextjs.org/docs/app/getting-started/server-and-client-components
    source: Next.js
    type: docs
    minutes: 25
  - title: Islands Architecture
    url: https://jasonformat.com/islands-architecture/
    source: Jason Miller
    type: article
    minutes: 20
---

## In one line

The choice is decided by three questions — does it need to be indexed, how personalised is it, and how interactive is it — not by which framework you like.

## What it is

**Client-side rendering** ships an empty shell and builds the page in the browser. Simple to deploy, excellent for long-lived app sessions where the first load is amortised over an hour of use, and wrong for anything a crawler or a first-time visitor on a phone needs to see quickly.

**Static generation** renders at build time and serves files from a CDN. The fastest and cheapest possible answer, and the right one whenever content changes on a deploy cadence rather than per request. Its limit is scale and freshness: ten thousand pages is a long build, and personalisation is impossible by definition.

**Server rendering** produces HTML per request. Necessary for personalised content that must still be indexable or fast on first paint. The costs are server capacity, time-to-first-byte on the critical path, and hydration.

**ISR** is static plus background regeneration — static delivery with a freshness window, which covers the large-catalogue case that pure SSG cannot build fast enough.

**RSC** reframes the question. Rather than choosing one mode for a route, components are server or client individually: non-interactive parts never ship code at all, interactive parts hydrate. With Partial Prerendering the static shell and the dynamic holes coexist in one response, so "static or dynamic" stops being a per-route decision.

**Islands** (Astro, Fresh) take the same insight further for content-heavy sites: the page is static HTML and only marked components hydrate.

Deciding is mostly mechanical. *Indexable and public?* Needs server-rendered HTML — SSG if it can be pre-built, SSR or ISR otherwise. *Personalised per user?* SSR or a streamed dynamic hole. *Mostly reading?* Islands or RSC. *Mostly interacting, behind a login?* A client app is fine and often simpler. *Genuinely mixed?* That is what RSC plus PPR is for.

Two constraints usually decide it in practice. **Operational cost**: static is nearly free, SSR needs capacity and a cache strategy, and someone has to run it. And **team capability**: the best architecture is one the team can debug at 3am, which is a real argument against adopting the newest model on a deadline.

## Why it matters

This is the most consequential and least reversible frontend decision, and it is asked directly in system design rounds — where the expected answer is a framework for choosing, not a favourite.

Getting it wrong is expensive: a CSR marketing site that does not rank, or an SSR dashboard paying server cost for content only the logged-in user sees.

## Key points

- Decide from indexability, personalisation, and interactivity — not from framework preference.
- SSG is fastest and cheapest but cannot personalise and does not scale to huge page counts.
- SSR handles personalised indexable content at the cost of capacity, TTFB, and hydration.
- ISR gives static delivery with a freshness window for large catalogues.
- RSC makes server-versus-client a per-component decision; PPR merges static and dynamic in one response.
- Islands suit content sites where only a few components need JavaScript.
- Weigh operational cost and what the team can debug under pressure.
