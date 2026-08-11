---
title: Search Engines
summary: Inverted indexes as a separate system — when Postgres full-text stops being enough, and the sync problem you inherit the moment you add one.
level: core
minutes: 20
order: 7
tags: [search, data, indexing]

related:
  - data/choosing-a-datastore/full-text-search-engines
  - system-design/classic-problems/design-typeahead-search
  - system-design/ai-system-design/rag-at-scale

resources:
  - title: Elasticsearch — Basic Concepts
    url: https://www.elastic.co/guide/en/elasticsearch/reference/current/documents-indices.html
    source: Elastic
    type: docs
    minutes: 20
  - title: How to Build a Search Engine — the Inverted Index
    url: https://www.elastic.co/blog/found-elasticsearch-from-the-bottom-up
    source: Elastic
    type: article
    minutes: 30
    primary: true
  - title: Full Text Search
    url: https://www.postgresql.org/docs/current/textsearch.html
    source: PostgreSQL
    type: docs
    minutes: 25
---

## In one line

A search engine inverts the index — term to documents instead of document to terms — and adds ranking, which is the part a database won't give you.

## What it is

**The inverted index.** For every term, a posting list of the documents containing it, with positions and frequencies. A query intersects posting lists and scores the results by relevance (BM25 or similar: rarer terms count more, term frequency helps, long documents are penalised). The analysis chain in front of it — tokenisation, lowercasing, stemming, stop words, synonyms, language-specific rules — determines what actually matches, and it must be identical at index time and query time or queries silently miss.

**Start with Postgres.** `tsvector` with a GIN index handles full-text search on a few million rows perfectly well, and it keeps your search transactionally consistent with your data. Saying this first is the senior move; reaching for Elasticsearch by reflex is not.

**Reach for a dedicated engine when** you need relevance tuning and boosting, faceted aggregations over large result sets, typo tolerance and fuzzy matching, multi-language analysis, or per-query latency across tens of millions of documents. Those are real needs, and Postgres does them poorly or not at all.

**The cost you take on is synchronisation.** The index is a second copy of your data, and it will drift. The options, in ascending order of robustness: dual-write from the application (simplest, and wrong the first time a write partially fails), a periodic reindex job (safe, stale, expensive at volume), or change data capture from the database's replication log into the indexer (correct, more moving parts). Whatever you choose, you also need a full reindex path, because mappings change and you will need to rebuild — usually by indexing into a new index and atomically swapping an alias.

**Near-real-time, not real-time.** Documents become searchable after a refresh interval, typically around a second. Any design that requires a write to be searchable immediately in the same request needs to read that record from the primary database instead.

**Sharding and replicas** work the usual way: shard count is fixed at index creation, queries fan out to all shards and merge, so over-sharding a small index costs latency rather than saving it.

## Why it matters

Search appears inside many design problems — a marketplace, a feed, a docs site, log search — and the interesting question is never "how does an inverted index work" but "how does the index stay in sync with the database, and what do users see when it doesn't." It's also the direct precursor to retrieval in AI systems: hybrid search in RAG is a BM25 engine and a vector index answering the same query.

## Key points

- Inverted index plus relevance scoring is what a search engine adds over a database `LIKE`.
- Analysis must match at index and query time, or matches silently disappear.
- Postgres full-text with a GIN index is the correct default at small-to-mid scale and stays consistent with your data.
- Add a dedicated engine for relevance tuning, facets, fuzziness, or many millions of documents.
- The real cost of a search engine is keeping it in sync — CDC beats dual writes, which break on partial failure.
- Always have a full reindex path: build into a new index and swap an alias atomically.
- Search is near-real-time; read-your-own-write must be served from the primary database.
- Hybrid retrieval in RAG is this system plus a vector index over the same corpus.
