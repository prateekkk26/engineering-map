---
title: Versioning & Evolving an API
summary: What actually counts as a breaking change, the three places a version can live, and why most changes shouldn't need one.
level: core
minutes: 25
order: 6
tags: [api, versioning, compatibility]

related:
  - backend/api-design/resource-modelling-and-rest
  - data/schema-design-and-migrations/zero-downtime-migrations
  - practices/ci-cd-and-delivery/releasing-and-versioning

resources:
  - title: API versioning at Stripe
    url: https://stripe.com/blog/api-versioning
    source: Stripe
    type: article
    minutes: 15
    primary: true
  - title: Compatibility — API design guide
    url: https://cloud.google.com/apis/design/compatibility
    source: Google Cloud
    type: docs
    minutes: 20
  - title: Parallel Change
    url: https://martinfowler.com/bliki/ParallelChange.html
    source: Martin Fowler
    type: article
    minutes: 10
---

## In one line

Version only what you can't add compatibly, because a new optional field breaks nobody and a renamed one breaks everybody.

## What it is

Start with the definition. **Breaking**: removing or renaming a field, tightening validation, changing a type, adding a required request field, changing an error code's meaning, changing default sort or page size. **Not breaking**: adding an optional request field, adding a response field, adding a new endpoint, adding a new enum value *if you told clients how to handle unknown values*. That last caveat is the one people miss — a client with an exhaustive `switch` over your enum treats every new value as a breaking change, so document tolerant reading up front.

When you must break, there are three places to put the version. **URL path** (`/v2/orders`) is the crudest and most common: obvious in logs, trivially routable, and it drags the whole API forward at once. **Header or media type** (`Accept: application/vnd.acme.v2+json`) keeps URLs stable and is purer, at the cost of being invisible in a browser and easy to forget. **Date-pinned per account** is Stripe's model: a client is pinned to the version in effect when it integrated, upgrades explicitly, and the server keeps a chain of small request/response transformations from old shapes to the current one. It is the best experience for consumers and the most expensive to run — worth it when your API is the product.

The technique that removes most version pressure is **parallel change** (expand–migrate–contract): add the new field alongside the old, write both, move readers over, then remove the old one once telemetry says nobody reads it. That last part requires actually measuring per-field or per-endpoint usage by client — without it, "nobody uses this" is a guess, and deprecation becomes indefinite.

For a first-party API consumed only by your own frontend, the honest answer is usually **no versioning at all**: deploy the client and server together, use parallel change for the awkward moments, and spend the saved effort elsewhere. Say that out loud in a design discussion rather than performing versioning as a ritual.

## Why it matters

"How do you roll out a breaking API change?" is a standard senior question, and the expected answer is expand–migrate–contract plus a way to know when the old path is dead — not "bump to v2". Getting the breaking/non-breaking taxonomy right is also what lets a team ship daily without a release-coordination meeting.

## Key points

- Additive changes are safe; removals, renames, type changes and tightened validation are not.
- New enum values only stay compatible if clients were told to tolerate unknown ones.
- URL versioning is coarse and visible, header versioning is clean and forgettable, date-pinned versions are the best client experience and the most machinery.
- Parallel change — expand, migrate, contract — retires most would-be breaking changes without a version bump.
- You cannot contract safely without per-client usage telemetry on the old field or endpoint.
- Deprecation needs a date and a signal (`Deprecation`/`Sunset` headers, emails to integrators), not just a docs note.
- A private API consumed by a frontend you deploy in lockstep often needs no version at all — decide that deliberately.
