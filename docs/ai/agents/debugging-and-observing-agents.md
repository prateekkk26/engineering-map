---
title: Debugging & Observing Agents
summary: You cannot debug an agent by reading its final answer — you need the full trace of every turn, tool call, and result, and the failure is usually in the context.
level: core
minutes: 20
order: 7
tags: [agents, observability, debugging]

related:
  - ai/observability-and-cost/tracing-llm-applications
  - ai/agents/the-agent-loop
  - ai/evals-and-quality/evaluating-agent-trajectories

resources:
  - title: How we built our multi-agent research system
    url: https://www.anthropic.com/engineering/built-multi-agent-research-system
    source: Anthropic
    type: article
    minutes: 30
    primary: true
  - title: OpenTelemetry for generative AI
    url: https://opentelemetry.io/blog/2024/otel-generative-ai/
    source: OpenTelemetry
    type: article
    minutes: 20
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
---

## In one line

Log the complete trace — every request, response, tool call, tool result, and token count, linked by a run id — because the answer to "why did it do that?" is almost always something that was in the context at iteration seven.

## What it is

An agent failure is not a stack trace. It is a sequence of individually reasonable decisions that ended somewhere wrong, and the only way to find the divergence is to replay the run turn by turn. That means capturing, per iteration: the messages sent, the model's response including tool calls, the arguments, the actual tool result, the stop reason, latency, and token usage — all tied to one run id, and to a parent run id when subagents are involved.

The recurring causes are consistent enough to check in order. **Tool description problems** — the agent picks the wrong tool, or calls the right one with wrong arguments, and the fix is in the description or schema rather than the prompt. **Bad tool results** — an empty response, a silent error, or a 50,000-token blob that pushed everything useful out of the window. **Context problems** — the constraint from turn one is buried; a stale result is being treated as current. **Loops** — the same call with the same arguments, repeatedly, because a result was uninformative. **Termination problems** — stopping early with a statement of intent instead of the action, or never stopping at all.

Tooling shape: OpenTelemetry has generative-AI semantic conventions, so agent traces fit into normal APM rather than needing a parallel stack, and the LLM-specific platforms are largely opinionated layers on top of that. What matters more than the vendor is that the trace is complete and readable — a rendered timeline of a run, with expandable tool inputs and outputs, is the single most valuable debugging artifact you can build, and it doubles as the interface for reviewing quality.

Two practices worth adopting early. **Replay**: store enough to re-run a failed trace against a changed prompt or tool, so fixes are verified rather than hoped for. And **sample and read traces regularly** even when nothing is broken — reading twenty real runs a week surfaces problems that no metric shows, and it is the main source of new eval cases.

The metrics that actually matter for an agent are task-level, not turn-level: completion rate, turns per task, tokens per task, tool error rate, human intervention rate, and the frequency of hitting the iteration cap. Average response latency tells you almost nothing about whether the agent is working.

## Why it matters

"Your agent is doing something weird in production — how do you find out why?" is a strong senior-level question because it has no answer without observability, and instrumentation is one of the things teams reliably postpone until they need it retroactively. It is also the honest counter to enthusiasm about agents in a design round: the reason to prefer a workflow is often precisely that a workflow can be debugged.

## Key points

- Capture the full trace per iteration — messages, response, tool calls, real results, stop reason, latency, tokens — under one run id, with parent links for subagents.
- The failure is usually in the context, not the model: the wrong thing was retrieved, buried, stale, or enormous.
- Check tool descriptions and schemas first when an agent picks wrong tools or wrong arguments; that is a spec bug, not a model bug.
- Watch for loops — repeated identical calls almost always follow an uninformative tool result.
- Instrument termination: how often runs hit the iteration cap, and how often they stop with intent instead of action.
- Use OpenTelemetry's generative-AI conventions so agent traces live in the same system as the rest of your telemetry.
- Build a readable run timeline early; it is both the debugging tool and the quality-review interface.
- Support replay against a modified prompt or tool so fixes are verified rather than assumed.
- Read sampled traces on a schedule, not only during incidents — it is the best source of new eval cases.
- Measure at task level — completion rate, turns per task, tokens per task, intervention rate — not per-response latency.
