---
title: Vector Stores & Indexing
summary: Approximate nearest-neighbour search over millions of vectors, and why "just add pgvector to Postgres" is the right first answer more often than a dedicated database.
level: core
minutes: 20
order: 3
tags: [rag, retrieval, embeddings, data]

related:
  - ai/llm-foundations/embeddings-and-similarity
  - ai/rag-and-retrieval/hybrid-search-and-reranking
  - ai/rag-and-retrieval/rag-in-one-picture

resources:
  - title: pgvector
    url: https://github.com/pgvector/pgvector
    source: Andrew Kane
    type: repo
    minutes: 25
    primary: true
  - title: Efficient and robust approximate nearest neighbor search using HNSW graphs
    url: https://arxiv.org/abs/1603.09320
    source: Malkov & Yashunin
    type: article
    minutes: 40
  - title: Vector indexes
    url: https://www.pinecone.io/learn/series/faiss/vector-indexes/
    source: Pinecone
    type: article
    minutes: 25
  - title: Vector search in Postgres
    url: https://supabase.com/docs/guides/ai/vector-columns
    source: Supabase
    type: docs
    minutes: 15 # unverified
---

## In one line

A vector store keeps embeddings with their text and metadata and answers "find the *k* closest vectors to this one" fast, by trading exactness for speed with an approximate index.

## What it is

Exact nearest-neighbour search compares the query to every vector. At ten thousand chunks that is fine; at ten million it is not. Approximate nearest neighbour (ANN) indexes give up a small amount of recall for orders of magnitude of speed.

**HNSW** — a navigable small-world graph with layers — is the current default: excellent recall-versus-speed, higher memory use, and slower to build. **IVF** partitions vectors into clusters and searches only the nearest few: cheaper memory, faster to build, needs training data and retuning as the corpus grows. Quantisation compresses vectors to cut memory, at some accuracy cost. The knobs — how many neighbours to consider at query time, how many clusters to probe — trade recall against latency, and they need to be measured rather than guessed, because the defaults are rarely right for your recall target.

The choice that actually comes up is where to put it. **Postgres with pgvector** is the correct first answer for most products: you get vectors, metadata, joins, permissions, transactions, and backups in the database you already run, and one query can filter by tenant and date *and* rank by similarity. That combination — filtering and vector search in one transactional store — is exactly what a bolt-on vector database makes awkward. It comfortably serves millions of vectors.

**Dedicated vector databases** earn their place at genuinely large scale, or when you want managed hybrid search, distributed sharding, and metadata filtering tuned for it. **Embedded libraries** are for local or batch use. The failure mode to avoid is the two-store split — documents in Postgres, vectors elsewhere — which means dual writes, consistency bugs, and deletions that only half happen.

The operational parts matter more than the index type. Deletion has to propagate or you leak content that was supposed to be revoked. Re-embedding after a model change is a full-corpus migration, so version the index and build the new one alongside the old. Filtering interacts badly with ANN — filtering after the search can return nothing when the filter is selective, so prefer a store that filters during traversal. And keep the source text with the vector; retrieval that returns only ids and then fans out to fetch text is a latency problem you built for yourself.

## Why it matters

"Where do the embeddings live?" is a standard follow-up in a RAG design round, and answering "Postgres with pgvector unless we have a reason not to" — with the reason being scale or managed hybrid search — reads as pragmatic rather than resume-driven. The operational points, especially deletion and re-embedding migrations, are what distinguish someone who has run one of these from someone who has read about them.

## Key points

- ANN indexes trade a little recall for a lot of speed; exact search is fine only at small scale.
- HNSW is the usual default — best recall/speed, higher memory, slower builds; IVF is cheaper and needs retuning as data grows.
- Recall-versus-latency knobs must be measured against a retrieval eval, not left at defaults.
- Postgres with pgvector is the right starting point for most products: vectors, metadata, permissions, and transactions in one place.
- Combined metadata filtering and similarity ranking in a single query is the main practical advantage of keeping vectors in your primary database.
- Reach for a dedicated vector database at large scale or for managed hybrid search — not by default.
- Avoid splitting documents and vectors across two stores; dual writes cause consistency bugs and half-completed deletions.
- Deletion must propagate to the index, or revoked content stays retrievable.
- Changing the embedding model re-indexes everything — version indexes and build the replacement alongside the old one.
- Store chunk text with the vector so retrieval is one round trip, not two.
