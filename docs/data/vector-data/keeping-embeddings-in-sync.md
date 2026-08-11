---
title: Keeping Embeddings in Sync
summary: An embedding is a derived, versioned copy of your content — and the pipeline that keeps it current is where retrieval quality actually goes wrong.
level: core
minutes: 20
order: 3
tags: [data, vectors, ai, pipelines]

related:
  - data/vector-data/vectors-in-postgres-with-pgvector
  - data/data-pipelines/idempotent-jobs-and-data-quality
  - ai/rag-and-retrieval/chunking-strategies

resources:
  - title: Embeddings
    url: https://docs.claude.com/en/docs/build-with-claude/embeddings
    source: Anthropic
    type: docs
    minutes: 15
    primary: true
  - title: Automatic embeddings with pgvector
    url: https://supabase.com/docs/guides/ai/automatic-embeddings
    source: Supabase
    type: docs
    minutes: 20
  - title: Change Data Capture with Debezium
    url: https://debezium.io/documentation/reference/stable/tutorial.html
    source: Debezium
    type: docs
    minutes: 25
---

## In one line

Every embedding is derived from a specific piece of content with a specific model, and both change — so the vector needs a version, a refresh path, and a way to be told it is stale.

## What it is

Treat the embedding as **derived data with a contract**. Store, alongside the vector: the source row id, a **hash of the exact text embedded**, the **model name and version**, the chunking parameters, and a timestamp. That metadata is what makes every subsequent operation decidable — the content hash tells you whether a row needs re-embedding, and the model name tells you which vectors belong to the current index.

**Triggering re-embeds.** The reliable pattern is the same as any dual write: when content changes, mark the row (or write an outbox/job row) **in the same transaction** as the content update, and let a worker embed asynchronously. Doing the embedding call inline in the request holds a transaction open across a slow API — the failure mode from the transactions topic — and makes writes fail whenever the provider does. CDC on the source table is the same idea without application involvement.

**Model migrations are the interesting case.** Changing embedding model invalidates every vector, and you cannot mix models in one index — distances across models are meaningless. The safe procedure is a new column or table for the new model, backfill in batches while continuing to serve from the old one, verify retrieval quality with your eval set, then switch reads and drop the old vectors. This is expand-migrate-contract again, applied to derived data, and it is worth pointing out that pinning the embedding model version is therefore a real operational commitment.

**Deletions and permissions are the correctness risk.** A deleted or unshared document whose chunks remain in the index will be retrieved and quoted back to a user who should not see it. Deletion must cascade to chunks (a foreign key with `ON DELETE CASCADE` if they live in Postgres), and permission filters must be applied at query time against live data rather than baked into the vector metadata at index time.

Finally, **make the backfill resumable and rate-limit-aware**: batch, checkpoint, retry with backoff, and expect the provider to fail partway through a million-row job.

## Why it matters

Most RAG systems degrade not because retrieval is badly designed but because the index quietly drifts from the source — stale chunks, deleted documents, a half-finished backfill after a model change. Being able to describe the sync pipeline is what separates "I built a demo" from "I ran this in production" in an AI-forward interview.

## Key points

- Store a content hash, model name and chunk parameters with every vector, or you cannot tell what is stale.
- Never call an embedding API inside the transaction that writes the content; enqueue the work instead.
- Marking work in the same transaction as the content change is the outbox pattern applied to embeddings.
- Vectors from different models are not comparable, so a model change is a full re-index, not an incremental update.
- Migrate models with a parallel column, batched backfill, eval-based verification, then a read switch.
- Deleted or newly restricted documents must be removed from the index, or retrieval leaks them into answers.
- Apply permission filters at query time against live data, not against metadata frozen at indexing time.
