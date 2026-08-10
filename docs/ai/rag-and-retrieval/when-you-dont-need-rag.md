---
title: When You Don't Need RAG
summary: Long context, agentic search, and a plain database query have each eaten a chunk of what RAG used to be the only answer for.
level: core
minutes: 15
order: 7
tags: [rag, retrieval, architecture, judgement]

related:
  - ai/rag-and-retrieval/rag-in-one-picture
  - ai/llm-foundations/prompting-vs-rag-vs-fine-tuning
  - ai/agents/agent-vs-workflow

resources:
  - title: Effective context engineering for AI agents
    url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    source: Anthropic
    type: article
    minutes: 30
    primary: true
  - title: Introducing Contextual Retrieval
    url: https://www.anthropic.com/news/contextual-retrieval
    source: Anthropic
    type: article
    minutes: 25
  - title: "Lost in the Middle: How Language Models Use Long Contexts"
    url: https://arxiv.org/abs/2307.03172
    source: Liu et al.
    type: article
    minutes: 30
---

## In one line

RAG is machinery for choosing what the model sees; if the corpus fits in the window, or the question is really a database query, or the agent can just search and read, that machinery is overhead.

## What it is

Four cases where the pipeline is the wrong answer.

**The corpus is small.** If everything relevant fits comfortably in the context — a product manual, a policy document, a single codebase file set — put it in the prompt and cache it. Cached input is cheap, there is no index to build, no chunking decision to get wrong, no retrieval to miss, and no re-embedding migration when the model changes. With million-token windows, "small" now covers a surprising amount. The limits are real though: cost scales with what you send every time, prefill latency grows, and quality degrades as the window fills, so this trades a retrieval problem for a context-management one rather than eliminating it.

**The question is structured.** "How many open tickets does this customer have?" is SQL. Semantic search over ticket text will approximate an answer that a query returns exactly. The right architecture is text-to-query, or a tool that runs a parameterised query — the model chooses and interprets, the database computes. Embedding structured data and hoping similarity search reconstructs an aggregation is a common and avoidable mistake.

**An agent can navigate.** Give a model `grep`, `glob`, and `read` over a repository and it will find the relevant code by searching, listing, and following references — the way an engineer would — with no index at all. This is how coding agents work, and it generalises to any corpus with structure and a search interface. The trade is latency and tokens, since each step is a round trip, against always-fresh results and zero index maintenance. For a filesystem or a system with a good existing search API, agentic retrieval is frequently better than embeddings.

**There's already a search engine.** If the content lives in a system with real search — a documentation site, a ticketing system, a wiki — wrapping that search as a tool is a fraction of the work of building a parallel index that will drift.

The honest default: start with the whole document in a cached prompt. Add retrieval when the corpus stops fitting, when cost per request becomes the problem, or when you measure quality falling as context grows. RAG is the answer to a scale problem, and it costs a pipeline that needs maintenance forever.

## Why it matters

Proposing RAG reflexively for every knowledge question is a tell. The stronger move in a design round is sizing the corpus first and saying so — "at ten documents I'd cache them in the prompt; at ten thousand I'd index" — because it shows you know what the pipeline is buying and what it costs. Teams that skipped this question routinely maintain an embedding pipeline for a corpus that would fit in a single request.

## Key points

- If the corpus fits in the window, cache it in the prompt — no index, no chunking, no retrieval misses, no re-embedding migrations.
- Long context trades a retrieval problem for a cost-and-attention problem; it is not free, just differently priced.
- Aggregations, counts, and filters are database queries — expose a query tool rather than embedding structured data.
- Agents with search, list, and read tools can navigate a structured corpus with no index at all, always fresh, at the cost of extra round trips.
- If the content already lives behind a good search API, wrap that as a tool instead of building a second index that will drift.
- RAG earns its place at scale, on changing corpora, and where per-request cost matters — not by default.
- The pipeline is a permanent maintenance commitment: freshness, deletion, re-embedding, and eval upkeep.
- Size the corpus before choosing the architecture; it is the question that decides the answer.
- Hybrid designs are normal — cache a small always-relevant core and retrieve from the long tail.
