---
title: Caching Strategies for LLM Apps
summary: Four distinct caches — prompt prefix, exact response, semantic, and embedding — each solving a different problem, and each with its own way of going wrong.
level: core
minutes: 20
order: 4
tags: [caching, cost, performance, architecture]

related:
  - ai/working-with-the-api/prompt-caching
  - _shared/caching
  - ai/observability-and-cost/unit-economics-of-an-llm-feature

resources:
  - title: Prompt caching
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
    source: Anthropic
    type: docs
    minutes: 25
    primary: true
  - title: GPTCache
    url: https://github.com/zilliztech/GPTCache
    source: Zilliz
    type: repo
    minutes: 20
  - title: Caching
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
    source: MDN
    type: docs
    minutes: 20
---

## In one line

Cache the prompt prefix at the provider, identical requests in your own store, near-identical requests by embedding similarity, and embeddings themselves — different layers, different hit rates, different failure modes.

## What it is

**Prompt caching** reuses the provider's processed prefix. It is the one with the broadest applicability because it works even when every request is unique, as long as the *beginning* is shared — a system prompt, tool definitions, a reference document, a conversation transcript. Reads cost about a tenth of normal input and time-to-first-token drops. The failure mode is silent: one byte of drift in the prefix and it stops working with no error, so you verify with the cache-read token count rather than assuming.

**Exact-match response caching** is ordinary caching in your own store, keyed on a hash of the full request — prompt, model, parameters, and retrieved context. Hit rates are low for open-ended chat and surprisingly high for the things people forget are LLM calls: classifying the same document twice, summarising an unchanged page, re-running a fixed enrichment. Cheap to add, and the key must include everything that affects the output or you will serve an answer generated under different conditions.

**Semantic caching** matches near-identical requests by embedding the query and finding a previous one above a similarity threshold. It is the highest-value and highest-risk layer. "What's your refund policy?" and "how do I get my money back?" should share an answer. But similarity is not equivalence, and a threshold set too loosely returns confidently wrong answers to questions that merely resembled an earlier one — with the added hazard of leaking one tenant's answer to another if the cache is not partitioned. Scope by tenant and user, set the threshold conservatively, exclude anything personalised or time-sensitive, and log hits so you can audit what it served.

**Embedding caching** is the boring one that always pays: embeddings are deterministic for a given model and input, so never compute one twice. Cache them for documents at index time and for repeated queries.

Across all four, the shared discipline is invalidation and observability. Any cached answer derived from a document must be invalidated when that document changes, or your product cites deleted content. Every cache needs a TTL chosen from how fast the underlying truth moves. And each needs its hit rate reported separately — a semantic cache with a 2% hit rate is complexity with no payoff, and you cannot tell without measuring.

## Why it matters

Caching is the main lever on both cost and latency, and "how would you make this cheaper and faster?" is a routine question. Distinguishing the four layers is what makes the answer specific rather than a general appeal to caching. The semantic cache in particular is a good judgement test: enthusiastic candidates propose it immediately, and the strong answer names the correctness and tenancy risks alongside the saving.

## Key points

- Four layers: provider prompt-prefix cache, exact-match response cache, semantic cache, embedding cache.
- Prompt caching works even when every request is unique, provided the prefix is stable — verify with cache-read token counts.
- Exact-match caching must key on everything affecting output: prompt, model, parameters, and retrieved context.
- Semantic caching gives the biggest hit-rate lift and carries real correctness risk, since similar is not equivalent.
- Partition semantic and response caches by tenant and user, or you will serve one customer's answer to another.
- Exclude personalised, time-sensitive, and stateful requests from semantic caching entirely.
- Embeddings are deterministic per model and input — always cache them, at index time and for repeated queries.
- Invalidate any cached answer when its source document changes, or you serve content that was deleted.
- Report hit rate per layer; an unmeasured cache is complexity you cannot justify.
- Log semantic-cache hits with the matched original so you can audit what was served and why.
