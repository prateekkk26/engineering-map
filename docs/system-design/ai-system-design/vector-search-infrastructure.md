---
title: Vector Search Infrastructure
summary: Running an ANN index in production — memory as the real constraint, the recall/latency dial, filtered search, and staying in sync with the source of truth.
level: core
minutes: 25
order: 5
tags: [ai, vectors, infrastructure]

related:
  - data/vector-data/ann-indexes-and-the-recall-tradeoff
  - data/vector-data/vectors-in-postgres-with-pgvector
  - system-design/ai-system-design/rag-at-scale

resources:
  - title: pgvector
    url: https://github.com/pgvector/pgvector
    source: pgvector
    type: repo
    minutes: 25
    primary: true
  - title: Efficient and Robust Approximate Nearest Neighbor Search Using HNSW
    url: https://arxiv.org/abs/1603.09320
    source: Malkov & Yashunin
    type: article
    minutes: 45
  - title: Approximate Nearest Neighbor Benchmarks
    url: https://ann-benchmarks.com/
    source: ann-benchmarks
    type: article
    minutes: 20
---

## In one line

Exact nearest-neighbour search is a full scan, so production systems use approximate indexes — and the entire operational story is memory, recall tuning, and keeping the index in step with the data.

## What it is

**Do the arithmetic first, because it usually ends the debate.** A 1536-dimension float32 vector is 6KB. Ten million of them is ~60GB of raw vectors, and an HNSW graph adds substantial overhead on top. One million is ~6GB — comfortably inside a Postgres instance with pgvector, which is the right answer far more often than the design-round default of "a vector database". The threshold that forces a dedicated system is tens of millions of vectors, or query volume that a single instance can't serve.

**Index types.** *HNSW* — a navigable small-world graph; excellent recall/latency, memory-hungry, slow to build, supports incremental inserts. *IVF* — cluster the space, search the nearest cells; cheaper memory, needs training on a representative sample, degrades as data drifts from the trained clusters. HNSW is the default choice. **Quantization** (scalar or product) shrinks vectors several-fold at some recall cost, and is the standard lever when memory is the binding constraint.

**Recall is a dial, and it's the thing to say out loud.** These indexes are *approximate*: `ef_search`, `nprobe` and their equivalents trade recall for latency at query time, and `m` / `ef_construction` trade index size and build time for achievable recall. You choose a point on that curve deliberately — and you can only choose it if you measure recall against an exact brute-force baseline on a sample. "We'd tune ef_search after measuring recall@10" is a much stronger sentence than naming an index type.

**Filtered search is the hard part in real products.** Every real query is "similar to this *and* owned by this tenant *and* not deleted". Pre-filtering then searching can blow past the index; post-filtering can return nothing after the filter is applied. Systems solve it with filter-aware traversal or by partitioning the index per tenant. **Per-tenant partitioning is usually the right call in a multi-tenant product** — it makes permission enforcement structural rather than a query parameter, and it caps blast radius.

**Keeping in sync.** Same problem as any secondary index. Delete a document and its vectors must go; edit it and they must be recomputed. Most ANN indexes handle deletes as tombstones and need periodic compaction. And when the embedding model changes, everything is invalid — build a new index and swap an alias atomically, never migrate in place.

**Hybrid ranking.** Keep the keyword index alongside the vector index (or use one system that does both) and fuse results — see `rag-at-scale`. A vector-only design is a weaker answer than a hybrid one.

## Why it matters

It's the concrete follow-up to any retrieval design — "where do the vectors live, and what happens when there are fifty million?" — and it's the place where over-engineering is most common. Knowing the memory arithmetic well enough to say "this fits in Postgres" is worth more in the round than being able to name five vector databases.

## Key points

- A 1536-dim float32 vector is ~6KB; do the multiplication before choosing a system.
- Postgres with pgvector covers a few million vectors comfortably — reach further only against a number.
- HNSW is the default index; IVF trades memory for a training step and drift sensitivity.
- Quantization is the standard lever when memory binds, at a measurable recall cost.
- Recall is a tunable dial — measure it against exact search on a sample before choosing a setting.
- Filtered search is the real-world hard case; per-tenant partitioning makes permissions structural.
- Deletes are tombstones and need compaction; edits require recomputing vectors.
- Changing the embedding model invalidates the whole index — rebuild and swap an alias.
