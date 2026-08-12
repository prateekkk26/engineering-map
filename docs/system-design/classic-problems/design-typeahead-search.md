---
title: Design Typeahead Search
summary: Suggestions in under 100ms on every keystroke — prefix indexes, aggressive caching, and building the ranked term set offline.
level: core
minutes: 25
order: 7
tags: [system-design, classic-problem, search]

related:
  - system-design/frontend-system-design/design-an-autocomplete
  - system-design/building-blocks/search-engines
  - cs-fundamentals/data-structures/tries-and-prefix-search

resources:
  - title: Building a Fast Autocomplete
    url: https://www.elastic.co/blog/you-complete-me
    source: Elastic
    type: article
    minutes: 25
    primary: true
  - title: The Life of a Typeahead Query
    url: https://engineering.fb.com/2010/05/17/web/the-life-of-a-typeahead-query/
    source: Meta Engineering
    type: article
    minutes: 20
  - title: Suggesters
    url: https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html
    source: Elastic
    type: docs
    minutes: 20
---

## In one line

Every keystroke is a query, so the read path must be a cache hit or a prefix lookup — and the ranking work happens offline, not per request.

## What it is

**Scope.** Given a prefix, return the top 5–10 completions ranked by popularity, personalised or not, under ~100ms including the network. Ask whether suggestions are query terms (search box) or entities (users, products) — the answer changes the data source but not the shape.

**Estimate the thing that makes this hard.** If a search is 20 characters and the client queries per keystroke, that's up to 20 requests per search — an order of magnitude more traffic than the search itself. **Client-side debouncing (~150ms) and only querying from 2–3 characters removes most of it**, and saying that first is the right move: the cheapest request is the one never sent. The client should also cache locally and cancel in-flight requests when the user types again.

**The read path.** Prefix → ranked list, precomputed. Options: a **trie** with the top-N results stored at each node, so a lookup is a walk plus a read with no ranking at query time; an **inverted index with edge n-grams** or a completion suggester (Elasticsearch's, which is an FST in memory); or, at small scale, a Postgres index on a prefix expression. Then cache: prefix popularity is extremely skewed, so a Redis cache keyed on prefix serves the large majority of traffic, and short prefixes especially should essentially always be cache hits.

**The write path is offline and this is the key insight.** You do not update the suggestion index on every search. Log queries → aggregate in batch or streaming over a rolling window (say 7 days, time-decayed so trends surface) → filter (minimum frequency, remove profanity, remove PII, drop queries with no results) → build a new ranked prefix structure → publish atomically. Update every few minutes to hourly. Suggestions being minutes stale is fine, and that relaxation is what makes the read path fast.

**Ranking** is frequency plus recency, then optionally personalisation (your history, your location, your language) and business rules. Personalisation is best applied as a light merge at read time over a small candidate set — a per-user list blended with the global one — rather than a per-user index.

**Typo tolerance** costs a lot at this latency budget. The pragmatic version is limited edit-distance matching on short prefixes only, or a curated correction dictionary from query logs (people who typed X then immediately typed Y).

**Sharding.** Partition the prefix space by first characters, or replicate the whole structure — it's usually small enough (tens of millions of terms) to fit in memory per node, and replication beats sharding for a read-only, latency-critical structure.

## Why it matters

It's asked in both a backend and a frontend flavour in these loops, so it's double value. The signal is recognising that the per-keystroke request rate is the actual problem and that most of the fix is on the client, then that the ranking must be precomputed — candidates who try to rank at query time end up designing something that can't hit the latency budget.

## Key points

- Per-keystroke traffic is the defining constraint; debounce, set a minimum prefix length, and cache on the client.
- Cancel in-flight requests on new input so responses can't arrive out of order.
- The read path must be a precomputed lookup — a trie with top-N per node, an FST, or edge n-grams.
- Prefix popularity is heavily skewed, so a prefix-keyed cache absorbs most queries.
- Build the ranked suggestion set offline from query logs and publish it atomically.
- Suggestions can be minutes stale, and that relaxation is what buys the latency.
- Rank on time-decayed frequency; blend personalisation over a small candidate set at read time.
- Filter the corpus for profanity, PII and zero-result queries before publishing.
- Replicate the structure rather than sharding it — it usually fits in memory.
