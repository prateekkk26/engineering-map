---
title: Parallel & Sequential Tool Calls
summary: A model can request several tools in one turn — running them concurrently is free latency, and getting the message shape wrong quietly teaches it to stop.
level: core
minutes: 15
order: 3
tags: [tools, llm, performance, integration]

related:
  - ai/agents/the-agent-loop
  - ai/tool-use/what-function-calling-actually-is
  - ai/observability-and-cost/latency-budgets

resources:
  - title: Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Programmatic tool calling
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling
    source: Anthropic
    type: docs
    minutes: 20
  - title: Function calling
    url: https://platform.openai.com/docs/guides/function-calling
    source: OpenAI
    type: docs
    minutes: 20
---

## In one line

One assistant turn can contain several `tool_use` blocks; execute them concurrently and return every result in a single user message, or the model stops offering you the opportunity.

## What it is

Parallel tool use is on by default on current models. When the requests are independent — three lookups, four file reads, a fan-out across candidates — the model emits them together, and the latency win is real: three sequential 400ms calls plus two extra model round trips becomes one 400ms wait.

The rule that matters is the message shape. All results go back in **one** user message, one `tool_result` block per `tool_use_id`. Splitting them across several user messages is accepted by the API but changes behaviour — it trains the model, within that conversation, to stop making parallel calls, and the effect is invisible unless you are watching traces. Partial returns are worse: every requested call needs a result, and a failed one returns an error result rather than being omitted.

Sequential calls are the other half, and they are sequential for a reason — the second call's arguments depend on the first call's output. Look up the customer, then fetch their orders. That dependency costs a full model round trip per step, which is where agent latency actually goes: not in your tools, but in the model turns between them.

Two ways to compress that. **Give the model tools at the right altitude** — a single `get_customer_orders_by_email` beats forcing two round trips through `find_customer` then `get_orders`. Coarse-grained tools that match real tasks are faster and more reliable than a fine-grained API surface faithfully mirrored into tool definitions.

**Programmatic tool calling** goes further: the model writes a script that invokes tools in a sandbox, with loops and branching, and only the final output returns to the context. Intermediate results never enter the window at all. For "check these forty items and tell me which three failed", that is the difference between forty round trips filling the context and one.

Concurrency is your responsibility, and so are its consequences. Read-only tools are safe to run in parallel; writes may not be. If two calls in one turn touch the same resource, you need ordering or locking — the model has no idea your tools contend.

## Why it matters

Latency is the main complaint about agentic features, and most of it is model round trips rather than tool execution — so knowing that the levers are parallelism, tool granularity, and programmatic calling is a concrete performance answer rather than a vague one. The single-message rule is also the kind of subtle protocol detail that quietly degrades a system: performance regresses over a conversation and nobody can explain why.

## Key points

- Parallel tool use is on by default; independent calls arrive together in one assistant turn.
- Return all results in a single user message with matching `tool_use_id`s — splitting them across messages suppresses future parallel calls.
- Every requested call needs a result, including failures, which return an error result rather than being dropped.
- Sequential chains cost a full model round trip per step; that, not tool execution, is where agent latency accumulates.
- Design tools at task altitude rather than mirroring your REST endpoints — one coarse tool often replaces a three-step chain.
- Programmatic tool calling lets the model script tool invocations in a sandbox so intermediate results never enter the context.
- You own concurrency: parallelise reads freely, and add ordering or locking when two calls in a turn touch the same resource.
- Disable parallel calls deliberately when correctness requires strict ordering — it is a supported option, not something to fake in the prompt.
