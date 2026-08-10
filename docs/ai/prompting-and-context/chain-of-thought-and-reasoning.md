---
title: Chain-of-Thought & Reasoning
summary: Giving the model tokens to work in before it answers — now largely built into the model, which changes what you should prompt for.
level: core
minutes: 20
order: 4
tags: [prompting, llm, reasoning, quality]

related:
  - ai/working-with-the-api/reasoning-effort-and-thinking
  - ai/prompting-and-context/prompting-fundamentals
  - ai/agents/the-agent-loop

resources:
  - title: Chain-of-Thought Prompting Elicits Reasoning in Large Language Models
    url: https://arxiv.org/abs/2201.11903
    source: Wei et al.
    type: article
    minutes: 35
    primary: true
  - title: Adaptive thinking
    url: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
    source: Anthropic
    type: docs
    minutes: 15
  - title: ReAct — Synergizing Reasoning and Acting in Language Models
    url: https://arxiv.org/abs/2210.03629
    source: Yao et al.
    type: article
    minutes: 35
  - title: Language Models Don't Always Say What They Think
    url: https://arxiv.org/abs/2305.04388
    source: Turpin et al.
    type: article
    minutes: 30
---

## In one line

A model computes only while emitting tokens, so producing intermediate reasoning before the answer gives it somewhere to do the work — and modern models do this natively rather than on request.

## What it is

The mechanism is unglamorous. There is a fixed amount of computation per token, so a problem needing several steps cannot be solved in the single forward pass that produces the answer token. Emitting reasoning tokens first buys more passes, and each intermediate conclusion becomes context the later steps can attend to. That is why "think step by step" produced a large accuracy jump on multi-step problems, and why it never helped on lookup or single-step tasks.

Variants layered on top. **Self-consistency** samples several reasoning paths and takes the majority answer — expensive, effective on problems with a checkable single answer. **ReAct** interleaves reasoning with tool calls, thinking between actions rather than only up front, and it is the direct ancestor of how agent loops work today. **Self-critique** asks the model to review its own answer, which helps unevenly and helps most when the critique has something external to check against.

What has changed is where the reasoning lives. Frontier models now reason natively — thinking tokens are emitted before the visible answer, and how much is controlled by an effort setting rather than by prompt wording. So prompting for reasoning is largely redundant and sometimes harmful: on top of native thinking it produces long visible preambles the user has to scroll past. If you want more reasoning, raise effort. If you want less, lower it. Prompt for what the *answer* should look like, not for the process.

Two cautions worth holding. First, the reasoning trace is not an explanation. Models can produce plausible reasoning that does not reflect the computation that actually produced the answer, and will construct post-hoc justification for an answer driven by something in the prompt they never mention. Do not present it to users as "why the model decided this", and do not treat it as an audit log. Second, reasoning is not free — it is output tokens and it is latency before anything appears, so for classification, extraction, and routing it is pure cost.

The reliable place to still prompt explicitly for structured thinking is where you want a *specific* procedure followed — check these five constraints in order, list the candidates before choosing — because that is a task specification, not an attempt to make the model think harder.

## Why it matters

Reasoning is the main quality-cost-latency trade in the product, and knowing that the lever moved from the prompt to a parameter is a currency check in interviews — a lot of advice in circulation is two model generations old. The interpretability caveat matters too: teams that ship the reasoning trace as a user-facing explanation are making a claim about the model that is not true.

## Key points

- Reasoning tokens buy computation: more passes plus intermediate results the model can attend to. That is the whole mechanism.
- It helps on multi-step problems and does nothing for lookup or single-step tasks, where it is pure cost and latency.
- Modern models reason natively; effort settings, not prompt phrasing, are the lever for how much.
- Prompting "think step by step" on a reasoning model is redundant and often produces unwanted visible preamble.
- Self-consistency (sample several paths, take the majority) trades cost for accuracy on problems with a single checkable answer.
- ReAct — reason, act, observe, repeat — is the pattern the agent loop is built on.
- A reasoning trace is not a faithful explanation; models rationalise post hoc, so never present it as the reason for a decision.
- Do still prompt explicitly when you want a *specific* procedure followed; that is specifying the task, not asking for more thinking.
