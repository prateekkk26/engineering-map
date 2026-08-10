---
title: Hydration Cost & Islands
summary: Why server-rendered HTML can still be slow to become interactive, and the architectures that reduce or remove the second pass.
level: core
minutes: 25
order: 6
tags: [performance, ssr, architecture]

related:
  - frontend/react/react-server-components
  - frontend/architecture/rendering-architecture-choice
  - frontend/performance/inp-and-long-tasks

resources:
  - title: Rendering on the Web
    url: https://web.dev/articles/rendering-on-the-web
    source: web.dev
    type: article
    minutes: 35
    primary: true
  - title: Islands Architecture
    url: https://jasonformat.com/islands-architecture/
    source: Jason Miller
    type: article
    minutes: 20
  - title: Astro — Islands
    url: https://docs.astro.build/en/concepts/islands/
    source: Astro
    type: docs
    minutes: 20
---

## In one line

Hydration re-runs your whole component tree on the client to attach behaviour to HTML that already exists — paying for the render twice, and leaving the page looking ready while it cannot respond.

## What it is

Server rendering solves first paint: the HTML arrives complete and the user sees content quickly. Then the framework must make it interactive, which traditionally means downloading the same components, executing them, rebuilding the virtual tree, and attaching event listeners across the entire page.

That produces the **uncanny valley** — the page looks finished and does nothing. Taps are dropped or queued, and on a slow device the gap can run to seconds. It is a direct INP problem, and it is invisible on a fast laptop.

Several architectures attack it. **Partial and selective hydration** (React 18) splits the tree at Suspense boundaries, hydrating each as its HTML arrives and prioritising whichever the user just interacted with, so a click is replayed rather than lost. **Islands** (Astro, Fresh) invert the default: the page is static HTML, and only marked components ship JavaScript and hydrate at all — with directives for when, such as on load, on idle, or on visible. **Server components** go further by never sending the component code for non-interactive parts, so there is nothing to hydrate. **Resumability** (Qwik) serialises the application state into the HTML so execution continues where the server stopped, with no replay pass at all.

The practical judgement is what fraction of your page is genuinely interactive. A content site, a marketing page, a docs site, or a commerce listing is mostly static with a few interactive controls — islands or RSC saves nearly all the JavaScript. A dashboard or an editor is interactive throughout, and hydration is unavoidable; there the work is reducing what is in the tree, not changing the architecture.

Watch for **hydration mismatches**, where server and client render differently — from `Date.now()`, `Math.random()`, `window` checks, or locale-dependent formatting. React logs an error and re-renders on the client, which discards the benefit of server rendering for that subtree.

## Why it matters

"Server rendered so it is fast" is a half-truth that interviews probe. Being able to separate first paint from interactivity, and name the cost between them, is the distinguishing answer.

It also explains why the ecosystem moved to RSC and islands, which is the context for most current framework choices.

## Key points

- Hydration re-executes the component tree on the client to attach listeners — the render is paid for twice.
- The gap between looking ready and being interactive is a real INP cost and is invisible on fast hardware.
- Selective hydration prioritises the boundary the user interacted with and replays the event.
- Islands ship JavaScript only for marked interactive components; server components send no code at all for static parts.
- Resumability removes the replay pass by serialising state into the HTML.
- Choose by how much of the page is genuinely interactive — a dashboard cannot island its way out.
- Hydration mismatches from time, randomness, or locale formatting discard the server render for that subtree.
