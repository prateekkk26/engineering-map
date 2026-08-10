---
title: Structured Outputs
summary: Constraining the model to a JSON schema so the response is a typed object you can rely on, rather than prose you have to parse and pray over.
level: core
minutes: 20
order: 3
tags: [llm, api, integration, typescript]

related:
  - ai/tool-use/tools-vs-structured-outputs
  - ai/working-with-the-api/the-messages-api-shape
  - ai/ai-product-thinking/designing-for-nondeterminism

resources:
  - title: Structured outputs
    url: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Structured Outputs
    url: https://platform.openai.com/docs/guides/structured-outputs
    source: OpenAI
    type: docs
    minutes: 20
  - title: Zod
    url: https://zod.dev/
    source: Colin McDonnell
    type: docs
    minutes: 15
---

## In one line

You supply a JSON schema, the provider constrains decoding so the output cannot violate it, and you get a parsed object instead of a string containing something that looks like JSON.

## What it is

The old approach was to ask nicely — "respond only with JSON matching this shape" — then strip markdown fences, run `JSON.parse` in a try/catch, and retry on failure. It works most of the time, which is the problem: the failure rate is low enough to survive a demo and high enough to page someone.

Structured outputs move the guarantee into decoding. The schema is compiled into a constraint on which tokens are permitted at each position, so a response that violates the schema is not merely discouraged, it is unreachable. In practice you pass the schema in the request's output configuration, and the SDKs let you hand over a Zod or Pydantic model and get a typed value back, validated on arrival.

The schema subset is deliberately restricted. Objects, arrays, strings, numbers, booleans, null, enums, unions and refs are supported; every object generally needs `additionalProperties: false` and an explicit `required` list. Numeric ranges, string lengths, and recursion typically are not enforced by the constraint — some SDKs strip those and validate them client-side. New schemas pay a one-time compilation cost on first use, then cache.

Design guidance that survives contact with production: keep schemas flat and shallow, because deep nesting degrades quality and costs tokens. Prefer enums over free strings anywhere the value is drawn from a known set. Include an explicit escape hatch — a nullable field, or a `confidence` or `not_found` variant — because a schema forces the model to fill every required field, and a model with nothing to say will invent something rather than break the schema. That is the sharp edge: structure guarantees shape, never correctness.

There is overlap with tool use, which also validates arguments against a schema. The split is intent: structured outputs are for "give me this object back", tools are for "go do this thing". Using a fake tool purely to extract structure still works but reads as a workaround now that first-class support exists.

## Why it matters

Anything that puts model output into a typed system — rendering a component, writing a row, branching on a field — needs this, and it is the single biggest reliability upgrade available for an extraction or classification feature. In a take-home it is also a visible signal: a candidate who defines a schema and gets a typed value looks different from one wrapping `JSON.parse` in a retry loop.

## Key points

- Schema-constrained decoding makes malformed output impossible, which is categorically stronger than prompting for JSON and retrying.
- The schema subset is limited — expect `additionalProperties: false` and explicit `required`; range and length constraints are usually validated client-side, not enforced.
- Valid shape is not correct content. A required field with no basis in the input gets a confidently fabricated value.
- Give the model a licensed way out — nullable fields, an `unknown` enum member, a "not found" variant — or it will fill the blanks.
- Keep schemas flat and use enums wherever the value set is known; deep nesting hurts both quality and cost.
- Structured outputs and tool schemas are the same underlying mechanism; choose by intent — return a value versus perform an action.
- SDK integration with Zod or Pydantic gives you one schema shared by the model constraint and your application types, which is where most of the ergonomic win is.
- First use of a schema pays a compilation cost, then caches — irrelevant for steady traffic, visible in a cold benchmark.
