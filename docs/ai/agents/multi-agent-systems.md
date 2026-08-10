---
title: Multi-Agent Systems
summary: Splitting work across several agents buys parallelism and context isolation, and costs you coordination, tokens, and most of your ability to debug.
level: deep
minutes: 20
order: 6
tags: [agents, architecture, cost]

related:
  - ai/agents/agent-vs-workflow
  - ai/agents/the-agent-loop
  - ai/agents/debugging-and-observing-agents

resources:
  - title: How we built our multi-agent research system
    url: https://www.anthropic.com/engineering/built-multi-agent-research-system
    source: Anthropic
    type: article
    minutes: 30
    primary: true
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
  - title: Don't Build Multi-Agents
    url: https://cognition.ai/blog/dont-build-multi-agents
    source: Cognition
    type: article
    minutes: 20
---

## In one line

A coordinator delegates sub-tasks to subagents that each work in their own context and report back — worth it when the sub-tasks are genuinely independent and expensive, and a liability otherwise.

## What it is

The real motivation is context, not concurrency. A single agent researching twelve sources fills its window with twelve sources. Twelve subagents each read one and return a summary; the coordinator sees twelve summaries. That is a compression scheme with parallelism attached, and it is why the pattern earns its place on wide, independent, read-heavy work — research, multi-file investigation, fanning out across candidates.

The costs are underrated. Every subagent re-establishes its own context, so token usage multiplies — a multi-agent research run can consume many times what a single agent would. Handoffs lose information: the coordinator acts on a summary, not on what the subagent actually saw, and a subagent working from a vague brief produces confidently wrong work in isolation. Debugging gets substantially harder, because a failure is now distributed across several traces. And subagents that share a filesystem can overwrite each other.

So the discipline is: use them for genuinely independent, sizeable tracks. Do not use them for work the main agent could finish in a few tool calls, do not split one modest job across several, and do not use a subagent to verify the main agent's work — verification belongs in the main loop. Keep spawn counts low, brief each subagent completely the first time rather than launching and re-briefing, and commit to the delegation instead of re-deriving its findings when the report comes back.

Model behaviour on this has swung between generations — some models under-delegate and need encouragement, others reach for subagents far too eagerly and need an explicit cap. Either way an explicit policy in the system prompt is the lever, and a hard ceiling on concurrent spawns is the safety net.

Structurally, most production systems are a **coordinator with a flat roster of workers**, one level deep, and enforcement usually forbids deeper nesting for good reason — nested delegation makes cost and behaviour nearly impossible to reason about. Peer-to-peer agent swarms are a research topic, not a shipping pattern.

The honest default: try one agent with good tools and good context first. Most multi-agent architectures in interviews are proposed before a single agent has been shown to fail.

## Why it matters

"Would you use multiple agents?" is a design-round trap. Reaching straight for a swarm signals enthusiasm; explaining that the payoff is context isolation on independent work, and that it multiplies cost and destroys observability otherwise, signals judgement. The teams that ship this successfully are specific about which axis they are parallelising and why.

## Key points

- The main benefit is context isolation — each subagent's raw material stays out of the coordinator's window — with parallelism as a bonus.
- Token usage multiplies, since every subagent rebuilds its own context; budget for several times a single-agent run.
- Handoffs lose fidelity: the coordinator sees a summary, so brief subagents precisely and completely up front.
- Use subagents only for independent, sizeable tracks; never for work the main agent could do in a few tool calls, and never for verification.
- Cap concurrent spawns explicitly — model tendencies to over- or under-delegate vary and are prompt-steerable.
- One level of delegation. Nested coordinators make cost and behaviour unreasonable, and most platforms reject them outright.
- Subagents sharing a filesystem can clobber each other; partition writes or serialise them.
- Debugging is distributed — per-agent traces linked to a parent run are mandatory, not nice to have.
- Prove a single agent insufficient before adding a second; most proposed multi-agent systems are premature.
