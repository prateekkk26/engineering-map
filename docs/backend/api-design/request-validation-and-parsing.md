---
title: Request Validation & Parsing
summary: Turning untrusted bytes into a typed value at exactly one place in the service, and rejecting everything that doesn't fit.
level: core
minutes: 20
order: 3
tags: [api, validation, typescript, security]

related:
  - backend/backend-security/injection-and-untrusted-input
  - backend/api-design/api-errors-clients-can-act-on
  - frontend/typescript/runtime-validation-and-parse-dont-validate

resources:
  - title: Zod — schema validation
    url: https://zod.dev/
    source: Zod
    type: docs
    minutes: 20
    primary: true
  - title: Input Validation Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 20
  - title: Mass Assignment Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 10
---

## In one line

Validate at the boundary by *parsing* into a typed value, so that everything downstream is guaranteed correct by construction rather than by everyone remembering to check.

## What it is

A request body is a string of bytes from a stranger. Parsing is the step that turns it into a value your domain code can trust, and the useful framing is Alexis King's: a validator returns a boolean and throws the knowledge away, a parser returns a *narrower type*. `parse(body)` giving you a `CreateOrder` means no function downstream needs to ask whether `quantity` is a number — the type says it is, because the only way to get one was through the schema.

In a TypeScript service this is where Zod (or Valibot, or ArkType) earns its place: one schema per endpoint, `schema.parse(await req.json())` as the first line of the handler, and the inferred type flows through the rest. It closes the gap TypeScript can't — types vanish at runtime, so `req.body as CreateOrder` is a lie the compiler will happily believe.

**Validate all four inputs**, not just the body: path parameters, query strings, headers, and the body. Query strings are the most commonly missed, and they arrive as strings, so coercion (`"2"` → `2`, `"true"` → `true`) belongs in the schema rather than scattered through the handler.

Three rules that decide whether validation actually protects you. **Allowlist, don't blocklist** — enumerate what is permitted, because you cannot enumerate every bad input. **Reject unknown fields on writes** (Zod's `.strict()`), or a client typo silently becomes a no-op and an attacker can attempt mass assignment on fields like `role` or `isAdmin`. And **bound everything**: max string length, max array length, max body size, so one request can't allocate a gigabyte.

Validation is not authorization and not sanitisation. A well-formed request from someone with no permission is still a `403`, and a valid string is still dangerous when concatenated into SQL or HTML. The schema proves shape, nothing more.

## Why it matters

Take-home reviewers explicitly score error and edge-case handling, and an unvalidated `req.body` is the single most visible tell in a submission. Operationally it is the cheapest defence you have: mass assignment, injection, and half your `500`s from `undefined` property access all die at a strict schema on the boundary.

## Key points

- Parse into a typed value at the boundary; don't validate-and-forget, because the type is what protects the rest of the service.
- TypeScript types are erased at runtime — a cast on request data is an assertion, not a check.
- Validate path params, query, headers and body; query values arrive as strings and need explicit coercion.
- Allowlist permitted fields and reject unknown ones, or mass assignment quietly becomes a privilege escalation path.
- Bound sizes — string length, array length, request body — before the parse allocates on your behalf.
- Validation answers "is this well-formed", never "is this allowed" or "is this safe to interpolate".
