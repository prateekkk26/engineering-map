---
title: Hybrid Search & Reranking
summary: Vector search alone misses exact terms and keyword search alone misses meaning — run both, fuse the results, then rerank the survivors with a model that reads them properly.
level: core
minutes: 20
order: 4
tags: [rag, retrieval, search, quality]

related:
  - ai/rag-and-retrieval/rag-in-one-picture
  - ai/llm-foundations/embeddings-and-similarity
  - ai/rag-and-retrieval/evaluating-retrieval-quality

resources:
  - title: Introducing Contextual Retrieval
    url: https://www.anthropic.com/news/contextual-retrieval
    source: Anthropic
    type: article
    minutes: 25
    primary: true
  - title: Rerankers and Two-Stage Retrieval
    url: https://www.pinecone.io/learn/series/rag/rerankers/
    source: Pinecone
    type: article
    minutes: 25
  - title: Okapi BM25
    url: https://en.wikipedia.org/wiki/Okapi_BM25
    source: Wikipedia
    type: article
    minutes: 15
  - title: Reciprocal Rank Fusion
    url: https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
    source: Cormack et al.
    type: article
    minutes: 20
---

## In one line

Retrieve a generous candidate set from both a keyword index and a vector index, fuse the two rankings, then rerank the top few dozen with a cross-encoder that scores query and document together.

## What it is

The two retrieval methods fail in complementary ways. **Keyword search** (BM25 is the standard) matches exact terms, weights rare ones highly, and is unbeatable on identifiers, error codes, product names, and jargon — while being helpless when the user's words differ from the document's. **Vector search** matches meaning across different vocabulary, and is unreliable on exactly the things BM25 is good at: `error 5041` and `error 5401` are nearly identical vectors.

Running both and combining is not a marginal improvement; on realistic corpora it is one of the largest single gains available. **Reciprocal rank fusion** is the standard way to combine them, and its appeal is that it uses only the ranks, not the scores — so you never have to normalise a BM25 score against a cosine similarity, which is the part people get wrong when they try to weight the two directly.

**Reranking** is the second stage and it is qualitatively different from retrieval. The vector search compared two embeddings computed independently — the query never "saw" the document. A cross-encoder reranker takes query and document *together* and produces a relevance score, which is far more accurate and far too slow to run over a whole corpus. So: retrieve maybe 50–100 candidates cheaply, rerank them properly, keep the top 5–10. That two-stage shape is standard, and the cost is one extra call of tens of milliseconds.

Why it matters so much: precision at the top is what the model actually consumes. Passing ten chunks where two are relevant is worse than passing three that are all relevant — the irrelevant material dilutes attention and invites the model to answer from the wrong source. Reranking is how you cut *k* without losing recall.

Two supporting techniques. **Query rewriting** turns a conversational follow-up into a standalone query and, in its expansion form, generates several phrasings to retrieve against — cheap and effective. **Metadata filtering** narrows by tenant, date, or type before ranking, and it is a correctness requirement rather than an optimisation when access control is involved.

None of this should be chosen by reputation. Fusion weights, candidate count, rerank depth, and final *k* are parameters, and the only honest way to set them is against a retrieval eval set.

## Why it matters

"Our search returns irrelevant results" is one of the most common real problems in AI products, and hybrid plus rerank is the answer that fixes it most of the time. In interviews, proposing pure vector search is the giveaway that someone has built a tutorial RAG rather than a production one — the identifier-lookup failure is immediate and obvious to anyone who has run one against real user queries.

## Key points

- BM25 and vector search fail in opposite directions: exact terms versus paraphrase. Running both covers each other's blind spot.
- Fuse with reciprocal rank fusion — it uses ranks only, so you avoid trying to normalise incomparable scores.
- Reranking with a cross-encoder scores query and document together, which is much more accurate than comparing independent embeddings.
- The standard shape is two-stage: retrieve 50–100 candidates cheaply, rerank, keep 5–10.
- Precision at the top matters more than recall depth, because irrelevant chunks dilute the model's attention.
- Rerankers let you pass fewer chunks to the model, which improves both answer quality and cost.
- Rewrite conversational follow-ups into standalone queries before retrieving; raw follow-ups retrieve badly.
- Filter by metadata before ranking — for tenant and permission scoping this is correctness, not tuning.
- Every parameter here — fusion weights, candidate count, final *k* — needs an eval set to set honestly.
