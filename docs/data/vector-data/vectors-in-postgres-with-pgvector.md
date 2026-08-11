---
title: Vectors in Postgres with pgvector
summary: Storing embeddings as a column next to the rows they describe, and why that beats a separate vector database for most products.
level: core
minutes: 25
order: 1
tags: [data, vectors, ai, postgres]

related:
  - data/vector-data/ann-indexes-and-the-recall-tradeoff
  - ai/rag-and-retrieval/vector-stores-and-indexing
  - data/postgres-in-depth/postgres-index-types

resources:
  - title: pgvector
    url: https://github.com/pgvector/pgvector
    source: pgvector
    type: repo
    minutes: 25
    primary: true
  - title: What is pgvector, and How Can It Help You?
    url: https://www.enterprisedb.com/blog/what-is-pgvector
    source: EDB
    type: article
    minutes: 15
  - title: AI & Vectors
    url: https://supabase.com/docs/guides/ai
    source: Supabase
    type: docs
    minutes: 20
---

## In one line

`pgvector` adds a `vector` column type and distance operators to Postgres, so an embedding is just another column on the row it belongs to.

## What it is

You declare `embedding vector(1536)` — the dimension must match your model and is fixed per column — and query with a distance operator: `<=>` for cosine, `<->` for L2, `<#>` for negative inner product. `ORDER BY embedding <=> $1 LIMIT 10` is a nearest-neighbour search. **Use the operator that matches how the model was trained**; most text embedding models are normalised and want cosine, and mixing metrics silently returns plausible-looking but wrong neighbours.

**The reason to prefer this over a dedicated vector database** is not performance, it's that the vector lives with the data. You can filter by tenant, permission, date and status in the same `WHERE` clause; you get transactions, so the row and its embedding are written atomically; you get one backup, one migration path, one set of credentials, and no synchronisation job. A separate vector store means a second copy of your corpus that can drift, and metadata filtering that is weaker than SQL.

**Where a dedicated store genuinely wins**: hundreds of millions of vectors, very high query concurrency, or a need for features Postgres lacks (multi-vector, built-in reranking, tiered storage). Below roughly ten million vectors with normal traffic, Postgres is generally fine — and that covers most product RAG.

**Practical points.** Store dimensions honestly: 1536 floats is 6KB per row, so a million rows is 6GB before indexes; `halfvec` halves that at negligible quality cost, and dimension-reduction (Matryoshka-style, supported by several current embedding models) cuts it further. Keep the source text, the model name and the chunk metadata alongside the vector — you will change models, and without the model name you cannot tell which vectors are stale. Large vector values are TOASTed, so an index-only path matters more than usual.

Watch out for **large embeddings pushing your table out of memory**: a hot table that used to fit in cache stops fitting once every row carries 6KB of floats, which degrades the *non-vector* queries too. Putting embeddings in their own table joined by id is often the better shape.

## Why it matters

Every AI-forward product stores embeddings somewhere, and "why not just use Postgres?" is a live architecture question in those interviews — the credible answer names the filtering and consistency advantages, and the scale at which they stop mattering. It is also the practical choice you'll make in a take-home that builds retrieval.

## Key points

- `pgvector` makes an embedding a column, so vectors join and filter with your relational data in one query.
- The distance operator must match the model's training metric — cosine for most normalised text embedders.
- Colocating vectors with rows gives transactional writes and SQL-strength metadata filtering, which separate stores lack.
- A dedicated vector database earns its place past roughly ten million vectors or with unusual feature needs.
- 1536-dimension float vectors cost about 6KB per row; `halfvec` and reduced dimensions cut that materially.
- Store the model name with the vector, or you cannot tell which embeddings are stale after a model change.
- Consider a separate embeddings table so large vectors don't evict your hot rows from cache.
