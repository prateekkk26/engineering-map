---
title: Designing an Agent Platform
summary: Running many long-lived agent loops as infrastructure — durable state, sandboxed tool execution, approvals, and bounding what a loop can spend or break.
level: core
minutes: 25
order: 6
tags: [ai, agents, architecture]

related:
  - ai/agents/the-agent-loop
  - ai/ai-security/agent-permissions-and-blast-radius
  - ai/agents/human-in-the-loop-and-approvals

resources:
  - title: Building Effective Agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 30
    primary: true
  - title: How We Built Our Multi-Agent Research System
    url: https://www.anthropic.com/engineering/multi-agent-research-system
    source: Anthropic
    type: article
    minutes: 35
  - title: Tool Use Overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 25
---

## In one line

An agent is a loop that calls a model, executes tools and repeats — so an agent platform is a durable workflow engine whose steps are non-deterministic, whose tools have side effects, and whose runtime is measured in minutes to hours.

## What it is

**The loop, as infrastructure.** Model call → tool call(s) → results appended → repeat until done or a limit is hit. A single run can last hours, so it cannot live in the memory of one request handler. Persist the conversation and the run state after every step; a crash or deploy then resumes from the last completed step instead of restarting. This is the same durable-execution shape as a saga, with the same requirement: **every tool must be idempotent**, because a step will be retried after a crash you can't distinguish from a failure.

**Where tools execute is a security boundary.** Agents run code, read files and call APIs — on input partly produced by a model that can be influenced by untrusted content. So: a sandboxed container per session (no ambient credentials, restricted egress, resource limits), a tool allowlist per agent, and credentials that never enter the sandbox — injected at the egress proxy or held by an orchestrator that executes the sensitive call on the agent's behalf. Prompt injection is not a hypothetical here: retrieved documents and web pages are attacker-controlled input to a system that can act.

**Approvals.** Classify tools by reversibility. Read-only runs freely; writes with a clear blast radius may run with logging; irreversible or externally-visible actions (sending mail, deleting data, spending money) pause the run and wait for a human decision. That pause is a durable state — the run can be idle for a day and must resume cleanly — which is another reason the state can't be in memory.

**Bound everything.** Maximum iterations, maximum wall-clock time, and a **token budget per run**. Without them a stuck loop calls a tool that keeps failing and burns money until someone notices. The budget is the single most important guardrail, and it's the first thing an interviewer will ask about.

**Observability has to be trace-shaped.** Every model call, tool call, argument and result, with timing and tokens, tied to one run ID — because debugging "why did the agent do that?" means reading the sequence of decisions, not a log line. Sampling loses exactly the run you need, so keep full traces at least for failures and a slice of successes.

**Multi-agent, carefully.** A coordinator delegating to sub-agents parallelises independent work and keeps each context small. The costs are real: every sub-agent re-establishes context (tokens), results have to be merged, and failures compound. Delegate for genuinely independent, sizeable tracks; do the rest inline. Saying that tradeoff out loud beats proposing a swarm.

**Concurrency and cost control at the platform level.** Runs are long and expensive, so the platform needs a queue, per-tenant concurrency caps, and priority — otherwise one tenant's fifty parallel runs consume the whole token budget.

## Why it matters

This is the frontier design question at AI-forward companies, and very few candidates can answer it structurally. The strong answer treats it as durable execution plus a sandbox plus a budget — recognisable systems engineering — rather than as prompt design, and names prompt injection and irreversible actions as first-class design constraints rather than afterthoughts.

## Key points

- Persist run state after every step so a crash or deploy resumes instead of restarting.
- Every tool must be idempotent — retries after an ambiguous failure are normal.
- Execute tools in a per-session sandbox with no ambient credentials and restricted egress.
- Keep secrets out of the sandbox: inject at egress or execute sensitive calls in the orchestrator.
- Gate tools by reversibility; irreversible actions pause for human approval as a durable state.
- Bound iterations, wall-clock time and tokens per run — the token budget is the critical guardrail.
- Trace every model and tool call under one run ID; sampled logs lose the run you need to debug.
- Multi-agent buys parallelism and costs context re-establishment — delegate only for independent, sizeable work.
- Cap per-tenant concurrency, or one tenant's runs consume the platform's whole capacity.
