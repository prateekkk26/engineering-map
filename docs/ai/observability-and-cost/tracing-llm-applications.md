---
title: Tracing LLM Applications
summary: A request that fans out into retrieval, several model calls, and a dozen tool invocations is unreadable in logs — it needs a trace, and OpenTelemetry now has conventions for exactly this.
level: core
minutes: 20
order: 1
tags: [observability, llm, debugging, practices]

related:
  - ai/agents/debugging-and-observing-agents
  - ai/observability-and-cost/monitoring-quality-in-production
  - ai/working-with-the-api/token-accounting-and-cost

resources:
  - title: OpenTelemetry for generative AI
    url: https://opentelemetry.io/blog/2024/otel-generative-ai/
    source: OpenTelemetry
    type: article
    minutes: 20
    primary: true
  - title: Semantic conventions for generative AI systems
    url: https://opentelemetry.io/docs/specs/semconv/gen-ai/
    source: OpenTelemetry
    type: docs
    minutes: 25
  - title: LangSmith
    url: https://docs.smith.langchain.com/
    source: LangChain
    type: docs
    minutes: 20
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
---

## In one line

Wrap every model call, retrieval, and tool invocation in a span under one trace id, record the full inputs and outputs, and you can answer "what happened on this request" instead of guessing.

## What it is

A single user action in an LLM product decomposes into a lot of work: rewrite the query, retrieve, rerank, assemble a prompt, call the model, execute three tools, call again. Line-based logs cannot represent that nesting, and the questions you need answered — why was this answer wrong, where did the eight seconds go, which step cost the money — are all structural.

Tracing gives you the tree. The span attributes that matter for LLM work are specific: model id, prompt version, the rendered messages, the response content, token counts across all four classes, latency split into time-to-first-token and total, temperature or effort, tool name and arguments and result, retrieved chunk ids and scores, finish reason, and error details. Tie it to user id, session id, and tenant, and link agent subruns to a parent.

The convergence worth knowing about is that OpenTelemetry has published semantic conventions for generative AI — standard span and attribute names for model calls, tool calls, and agent operations. That means LLM telemetry belongs in the same APM system as everything else rather than a parallel stack, and instrumentation is portable between vendors. The LLM-specific platforms are increasingly opinionated layers on top of those conventions: they add prompt playgrounds, eval integration, annotation queues, and cost dashboards, which are genuinely useful, but the underlying data should be standard.

The decision that needs making deliberately is **whether to record prompts and completions in full**. You almost always want to, because a trace without the actual prompt cannot explain the output — and that means user content in your telemetry, which brings retention limits, redaction of secrets and PII, access controls, and a defensible answer for a privacy review. Sampling helps: trace everything at low volume, sample successful requests and keep all errors and slow requests at higher volume.

Two things to build on top. A **readable rendering** of a trace — the conversation with tool calls expanded inline — is the artifact people actually use, and it doubles as the review interface for quality. And **linking a trace to feedback**: when a user reports a bad answer, one click should surface the exact trace, which is what turns complaints into eval cases instead of anecdotes.

## Why it matters

Debugging an AI feature without traces is guessing, and interviewers ask what you would instrument because it is a fast read on whether someone has operated one of these. It is also the foundation everything else in this section stands on — cost attribution, latency budgets, and quality monitoring are all queries over the same span data.

## Key points

- One trace per user request, with nested spans for retrieval, each model call, and each tool invocation.
- Record model id, prompt version, full messages and response, all four token classes, latency split, and finish reason on the span.
- Use OpenTelemetry's generative-AI semantic conventions so LLM telemetry lives in your existing APM and stays portable.
- LLM-specific platforms add playgrounds, evals, and annotation on top; the underlying spans should still be standard.
- Recording full prompts and completions is usually necessary and puts user content in telemetry — plan retention, redaction, and access controls.
- Sample successes and keep all errors and slow requests once volume makes full tracing expensive.
- Tag every trace with user, session, tenant, and feature so cost and quality can be attributed later.
- Link agent subruns to a parent trace, or multi-agent failures are unreadable.
- Build a readable trace view early; it is the debugging tool and the quality-review interface at once.
- Wire user feedback to the trace id so a complaint becomes an inspectable case in one click.
