---
title: Resource Modelling & REST
summary: Designing an API as nouns with a small fixed set of verbs, and knowing which parts of REST are dogma you can drop.
level: core
minutes: 25
order: 1
tags: [api, rest, design]

related:
  - backend/api-design/conditional-requests-and-api-caching
  - backend/api-design/rpc-and-end-to-end-typed-apis
  - system-design/architecture-decisions/drawing-service-boundaries

resources:
  - title: API design guide
    url: https://cloud.google.com/apis/design
    source: Google Cloud
    type: docs
    minutes: 45
    primary: true
  - title: Richardson Maturity Model
    url: https://martinfowler.com/articles/richardsonMaturityModel.html
    source: Martin Fowler
    type: article
    minutes: 15
  - title: Microsoft REST API Guidelines
    url: https://github.com/microsoft/api-guidelines
    source: Microsoft
    type: repo
    minutes: 30
---

## In one line

REST is the discipline of naming the things in your system as resources and letting HTTP's existing verbs do the work, so clients can guess most of your API before reading the docs.

## What it is

A resource is a noun your product actually has: an order, a conversation, a document. The design work is picking that set — the hard question is never `GET` versus `POST`, it is whether "checkout" is a resource or an action on a cart. Collections get plural paths (`/conversations`), instances get an identifier (`/conversations/{id}`), and things that only exist inside a parent nest one level (`/conversations/{id}/messages`). Nesting deeper than that is a design smell: if a message needs its own lifecycle, it deserves a top-level path.

The verbs are fixed and you only get a handful, which is the point. `GET` reads, `POST` creates or triggers, `PUT` replaces, `PATCH` partially updates, `DELETE` removes. A client that knows this already knows how to consume your API, and every intermediary — proxies, CDNs, browsers — knows which requests are safe to retry or cache without being told.

**Not everything is a noun**, and forcing it produces worse APIs than admitting it. Publishing, cancelling, retrying, sending — real systems are full of state transitions that aren't a field update. Two honest options: model the transition as a resource (`POST /subscriptions/{id}/cancellations`), or accept a namespaced action (`POST /subscriptions/{id}:cancel`, which is what Google's guide does). Both beat contorting the domain to keep the noun count pure.

Fowler's maturity model is the useful ladder: level 1 is resources at all, level 2 is proper verbs and status codes, level 3 is hypermedia — links in responses telling the client what it can do next. **Almost nobody ships level 3, and that is a defensible choice**, not a failure. Hypermedia pays off when clients are unknown and long-lived; for a first-party frontend you control and deploy weekly, it is machinery nobody uses.

## Why it matters

"Design the API for X" is the opening move of most practical rounds and half of frontend system design, and the resource model is the part interviewers probe hardest because it exposes whether you understand the domain or just the HTTP. It is also the most expensive thing to get wrong: implementations get rewritten, but a path shape that shipped to a mobile client lives for years.

## Key points

- Resources are the nouns of the domain; picking them is domain modelling, not HTTP trivia.
- Nest at most one level — deeper nesting means the child wanted to be a top-level resource.
- Uniform verbs are what let clients, proxies and caches reason about a request they've never seen.
- Actions that aren't field updates should be modelled as sub-resources or explicit namespaced actions, not bent into `PATCH`.
- Hypermedia (Richardson level 3) is a legitimate skip for first-party APIs; say so deliberately rather than by accident.
- Paths are the hardest part of an API to change, because you can't redeploy other people's clients.
