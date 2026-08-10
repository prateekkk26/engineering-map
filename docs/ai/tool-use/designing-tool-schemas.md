---
title: Designing Tool Schemas
summary: The description and schema are the prompt for that tool — most tool misuse is a specification bug, not a model failure.
level: core
minutes: 20
order: 2
tags: [tools, llm, api, quality]

related:
  - ai/agents/designing-an-agents-tool-surface
  - ai/tool-use/tool-errors-and-recovery
  - ai/working-with-the-api/structured-outputs

resources:
  - title: Writing effective tools for agents
    url: https://www.anthropic.com/engineering/writing-tools-for-agents
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 20
  - title: JSON Schema
    url: https://json-schema.org/understanding-json-schema
    source: JSON Schema
    type: docs
    minutes: 30
---

## In one line

A tool definition is documentation written for a model — the name says what, the description says when, and the schema makes the wrong call structurally difficult.

## What it is

When an agent picks the wrong tool or fills a field with nonsense, the instinct is to add a rule to the system prompt. That is nearly always the wrong layer. The tool's own description is read at the moment of choosing, sits right next to the schema, and is far more effective than a distant instruction.

**Names** should be specific and verb-led — `search_orders_by_customer`, not `query`. A vague name forces the model to infer from the description alone, and two similarly named tools are the most reliable way to get the wrong one called.

**Descriptions** should say *when* to call it, not only what it does. "Returns the current weather" describes; "Call this when the user asks about current conditions or forecasts for a named location; do not use it for historical weather" decides. Trigger conditions measurably lift selection accuracy, especially on models that reach for tools conservatively. Name the boundaries too — what it does *not* cover, and which sibling tool covers that instead.

**Schemas** should make bad calls hard to express. Enums instead of free strings wherever the value set is known. Explicit `required` lists and `additionalProperties: false`. Descriptions on every property, including the format you expect for dates and ids. Flat structures over deeply nested ones, since nesting costs tokens and accuracy. And prefer parameters the model can actually know: asking for an internal `customer_id` when the model has only seen a name guarantees a fabricated id — take the name and resolve it yourself, or give it a lookup tool.

Two systemic considerations. Every definition sits in the context on every request, so a sprawling tool set costs tokens continuously and degrades selection; keep the set small and orthogonal, and load definitions on demand when it must be large. And schema support is a subset of JSON Schema — objects, arrays, scalars, enums, unions and refs are honoured, while numeric ranges, string lengths, and recursion generally are not enforced by the model and must be validated in your code.

The way to get this right is empirical: read real traces, find the calls that went wrong, and fix the description or the schema rather than the prompt. Tools should also be tested like any interface — including what happens when the model passes something the schema permits but your handler cannot cope with.

## Why it matters

Tool definitions are the highest-leverage and most-neglected surface in an agent system. In a practical round, a candidate who writes tight schemas with enums and trigger-condition descriptions produces a visibly more reliable agent than one who writes three loosely-typed tools and then fights it with prompt rules. In production, "the agent keeps calling the wrong thing" is almost always a naming or description problem.

## Key points

- The description is the prompt for that tool — state the trigger condition, not just the behaviour.
- Specific verb-led names prevent the most common failure: two plausible tools and the model picking the wrong one.
- Say what the tool does *not* cover and point at the sibling that does.
- Use enums, explicit `required`, and `additionalProperties: false` so the malformed call is unrepresentable.
- Only ask for parameters the model can plausibly know; requesting an internal id it has never seen guarantees a fabricated one.
- Keep schemas flat — nesting costs tokens and hurts accuracy.
- The supported schema subset is narrower than full JSON Schema; validate ranges, lengths, and cross-field rules in your own code.
- Every definition occupies context on every call; keep the set small, orthogonal, and cached, and defer loading when large.
- Fix tool misuse in the description or schema, not with a rule in the system prompt.
