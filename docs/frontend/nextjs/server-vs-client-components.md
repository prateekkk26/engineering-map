---
title: Server vs Client Components
summary: Where the boundary goes, what crosses it, and why 'use client' marks an entry point rather than a single component.
level: core
minutes: 25
order: 3
tags: [nextjs, rsc, architecture]

related:
  - frontend/react/react-server-components
  - frontend/nextjs/data-fetching-in-the-app-router
  - frontend/nextjs/bundle-and-payload-budgets

resources:
  - title: Server and Client Components
    url: https://nextjs.org/docs/app/getting-started/server-and-client-components
    source: Next.js
    type: docs
    minutes: 30
    primary: true
  - title: taint
    url: https://nextjs.org/docs/app/api-reference/config/next-config-js/taint
    source: Next.js
    type: docs
    minutes: 10
  - title: Server Components
    url: https://react.dev/reference/rsc/server-components
    source: react.dev
    type: docs
    minutes: 25
---

## In one line

Everything under `app/` is a server component until a file says `'use client'`, and that directive marks the entry point of a client bundle — not one component.

## What it is

The default is the important half. A server component runs on the server only: it can `await` a database query, read a secret, and import a heavy library, and none of that code reaches the browser. What crosses the wire is the RSC payload, a serialised description of its output.

`'use client'` at the top of a file marks a boundary. That module *and everything it imports* becomes client code. This is what people get wrong: adding the directive to a shared provider at the root does not make one component interactive, it drags the whole imported graph into the bundle and opts the tree out of server rendering. The rule that follows is to push client components to the leaves — the button, the input, the chart — and keep data fetching and layout above them.

Composition still works downward. A server component cannot be imported *into* a client component, but it can be passed as `children`. `<ClientTabs><ServerPanel /></ClientTabs>` works, because the server rendered the panel and handed the client component finished output. That is the escape hatch for interactive shells around server content, and it is worth being able to draw.

Props crossing the boundary must be serialisable: primitives, plain objects, arrays, dates, promises. Functions and class instances cannot cross — which is why callbacks become server actions.

Two practical rules keep this safe. Anything reading a secret must be genuinely server-only; the `server-only` package turns an accidental client import into a build error, and the `taint` config lets you mark values that must never be passed across. And in Next 16 the request APIs — `cookies()`, `headers()`, `params`, `searchParams` — are all async, with the synchronous compatibility from Next 15 fully removed.

Client components still server-render. They are prerendered to HTML on the first load and then hydrated, so `'use client'` does not mean client-only; it means "this code also ships to the browser". Genuinely browser-only work still needs a `useEffect` or a dynamic import with `ssr: false`.

## Why it matters

The single most common App Router mistake is a `'use client'` too high in the tree, and it shows up as a bundle that never shrinks and data fetching pushed back into effects. Interviewers ask "when do you reach for `'use client'`?" precisely because the answer reveals whether you think in boundaries or in files.

## Key points

- Server is the default; `'use client'` marks an entry point, and the whole import graph below it becomes client code.
- Keep client components at the leaves — a provider at the root pulls the tree into the bundle.
- Server components can be passed as `children` to client components, which is how interactive shells wrap server output.
- Props across the boundary must serialise; functions cannot cross, so callbacks become server actions.
- Use `server-only` and the `taint` API so a secret cannot silently reach the client.
- `'use client'` components are still server-rendered then hydrated — it is not an opt-out of SSR.
- All request APIs are async in Next 16; synchronous access was removed.
