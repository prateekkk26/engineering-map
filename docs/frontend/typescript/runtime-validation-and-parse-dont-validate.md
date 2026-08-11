---
title: Runtime Validation & Parse, Don't Validate
summary: Types vanish at runtime, so anything crossing a boundary needs a real check — done once, at the edge, producing a known type.
level: core
minutes: 25
order: 13
tags: [typescript, validation, boundaries]

related:
  - frontend/state-and-data/api-contracts-and-end-to-end-types
  - frontend/state-and-data/forms-and-validation
  - frontend/typescript/branded-types-and-domain-modelling

resources:
  - title: Parse, don't validate
    url: https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
    source: Alexis King
    type: article
    minutes: 25
    primary: true
  - title: Zod
    url: https://zod.dev/
    source: Zod
    type: docs
    minutes: 30
  - title: Valibot
    url: https://valibot.dev/
    source: Valibot
    type: docs
    minutes: 20
---

## In one line

TypeScript checks your beliefs about data, not the data — so every boundary needs a runtime parse that turns `unknown` into a type you can trust from then on.

## What it is

`await res.json()` returns `any`. Assigning it to a `User` is an unverified claim, and the type system will confidently let you read `user.profile.name` off a response that has neither field. The same applies to `localStorage`, URL parameters, form data, `postMessage`, environment variables, and anything from a third-party SDK.

"Parse, don't validate" is the discipline that fixes it. A *validator* returns a boolean and leaves you holding the same untyped value — so the check can be forgotten downstream, and often is. A *parser* returns a new value of a narrower type, so possessing that value **is** the proof the check happened. Do it once, at the edge, and everything inward is genuinely typed.

Concretely: define a schema, infer the TypeScript type from it, and parse at the boundary.

```ts
const User = z.object({ id: z.string(), email: z.string().email() })
type User = z.infer<typeof User>
const user = User.parse(await res.json())
```

One declaration, both the runtime check and the static type, with no possibility of drift. Zod is the default choice; Valibot is the same idea with a much smaller bundle via modular imports, which matters on the client; ArkType and Typia trade differently on speed and syntax. The pattern is more important than the library.

Two API choices to make deliberately. `parse` throws and `safeParse` returns a result object — the latter is usually right in a UI, where a validation failure is a state to render rather than an exception. And **be strict about unknown keys** on inbound data where it matters, since silently accepting extra fields hides API changes.

The boundaries worth covering, in rough order of payoff: API responses, form input (share the schema with the server), URL and search params, `localStorage` contents (whose shape is whatever your app wrote six versions ago), environment variables at startup, and `postMessage` payloads.

The cost is bundle size and a little ceremony, so scope it: parse what crosses a trust boundary, not every internal function argument. And keep error messages user-facing where the failure is a user's input, technical where it is a contract violation.

## Why it matters

Runtime type errors from unvalidated external data are among the most common production frontend failures, and they are entirely preventable with one line at each boundary.

"How do you know the API returned what you expected?" is a direct interview question where "we have an interface for it" is the wrong answer and schema parsing is the right one.

## Key points

- Types are erased at runtime; `res.json()` is `any` and an annotation on it is an unverified claim.
- A validator returns a boolean and can be forgotten; a parser returns a narrower type that proves the check ran.
- Define one schema, infer the type from it, and parse at the edge — no duplication, no drift.
- Prefer `safeParse` in UI code so a failure is a renderable state rather than an exception.
- Cover API responses, forms, URL params, storage, environment variables, and `postMessage`.
- Be strict about unexpected keys on inbound data so API changes surface instead of hiding.
- Scope validation to trust boundaries; parsing internal calls is ceremony without benefit.
