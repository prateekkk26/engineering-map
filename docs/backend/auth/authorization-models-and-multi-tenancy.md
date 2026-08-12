---
title: Authorization Models & Multi-Tenancy
summary: Choosing between roles, attributes and relationships — and enforcing tenant isolation somewhere it can't be forgotten.
level: core
minutes: 25
order: 5
tags: [auth, authorization, multi-tenancy]

related:
  - backend/auth/authentication-vs-authorization
  - data/schema-design-and-migrations/multi-tenancy-data-models
  - data/postgres-in-depth/row-level-security

resources:
  - title: Zanzibar — Google's Consistent, Global Authorization System
    url: https://research.google/pubs/pub48190/
    source: Google Research
    type: article
    minutes: 45
  - title: Role-Based Access Control
    url: https://csrc.nist.gov/projects/role-based-access-control
    source: NIST
    type: docs
    minutes: 20
  - title: OpenFGA — modeling guides
    url: https://openfga.dev/docs/modeling/getting-started
    source: OpenFGA
    type: docs
    minutes: 30
    primary: true
---

## In one line

RBAC answers "what kind of user is this", ReBAC answers "what is this user's relationship to this object" — and B2B products almost always discover they needed the second one.

## What it is

**RBAC** assigns users roles (`admin`, `editor`, `viewer`) and grants permissions to roles. It is simple, auditable, and enough for most products for a long time. Its ceiling arrives the moment permissions depend on the object: "editors can edit, but only documents in projects they belong to" is not expressible as a role, and teams respond by minting roles like `editor_project_42` until the model collapses.

**ABAC** decides from attributes of the user, the resource, and the context — department, classification, time of day, IP. Flexible, and hard to reason about: answering "who can see this document?" requires evaluating every policy against every user rather than reading a table.

**ReBAC** — the Zanzibar model, and what OpenFGA and SpiceDB implement — stores tuples like `user:alice is editor of doc:readme` and resolves permissions by walking relationships, including inherited ones (`doc` in `folder`, `folder` owned by `team`). It answers both directions efficiently: can Alice edit this, and who can edit this. Anything with sharing, nesting, or groups converges on this shape, which is why Google built it for Drive.

**Multi-tenancy is a separate axis** and the higher-severity one: a role bug shows a user the wrong button, a tenant bug shows them another company's data. Isolation must be structural. Options, in ascending order of strength: pass `org_id` in every query (correct until one query forgets), enforce it in a data-access layer no handler can bypass, use Postgres **row-level security** so the database applies the predicate even to a query that didn't ask, or give each tenant its own schema or database — strong isolation, expensive migrations.

Two things to decide early because they're painful later: whether permissions are **cached** (fast, but a revoked grant lingers) and whether you can **audit** — showing a user why access was denied, and showing an auditor who had access last March, both require the decision to be recorded, not just computed.

## Why it matters

Every B2B product these loops hire for is multi-tenant, so "how do you keep tenant A out of tenant B's data" is a routine design question with a clear ladder of answers. Choosing RBAC and knowing precisely where it breaks is a stronger answer than reaching for a policy engine you don't need yet.

## Key points

- RBAC is the right starting point; the signal it has failed is roles that encode object identity.
- ABAC is expressive but hard to audit — "who can access this?" becomes a search rather than a lookup.
- ReBAC/Zanzibar is what sharing, nesting and group inheritance demand, and it answers permission questions in both directions.
- Tenant isolation is a different risk class from role permissions and deserves a stronger mechanism.
- Enforce `org_id` somewhere unbypassable — a data-access layer or Postgres RLS — not in each handler.
- Caching permission decisions trades revocation latency for speed; pick the staleness window deliberately.
- Log authorization decisions, or you can neither explain a denial nor answer an access audit.
