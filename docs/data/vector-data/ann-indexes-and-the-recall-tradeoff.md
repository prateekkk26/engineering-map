---
title: ANN Indexes & the Recall Tradeoff
summary: Approximate nearest-neighbour indexes trade correctness for speed, and unlike a B-tree they can silently return the wrong rows.
level: core
minutes: 25
order: 2
tags: [data, vectors, ai, indexes, performance]

related:
  - data/vector-data/vectors-in-postgres-with-pgvector
  - ai/rag-and-retrieval/evaluating-retrieval-quality
  - data/relational-fundamentals/indexes-and-how-they-work

resources:
  - title: pgvector — Indexing
    url: https://github.com/pgvector/pgvector#indexing
    source: pgvector
    type: repo
    minutes: 20
    primary: true
  - title: Efficient and robust approximate nearest neighbor search using HNSW
    url: https://arxiv.org/abs/1603.09320
    source: Malkov & Yashunin
    type: article
    minutes: 45
  - title: Nearest Neighbor Indexes for Similarity Search
    url: https://www.pinecone.io/learn/series/faiss/vector-indexes/
    source: Pinecone
    type: article
    minutes: 25
---

## In one line

An ANN index finds *probably* the nearest vectors by searching only part of the space, and the fraction it gets right is called recall.

## What it is

Exact nearest-neighbour search compares the query to every vector — accurate, and linear in table size. That is genuinely fine up to tens of thousands of rows, and worth remembering before adding an index at all.

**HNSW** builds a multi-layer proximity graph: search starts at a sparse top layer, greedily walks toward the query, and descends. Build parameters `m` (edges per node) and `ef_construction` control graph quality; the query parameter `ef_search` controls how wide the search is, which is the dial you tune per query to trade latency for recall. It gives the best recall-per-latency, uses a lot of memory, and builds slowly.

**IVFFlat** clusters vectors into `lists` and searches only the `probes` nearest clusters. Builds much faster and uses less memory, but recall depends on the clustering — and crucially, **it must be built on data that already exists**, because the cluster centroids come from a sample. Building it on an empty table and inserting afterwards produces terrible recall, which is a classic silent failure.

**The thing that makes this different from every other index you use.** A missing or badly tuned B-tree makes queries slow; a badly tuned ANN index makes them *wrong*. The rows come back fast, they look reasonable, nothing errors — and the answer quality of your RAG system quietly drops because the right chunk was never retrieved. Recall is therefore something to measure explicitly: sample queries, compute exact results by brute force, and check the overlap. That number belongs in your eval suite.

**Filtering is the other trap.** A query that filters by tenant *and* searches by vector can be executed as filter-then-scan or search-then-filter, and if the filter is selective, the ANN index may return ten neighbours that all fail the filter, leaving you with fewer results than requested. pgvector's iterative scans (0.8+) address this, and partial indexes per high-cardinality filter are the other lever. Expect this to come up any time a design has per-tenant vector search.

## Why it matters

Retrieval quality is the main determinant of whether a RAG feature is good, and index configuration is one of the two or three things that decide it — yet the failure is invisible without measurement. Being able to explain HNSW's `ef_search` dial and the filter interaction is a genuinely differentiating answer in an AI-forward loop.

## Key points

- Exact search is linear and completely acceptable for tens of thousands of vectors — check before indexing.
- HNSW is a layered proximity graph with the best recall-per-latency, at high memory and slow build cost.
- IVFFlat clusters and probes a subset; it is cheaper to build but must be created after the data exists.
- `ef_search` (HNSW) and `probes` (IVFFlat) are per-query recall dials — raise them for quality, lower them for latency.
- Unlike a B-tree, a poorly configured ANN index returns wrong results rather than slow ones, with no error.
- Measure recall against brute-force results on a sample of real queries, and keep it in the eval suite.
- Selective metadata filters interact badly with ANN search and can return fewer rows than the limit requests.
