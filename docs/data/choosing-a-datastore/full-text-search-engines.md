---
title: Full-Text Search Engines
summary: How an inverted index answers a text query, and the honest threshold for moving off Postgres to Elasticsearch.
level: core
minutes: 20
order: 3
tags: [data, search]

related:
  - data/postgres-in-depth/postgres-index-types
  - data/vector-data/vectors-in-postgres-with-pgvector
  - ai/rag-and-retrieval/hybrid-search-and-reranking

resources:
  - title: Full Text Search
    url: https://www.postgresql.org/docs/current/textsearch.html
    source: PostgreSQL
    type: docs
    minutes: 30
    primary: true
  - title: Elasticsearch — What is an inverted index?
    url: https://www.elastic.co/docs/manage-data/data-store/index-basics
    source: Elastic
    type: docs
    minutes: 20
  - title: BM25 — the Okapi ranking function
    url: https://en.wikipedia.org/wiki/Okapi_BM25
    source: Wikipedia
    type: article
    minutes: 15
---

## In one line

A search engine tokenises text into an inverted index — term to the documents containing it — and ranks matches by a relevance formula rather than returning them in table order.

## What it is

The pipeline is **analysis** then **indexing** then **ranking**. Analysis lowercases, splits into tokens, strips stop words, and reduces words to stems or lemmas so "running" matches "run" — this is language-specific, which is why the analyzer configuration matters more than anything else for non-English content. The **inverted index** maps each term to a posting list of documents. **Ranking** scores matches, classically with BM25: rarer terms count for more, more occurrences count for more with diminishing returns, and longer documents are penalised.

**Postgres does this natively.** `to_tsvector`/`to_tsquery` with a GIN index gives you stemming, prefix matching, phrase search, weighted fields (title over body) and `ts_rank`. Add `pg_trgm` for typo tolerance and substring matching. For a few million rows and a straightforward search box, this is entirely sufficient — and it has the enormous advantage of joining directly against your live data, with no synchronisation, no second consistency model, and no extra service.

**When a dedicated engine earns its place**: faceted search with counts across many dimensions, complex relevance tuning with boosting and per-field analyzers, typo tolerance and autocomplete as first-class features, very large corpora, aggregations over search results, or a search product that is the product. Elasticsearch/OpenSearch, Typesense and Meilisearch differ mostly in operational weight and how much tuning they expose.

The cost of that move is **synchronisation**, and it is the part people underestimate. The index is now a second copy of the data that must be kept current — usually via change data capture or a job queue — with a reindex path, a backfill, and a period where search results are stale or wrong. Search is also a lying oracle when the pipeline breaks: results simply go missing, and nothing errors.

Current practice increasingly puts **keyword and vector search side by side**, since exact terms and semantic similarity fail in different places — the retrieval-side detail lives in the AI section.

## Why it matters

"Add search" is a common feature prompt in practical and design rounds, and the expected answer starts with "does Postgres full-text cover this?" and states the threshold for moving. The synchronisation cost is the senior insight — a second store means a second truth that can drift.

## Key points

- An inverted index maps terms to documents, which is why search is fast and why analysis choices decide what matches.
- Stemming and stop-word handling are language-specific; the wrong analyzer silently ruins recall.
- BM25 ranks by term rarity, frequency with saturation, and document length — relevance is a formula, not an ordering.
- Postgres full-text with GIN plus `pg_trgm` covers most product search up to a few million documents.
- Moving to a search engine buys facets, tuning and typo tolerance, and costs you a synchronisation pipeline.
- A search index is a derived copy: you need CDC or a job queue, a reindex procedure, and drift monitoring.
- Keyword and vector search are complementary, failing on different queries — production systems increasingly run both.
