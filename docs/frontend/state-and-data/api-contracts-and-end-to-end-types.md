---
title: API Contracts & End-to-End Types
summary: Getting a type from the server to the client without lying, and why a hand-written interface is a comment that compiles.
level: core
minutes: 20
order: 17
tags: [typescript, api, contracts]

related:
  - frontend/typescript/runtime-validation-and-parse-dont-validate
  - frontend/state-and-data/graphql-rest-and-rpc-from-the-client
  - _shared/api-contracts

resources:
  - title: Parse, don't validate
    url: https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
    source: Alexis King
    type: article
    minutes: 25
    primary: true
  - title: OpenAPI Specification
    url: https://swagger.io/specification/
    source: OpenAPI Initiative
    type: docs
    minutes: 30
  - title: openapi-typescript
    url: https://openapi-ts.dev/
    source: openapi-typescript
    type: docs
    minutes: 20
---

## In one line

A hand-written `interface User` is an assertion about a server you do not control — generate it or validate it, because TypeScript checks your belief about the response, not the response.

## What it is

The default arrangement in most codebases is a lie that compiles. Someone writes an interface matching the API today, the backend adds a nullable field or renames one, and the frontend keeps type-checking cleanly while producing `undefined is not a function` at runtime. The type system was never involved, because `await res.json()` returns `any` and the cast happens at the boundary with no verification.

There are three honest fixes, in rough order of preference.

**Generate from a schema.** If the API publishes OpenAPI or GraphQL, generate the types. `openapi-typescript` and GraphQL Code Generator turn the schema into types that update when the schema does, so a breaking change becomes a compile error in CI rather than a bug in production. This is the highest-leverage option and is usually a day of setup.

**Share the types.** When both ends are TypeScript in one repo, tRPC or a shared package gives the client the server's inferred types directly — no schema, no codegen, immediate feedback.

**Validate at the boundary.** When you have neither, parse the response with a schema — Zod, Valibot — and infer the type from it. This is the only option that also catches a server that violates its own contract, which is why it is worth doing even alongside generation for critical paths. "Parse, don't validate": convert unknown data into a known type once at the edge, and everything downstream is genuinely typed.

Two related habits. Version deliberately — an additive field is safe, a rename or a type change is breaking, and consumers need warning. And keep the contract in version control next to the code that implements it, so drift is a reviewable diff rather than a discovery.

Where this bites hardest is dates and numbers: JSON has neither `Date` nor `bigint`, so a typed `Date` field is a string until something converts it. That mismatch is where a lot of "the type says it is a Date" bugs come from.

## Why it matters

Runtime type errors from API drift are among the most common production frontend failures, and they are entirely preventable. In interviews, "how do you keep frontend and backend types in sync?" is a direct question with a graded answer: generation or validation beats hand-written interfaces.

## Key points

- A hand-written interface for an external API is an unverified assertion — `res.json()` is `any`, so nothing checks it.
- Generate types from OpenAPI or GraphQL when a schema exists; the schema change then breaks CI, not production.
- Share inferred types directly when one team owns both ends in TypeScript.
- Parse at the boundary with a runtime schema when you cannot generate — it is the only approach that catches a server breaking its own contract.
- Parse once at the edge and pass a known type inward, rather than validating repeatedly downstream.
- JSON has no date or bigint, so those fields are strings until converted — a common source of false confidence.
