---
title: Reasoning, Effort & Thinking
summary: Models that spend tokens thinking before answering, and the one dial that trades quality against cost and latency across your whole product.
level: core
minutes: 20
order: 4
tags: [llm, api, cost, latency]

related:
  - ai/llm-foundations/choosing-a-model
  - ai/prompting-and-context/chain-of-thought-and-reasoning
  - ai/observability-and-cost/latency-budgets

resources:
  - title: Adaptive thinking
    url: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
    source: Anthropic
    type: docs
    minutes: 20
    primary: true
  - title: Effort
    url: https://platform.claude.com/docs/en/build-with-claude/effort
    source: Anthropic
    type: docs
    minutes: 10
  - title: Chain-of-Thought Prompting Elicits Reasoning in Large Language Models
    url: https://arxiv.org/abs/2201.11903
    source: Wei et al.
    type: article
    minutes: 30
---

## In one line

Reasoning models generate a stretch of internal thinking tokens before the visible answer, and `effort` is the knob that decides how much — making it the cheapest quality-versus-cost lever you have.

## What it is

Chain-of-thought started as a prompting trick: ask the model to reason step by step and accuracy on multi-step problems jumps, because the intermediate tokens give it somewhere to do the work. Current models bake that in. They emit thinking tokens first, then the answer, and the thinking is billed as output.

Two things follow. The reasoning is **not free** — it is output tokens at output prices, and on a hard problem it can dwarf the answer. And it is **not instant** — thinking happens before anything visible appears, so a streaming UI shows a long pause unless you surface a thinking indicator or a summary of the reasoning.

The API has consolidated around two controls. Thinking is **adaptive**: the model decides per request how much reasoning the task warrants, replacing the older fixed token budget, which has been removed on current models and will error if you send it. Layered on top is **effort**, a small ladder — low through max — that scales both reasoning depth and general token spend. Higher effort means more thinking, more tool calls, more thorough output; lower effort means tighter scope, fewer tokens, faster turns.

The counterintuitive parts are worth internalising. Effort is not just a quality dial, because on agentic work higher effort often *reduces* total cost — better planning up front means fewer wasted turns. Effort is also a poor verbosity control: raising or lowering it does not reliably change how long the visible answer is, and prompting is the lever for that. And the raw chain of thought is generally not returned; you get a summary if you ask for one, and it is a progress signal, not an audit log.

Practically: sweep the levels on your own eval set per call site rather than picking one globally. Classification and routing usually sit at the bottom of the ladder, the bulk of the work in the middle, and only genuinely hard reasoning or long-horizon agentic steps at the top. And when reasoning is on, `max_tokens` bounds thinking plus answer together — a budget sized for the answer alone truncates mid-sentence.

## Why it matters

This is the dial that gets pulled when someone asks "make it cheaper" or "make it better", and knowing that the right answer is per-call-site rather than global reads as experience. It is also a real UX constraint: a five-second silent gap before the first token is a design problem you have to solve deliberately, and teams who discover it after shipping end up bolting on a spinner that says nothing.

## Key points

- Reasoning tokens are output tokens — billed at output rates and generated before anything the user sees.
- Adaptive thinking lets the model choose depth per request; fixed thinking budgets are removed on current models and error if sent.
- `effort` scales reasoning and overall token spend together, and should be chosen per call site against your evals, not once for the product.
- On agentic work, higher effort can lower total cost by reducing wasted turns — the relationship between effort and spend is not monotonic.
- Effort is not a verbosity control; prompt for response length instead.
- With thinking enabled, `max_tokens` caps thinking plus answer, so a budget sized only for the answer produces truncation.
- The raw chain of thought is not exposed; a summary is available and is useful as a progress indicator, not as a record of what the model "really" did.
- Reasoning models need a UI answer for the pre-output pause — a thinking state, a streamed summary, or a progress message.
