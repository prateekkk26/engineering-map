---
title: BFF & API Layering
summary: A backend shaped for one frontend — what it solves, what it costs, and where it sits next to server components.
level: deep
minutes: 20
order: 10
tags: [architecture, api, bff]

related:
  - frontend/state-and-data/graphql-rest-and-rpc-from-the-client
  - frontend/nextjs/route-handlers
  - frontend/state-and-data/data-fetching-patterns

resources:
  - title: Backends For Frontends
    url: https://samnewman.io/patterns/architectural/bff/
    source: Sam Newman
    type: article
    minutes: 20
    primary: true
  - title: Pattern - Backends for frontends
    url: https://microservices.io/patterns/apigateway.html
    source: microservices.io
    type: article
    minutes: 20
  - title: Route Handlers and Middleware
    url: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
    source: Next.js
    type: docs
    minutes: 25
---

## In one line

A BFF is an API owned by the frontend team and shaped for one client, sitting between the UI and general-purpose services that were designed for nobody in particular.

## What it is

The problem it solves is shape mismatch at a distance. Microservices are designed for reuse, so a single screen needs three of them, over-fetches from each, and waits for them in sequence. The frontend compensates with waterfalls and client-side joins, and the fix — "please add an endpoint for our screen" — depends on another team's roadmap.

A BFF inverts the ownership. The frontend team owns a thin layer that aggregates the calls in parallel server-side, reshapes the response to what the screen renders, and evolves with the UI rather than against a shared contract. One request from the client, no client-side join, and the change is in the frontend team's own repository.

**Secrets and tokens** are the second reason, and increasingly the primary one. The BFF holds the API keys and the OAuth tokens, exchanging them for an httpOnly session cookie — which is exactly the pattern current IETF guidance recommends for browser apps, because it removes token storage from the browser entirely.

The costs are real: another deployable to run and monitor, another network hop, a place for business logic to accumulate where it does not belong, and the "one BFF per client" rule becoming several similar services to keep in sync.

**Where server components change the picture.** In an App Router app, a server component *is* a BFF layer for reads — it calls services directly, in parallel, with no extra hop and no extra service to operate. Route handlers cover the cases that genuinely need a URL: webhooks, external consumers, mobile clients, and streaming endpoints. For a team already on Next.js, that often replaces a separate BFF entirely.

Two rules keep the layer thin. **No business logic in the BFF** — it aggregates, reshapes, and authenticates; domain rules belong in the services, or you have built a second backend that will drift. And **one BFF per client type**, not per screen: web and mobile have genuinely different needs, individual pages do not.

## Why it matters

Every frontend consuming microservices hits this, and knowing the pattern by name — plus that RSC subsumes much of it — is a currency signal.

The token-custody argument is also the strongest available answer to "where do you store the JWT?", which makes it worth having in a security discussion as well as an architecture one.

## Key points

- A BFF exists because general-purpose services are shaped for no particular screen; it is owned by the frontend team.
- It collapses several client calls into one server-side parallel fetch with a response shaped for the UI.
- Holding tokens server-side behind an httpOnly cookie is the current recommended browser auth architecture.
- Costs: another deployable, another hop, and a tempting place for business logic to accumulate.
- Server components act as a BFF for reads with no extra service; route handlers cover URL-addressable cases.
- Keep domain logic in the services — a BFF that grows rules becomes a second backend.
- One BFF per client type, not per screen.
