---
title: RAG at Scale
summary: The retrieval pipeline as a system — ingestion, indexing, hybrid retrieval and reranking — and the freshness and permission problems nobody mentions in the diagram.
level: core
minutes: 25
order: 4
tags: [ai, rag, retrieval]

related:
  - ai/rag-and-retrieval/rag-in-one-picture
  - ai/rag-and-retrieval/hybrid-search-and-reranking
  - system-design/ai-system-design/vector-search-infrastructure

resources:
  - title: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
    url: https://arxiv.org/abs/2005.11401
    source: Lewis et al. / Meta AI
    type: article
    minutes: 45
  - title: Contextual Retrieval
    url: https://www.anthropic.com/news/contextual-retrieval
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: Building a RAG System — Patterns and Pitfalls
    url: https://eugeneyan.com/writing/llm-patterns/
    source: Eugene Yan
    type: article
    minutes: 40
---

## In one line

RAG at scale is two pipelines — an offline one that turns documents into a searchable index, and an online one that turns a question into the right few thousand tokens of context — plus the operational glue that keeps them in step.

## What it is

**The ingestion pipeline (offline).** Connectors pull from sources (Drive, Confluence, Slack, a database, the web) → extract text (the messy part: PDFs, tables, images) → chunk → embed → write to the index alongside metadata: source, permissions, timestamp, document version. Everything about the quality of the final answer is decided here, and it's a data pipeline with all the usual concerns — incremental rather than full reprocessing, idempotent so reruns are safe, dead-lettering documents that fail to parse, and a re-embedding path for when you change the embedding model (which invalidates *every* vector — treat it as a full rebuild-and-swap, not a migration).

**The query pipeline (online), under a latency budget.** Rewrite the query (resolve pronouns from conversation history, expand it) → retrieve candidates → rerank → assemble the prompt → generate. Each stage costs milliseconds you're taking from the user's total wait, and retrieval sits *before* the model's own latency, so it's the part with the least room.

**Hybrid retrieval, because vectors alone underperform.** Semantic search finds meaning but misses exact identifiers — error codes, part numbers, names. Keyword search (BM25) nails those and misses paraphrase. Run both, fuse the result lists (reciprocal rank fusion is the standard), then **rerank** the top ~50 with a cross-encoder to get the top ~5. The reranker is usually the single biggest quality win in the pipeline, and it's cheap relative to generation.

**Permissions are the requirement people forget.** In an enterprise product, a user must never retrieve a chunk from a document they can't open. Post-filtering the results is wrong — it silently returns fewer results and can leak through summaries. Permissions belong *in the index* as filterable metadata, applied at query time, and they have to be kept in sync when access changes upstream. Raising this unprompted is a strong signal.

**Freshness.** How stale can retrieval be — seconds, minutes, a day? That single number decides whether ingestion is event-driven via change data capture or a nightly batch, and it's the same staleness question as any other derived index.

**Context assembly is a budget problem.** You have a token budget; recent conversation, retrieved chunks, system prompt and tool definitions compete for it. Order matters for caching — stable content first so it can be cached, retrieved chunks after. And more context is not monotonically better: irrelevant chunks measurably degrade answers.

**Measure retrieval separately from generation.** Recall and precision at k for retrieval, faithfulness and answer quality for generation. Without that split you can't tell whether a bad answer was a retrieval miss or a generation failure — and the fixes are completely different.

## Why it matters

Almost every company building on models has built one of these, so it's a natural design prompt and a natural deep-dive. The differentiator is talking about the parts that aren't in the tutorial diagram — permissions, freshness, re-embedding, evaluating retrieval on its own — because those are the ones that decide whether the system works in production.

## Key points

- Ingestion is a data pipeline: incremental, idempotent, dead-lettered, with a full rebuild path.
- Changing the embedding model invalidates every vector — plan an index rebuild and alias swap, not a migration.
- Hybrid retrieval plus a cross-encoder reranker beats pure vector search substantially, for little latency.
- Store permissions as filterable metadata and apply them during retrieval, never as a post-filter.
- The freshness requirement decides between CDC-driven and batch ingestion.
- Retrieval latency is spent before generation even starts, so it has the tightest budget in the request.
- Keep stable content early in the prompt so it can be cached; put retrieved chunks after it.
- Evaluate retrieval and generation separately, or you can't tell which one failed.
