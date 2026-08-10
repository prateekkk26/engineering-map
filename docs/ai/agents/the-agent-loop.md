---
title: The Agent Loop
summary: Every agent is the same twenty-line while loop — model, tool call, result, repeat — and all the difficulty is in the termination conditions.
level: core
minutes: 20
order: 2
tags: [agents, llm, architecture]

related:
  - ai/agents/agent-vs-workflow
  - ai/tool-use/what-function-calling-actually-is
  - ai/agents/debugging-and-observing-agents

resources:
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: ReAct — Synergizing Reasoning and Acting in Language Models
    url: https://arxiv.org/abs/2210.03629
    source: Yao et al.
    type: article
    minutes: 35
  - title: LLM Powered Autonomous Agents
    url: https://lilianweng.github.io/posts/2023-06-23-agent/
    source: Lilian Weng
    type: article
    minutes: 40
  - title: Handling stop reasons
    url: https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons
    source: Anthropic
    type: docs
    minutes: 10
---

## In one line

Call the model with the conversation and a tool list; if it stops with `tool_use`, run the tools, append the results, and call again — until it stops with `end_turn` or you cut it off.

## What it is

The loop itself is trivial and worth being able to write from memory. Send messages plus tools. Inspect `stop_reason`. On `end_turn`, you are done. On `tool_use`, append the assistant's full content — including the `tool_use` blocks, not just the text — execute every requested tool, append all results in a single user message with matching `tool_use_id`s, and loop. That is the whole mechanism; ReAct is this pattern with the reasoning made explicit, and every agent framework is a wrapper around it.

Everything hard is in the conditions around it.

**Termination.** The model decides when it is done, which means it might not. Real loops need a maximum iteration count, a token budget, a wall-clock deadline, and a check for the loop-detection case where the same tool is called with the same arguments repeatedly. A newer control worth knowing is a **task budget** — telling the model how many tokens it has for the whole task so it paces itself and wraps up gracefully, which is different from `max_tokens` (a hard per-response cap the model cannot see).

**Message-shape correctness.** Every `tool_use` needs a matching `tool_result`, results for parallel calls must come back in one user message, and a failed tool still needs a result — with an error flag — not a dropped block. Splitting parallel results across messages quietly trains the model to stop making parallel calls.

**Context growth.** Every iteration appends. A long run hits the window, so compaction, tool-result filtering, and external state are not optimisations here — they are what makes the loop survive.

**Cost and cache.** The whole transcript is re-sent every iteration, so an uncached agent is quadratic. Keeping the tool list and system prompt byte-stable across iterations is what makes the run affordable.

Build the loop yourself once. After that, use the SDK's tool runner or an equivalent — it handles the loop while still letting you gate, inspect, and modify each turn, which covers the "but I need control" objection that usually sends people back to hand-rolling it.

## Why it matters

"Walk me through how an agent actually works" is a standard opener, and answering with the concrete loop — plus the four things that keep it from running forever — separates people who have built one from people who have used a framework. It is also the debugging model: when an agent misbehaves, the question is always which iteration, what was in the context at that point, and what the tool actually returned.

## Key points

- The loop is: call model → if `stop_reason` is `tool_use`, execute and append results → call again → stop on `end_turn`.
- Append the assistant's full content including `tool_use` blocks; dropping them breaks the pairing and the next request errors.
- Return all parallel tool results in a single user message; splitting them across turns discourages the model from parallelising again.
- A failed tool returns an error result, never nothing — the model can recover from an error and cannot recover from a missing block.
- Bound the loop on iterations, tokens, and wall-clock, and detect repeated identical calls; the model will not always decide it is finished.
- A task budget lets the model pace itself and wrap up; `max_tokens` is an invisible hard cap that just truncates.
- Context grows every iteration, so compaction, result filtering, and external state are load-bearing, not optional.
- The transcript is re-sent every iteration — keep the prefix stable and cached or cost grows quadratically.
- Write the loop by hand once to understand it, then use a tool runner that still exposes per-turn hooks.
