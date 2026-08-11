---
title: When Not to Use an LLM
summary: Slower, more expensive, and occasionally wrong is a bad trade against a regex, a query, or a lookup table — and recognising that is a senior signal.
level: core
minutes: 15
order: 4
tags: [product, judgement, cost, architecture]

related:
  - ai/agents/agent-vs-workflow
  - ai/rag-and-retrieval/when-you-dont-need-rag
  - ai/observability-and-cost/unit-economics-of-an-llm-feature

resources:
  - title: Building effective agents
    url: https://www.anthropic.com/engineering/building-effective-agents
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: What We've Learned From A Year of Building with LLMs
    url: https://applied-llms.org/
    source: Yan, Bernstein, Huyen, Husain, Shankar, Zhu
    type: article
    minutes: 60
  - title: Building LLM applications for production
    url: https://huyenchip.com/2023/04/11/llm-engineering.html
    source: Chip Huyen
    type: article
    minutes: 40
---

## In one line

If the problem has a deterministic solution, a model is a slower, costlier, less reliable implementation of it — and the fact that it works is not an argument for it.

## What it is

A model is the right tool for open-ended language: understanding messy natural input, generating prose, summarising, classifying by fuzzy criteria, reasoning over unstructured material. It is the wrong tool, and often a liability, for several categories that get reached for anyway.

**Arithmetic and aggregation.** Counts, sums, totals, date differences. A model approximates; code computes. If the answer must be exact, generate the query and let the database do the work.

**Deterministic parsing and validation.** Well-formed CSVs, known JSON, email and phone validation, format checks. A regex is instant, free, and correct every time. Reach for a model on the *messy* end — free text, inconsistent documents, human-written notes — not on the structured end.

**Exact lookup.** "What's this user's plan?" is a database read. Retrieval over descriptions of plans is an approximation of a query you already have.

**Rules that are actually rules.** Business logic with defined conditions belongs in code where it can be tested, audited, and explained. Encoding it in a prompt trades testability for nothing.

**High-volume trivial classification** where a small trained classifier or even keyword rules would do — orders of magnitude cheaper and faster, with the extra virtue of being stable.

**Anything requiring guarantees.** Legal, medical, financial, or safety-critical outputs that must be correct rather than probably correct need deterministic systems, or a model strictly in a draft-for-review position.

The useful question in a design review is: **what is the failure mode, and can we live with it?** For a drafted email, a wrong output costs an edit. For a computed invoice total, it costs a customer. Sort features by that, and a lot of proposed LLM usage relocates itself into code.

Hybrid designs are usually the right answer rather than choosing sides: the model interprets intent and formats the response, while code does the retrieval, the arithmetic, and the decision. That is the shape of most well-built AI features — a small amount of model in a mostly deterministic system.

## Why it matters

There is real pressure to add AI to everything, and the ability to say "this part should be code" is a senior signal precisely because it runs against that pressure. In design rounds it distinguishes engineers who reason about tools from engineers reaching for the fashionable one, and in practice it is the difference between a feature that costs pennies and works, and one that costs dollars and occasionally invents a number.

## Key points

- Arithmetic, aggregation, and exact totals belong in code or SQL — a model approximates where you need exactness.
- Structured parsing and format validation are regex and schema problems; use a model only for the genuinely messy end.
- Exact lookups are database reads, not retrieval problems.
- Business rules with defined conditions belong in testable, auditable code rather than in a prompt.
- High-volume trivial classification is usually cheaper, faster, and more stable with a small classifier or plain rules.
- Anything needing guarantees rather than probabilities keeps the model in a draft-for-review role at most.
- Ask what the failure mode costs — that question relocates a lot of proposed LLM usage into code.
- Most good AI features are hybrids: the model interprets and phrases, code retrieves, computes, and decides.
- "It works" is not a justification when a deterministic alternative is faster, cheaper, and always correct.
