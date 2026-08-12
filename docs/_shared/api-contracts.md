---
title: API Contracts
summary: The agreement between a producer and its consumers about shape, meaning, and change — and the mechanisms that stop it drifting.
level: core
minutes: 25
tags: [api, types, architecture]

surfaced_in:
  - frontend/state-and-data
  - backend/api-design
  - system-design/architecture-decisions

related:
  - frontend/state-and-data/api-contracts-and-end-to-end-types
  - backend/api-design/resource-modelling-and-rest
  - backend/api-design/versioning-and-evolving-an-api
  - _shared/testing-strategy

resources:
  - title: Consumer-Driven Contracts
    url: https://martinfowler.com/articles/consumerDrivenContracts.html
    source: Martin Fowler
    type: article
    minutes: 30
    primary: true
  - title: OpenAPI Specification
    url: https://spec.openapis.org/oas/latest.html
    source: OpenAPI Initiative
    type: docs
    minutes: 20
  - title: Pact — contract testing
    url: https://docs.pact.io/
    source: Pact
    type: docs
    minutes: 20
  - title: Zalando RESTful API Guidelines
    url: https://opensource.zalando.com/restful-api-guidelines/
    source: Zalando
    type: docs
    minutes: 25
---

## In one line

A contract is everything a consumer is allowed to depend on — and the work is deciding what that set is, then changing it without breaking anyone.

## What it is

The contract is larger than the schema. Field names and types are the obvious part, but consumers also depend on **meaning** (is `status: "complete"` set before or after the payment settles?), on **nullability and optionality**, on **error codes**, on **ordering and pagination stability**, and on timing — whether a resource is readable immediately after the write that created it. Any of those can break a client while the JSON schema still validates. The Hyrum's Law version: with enough consumers, every observable behaviour of your API is depended on by somebody, whether or not you documented it.

Contracts get written down in one of two directions. **Specification-first** — an OpenAPI or GraphQL schema is the source of truth, and both sides generate from it — gives you one artifact to review, mock, and diff, at the cost of keeping the spec honest. **Code-first**, where the schema is derived from the implementation (tRPC-style inference, or generated from handlers), can't drift from the server but only helps consumers who share the language and the repo. Inside one TypeScript monorepo the second is usually right; across teams or languages, the first is.

Neither proves the two sides agree at runtime, which is what **contract testing** adds: the consumer states what it actually uses in an executable form, and the producer's CI verifies it can still satisfy it. This is the real value of consumer-driven contracts — the producer learns which fields anyone depends on, so it can change everything else freely. It replaces both the end-to-end test that's too slow and the mock that's too optimistic.

Then there is change. The workable rule is **additive changes are safe, removals and meaning changes are not**. Adding an optional field, adding an enum value nobody must handle, relaxing a constraint — safe, provided clients ignore unknown fields (which they should be built to do). Renaming, removing, tightening a type, or quietly changing what a value means requires a version, a deprecation window, or both. The pragmatic path most teams take: version only when you must, and prefer expand-then-contract — add the new field, migrate consumers, remove the old one once telemetry says nobody reads it. That telemetry is the part people skip and then regret.

## Why it matters

Full-stack work is largely this: the frontend's assumptions and the backend's guarantees have to be the same set, and most integration bugs are the gap between them. It comes up directly in frontend system design (what does the API for this feature look like?) and in the deep dive as "how did you change that without breaking mobile?" — where the good answer is a versioning or expand-contract story, not "we told everyone in Slack."

## Key points

- The contract includes semantics, nullability, error codes, ordering, and timing — not just field types.
- With enough consumers, every observable behaviour becomes a dependency, documented or not.
- Spec-first buys cross-language review and mocking; code-first buys drift-proofing within one codebase.
- A schema proves shape, not agreement — contract tests are what prove the two sides still fit.
- Consumer-driven contracts tell the producer which fields are actually used, which is what makes change safe.
- Additive is safe if clients ignore unknown fields; removals and meaning changes need a version or a window.
- Prefer expand-then-contract over a new version, and use telemetry to decide when contraction is safe.
- Deprecation without a measured consumer list is a guess; instrument the field before you remove it.
