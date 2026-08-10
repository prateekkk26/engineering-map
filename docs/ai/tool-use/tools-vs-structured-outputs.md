---
title: Tools vs Structured Outputs
summary: "Both constrain the model to a JSON schema — pick by intent: return me a value, or go do a thing."
level: core
minutes: 15
order: 6
tags: [tools, llm, api, architecture]

related:
  - ai/working-with-the-api/structured-outputs
  - ai/tool-use/what-function-calling-actually-is
  - ai/agents/agent-vs-workflow

resources:
  - title: Structured outputs
    url: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 20
  - title: Structured Outputs
    url: https://platform.openai.com/docs/guides/structured-outputs
    source: OpenAI
    type: docs
    minutes: 20
---

## In one line

Structured outputs shape the model's answer; tools let the model ask your code to act — same schema machinery, opposite direction of control.

## What it is

Before structured outputs existed, extracting typed data meant declaring a fake tool — `record_extraction` — forcing `tool_choice` to it, and reading the arguments. It worked because tool arguments were the only schema-validated channel. That workaround is now legacy: providers expose an output format directly, so a request that needs a typed object gets one without pretending an action is happening.

The distinction that survives is intent, and it maps to control flow.

**Structured outputs** are terminal. One call, one typed object, done. Classification, extraction, scoring, generating a config, producing props for a component. The model produced a value and you use it.

**Tools** are an interrupt. The model stops, says "I need this", and hands control to your code — which executes, returns a result, and calls the model again. That loop exists precisely because the model needs something it does not have: current data, a private record, a side effect. If your flow has no loop and nothing is executed, you do not need a tool.

There is a genuine middle ground. Tools are also the idiomatic way to model *a choice among actions* — route this ticket, escalate, or resolve it — because each option carries its own argument schema, which a single output schema expresses awkwardly. Discriminated unions in an output format can do it, but a tool per action reads better and gives you a natural hook for approval and logging.

Practical consequences worth knowing. A forced tool call still costs the tool definition in context on every request; an output format does not appear in the messages at all. Structured outputs are usually incompatible with a few features — citations being the notable one — so a request that needs source attribution generally cannot also pin an output schema. And both share the same limitation, which is the one people forget: a guaranteed shape is not a guaranteed truth. Every required field will be filled, correctly or otherwise, so give the model a null option or an "unknown" variant whenever the input might not contain the answer.

## Why it matters

This choice appears in nearly every practical round, because almost every AI feature needs either a typed value or an action. Reaching for a fake tool to get JSON now signals knowledge that stopped being current; reaching for structured outputs where an action is genuinely required produces a design that cannot do anything. Naming the intent test — value versus action — resolves it cleanly in a sentence.

## Key points

- Same underlying machinery, opposite intent: structured outputs constrain the answer, tools request an action from your code.
- The old fake-tool-for-JSON trick is obsolete; use a first-class output format and skip the tool-definition tokens.
- If nothing executes and there is no second model call, you want structured outputs, not a tool.
- Tools are still the better model for choosing among actions, since each action carries its own argument schema and its own approval hook.
- Forced tool calls keep the definition in context on every request; output schemas do not appear in the message list.
- Structured outputs conflict with some features — notably citations — so attribution-bearing responses usually cannot pin a schema.
- Both guarantee shape, never correctness: required fields get filled whether or not the input supports it.
- Always include a null or unknown variant so the model has a way to say the answer is not there.
