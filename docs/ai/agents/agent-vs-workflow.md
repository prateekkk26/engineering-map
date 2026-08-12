---
title: Agent or Workflow?
summary: The first decision in any LLM system — whether the model controls the flow, or your code does.
level: core
minutes: 20
order: 1
tags: [agents, architecture, llm]

related:
  - _shared/caching
  - ai/agents/multi-agent-systems

resources:
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: Writing effective tools for agents
    url: https://www.anthropic.com/engineering/writing-tools-for-agents
    source: Anthropic
    type: article
    minutes: 20
  - title: Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
    source: Anthropic
    type: docs
    minutes: 15
---

## In one line

A workflow is a pipeline you wrote with a model in it; an agent decides its own next step in a loop — and most problems that sound like they need an agent don't.

## What it is

There's a spectrum, and only two points on it really matter.

A **workflow** is code you control. You decide the steps, the order, and the branches; the model fills in the parts that need language understanding. Classify this ticket, then route it. Extract these fields, then validate them. Summarise, then translate. The model is a very good function call inside a program you wrote. Every path is one you anticipated.

An **agent** is a loop the model drives. You give it a goal and a set of tools, and it decides what to call, in what order, when it has enough, and when it's done. You don't know the path in advance — that's the point, and it's also the cost.

The practical test is: **can you write down the steps in advance?** If yes, write them down — that's a workflow, and it will be cheaper, faster, more debuggable, and easier to test. If the steps genuinely depend on what's discovered along the way, and enumerating the branches would be absurd, that's where an agent earns its keep.

The failure mode in both directions is real. Reaching for an agent on a three-step pipeline buys nondeterminism, latency, and cost for nothing. Forcing a genuinely open-ended task through a rigid pipeline produces something that breaks on every input you didn't anticipate.

Four questions worth asking before committing to an agent: is the task genuinely hard to specify up front, is the outcome valuable enough to justify the extra cost and latency, is the model actually capable at this task type, and can errors be caught and recovered from? A "no" on any of them points back to a workflow.

## Why it matters

"Build an agent" is the default answer right now, and being able to argue *against* one — with a real cost, latency, and testability case — signals engineering judgement rather than enthusiasm. In an interview at an AI-forward company this is often the opening question of a design round, and the candidates who reach straight for a multi-agent architecture usually lose the thread when asked how they'd debug or evaluate it.

It's also the decision with the largest downstream consequences: it determines your latency profile, your cost model, your testing strategy, and whether you can reason about failures at all.

## Key points

- If you can enumerate the steps in advance, write them as a workflow — you get determinism, cheaper runs, and tests that actually mean something.
- An agent's cost and latency are unbounded by construction; a workflow's are known before you ship.
- Agents are worth it when the path genuinely depends on what's discovered mid-task, and enumerating branches would be unreasonable.
- Check all four gates before committing: task complexity, value of the outcome, model capability, and recoverability of errors. A "no" on any one points back to a workflow.
- Most "agent" products in the wild are workflows with one model-driven step — and that's usually the right design, not a compromise.
- Start at the simplest tier that works and move up only when it demonstrably fails. Going the other direction is much more expensive.
- Multi-agent orchestration is a further step up in cost and debugging difficulty, not a free upgrade — each subagent re-establishes context and reports back, and the coordinator then re-reads the report.
