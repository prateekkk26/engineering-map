---
title: Design a URL Shortener
summary: The warm-up problem — ID generation, the read-heavy path, and why the interesting parts are analytics and custom aliases rather than the redirect.
level: core
minutes: 20
order: 1
tags: [system-design, classic-problem]

related:
  - system-design/distributed-systems/clocks-and-ordering
  - system-design/scalability/scaling-reads
  - data/schema-design-and-migrations/primary-keys-and-identifiers

resources:
  - title: Design a URL Shortener
    url: https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md
    source: System Design Primer
    type: repo
    minutes: 25
  - title: Announcing Snowflake
    url: https://blog.x.com/engineering/en_us/a/2010/announcing-snowflake
    source: Twitter Engineering
    type: article
    minutes: 10 # unverified
    primary: true
  - title: Base62 and Short URL Encoding
    url: https://en.wikipedia.org/wiki/Base62
    source: Wikipedia
    type: article
    minutes: 5
---

## In one line

Generate a short unique key, store the mapping, and serve a redirect — the design work is in ID generation, cache strategy, and everything that isn't the redirect.

## What it is

**Scope.** Create a short link from a long URL; redirect on access; optional custom alias; optional expiry; click analytics. Out of scope unless asked: user accounts, link editing, abuse scanning.

**Estimate.** Say 100M new links/year (~3/second — writes are trivial) and a 100:1 read ratio, so ~300 reads/second average, low thousands at peak. Storage: ~500 bytes/link × 100M = 50GB/year. **The conclusion that shapes everything: this is a small, extremely read-heavy key-value workload. One Postgres instance plus a cache is genuinely sufficient**, and saying so is the correct senior move.

**Key generation — the actual question.**

*Counter + Base62.* A monotonic counter encoded in `[0-9a-zA-Z]`; 62^7 ≈ 3.5 trillion, so 7 characters is plenty. Shortest keys, no collisions, and the counter must not be a single point of failure — hand out ranges (each instance takes a block of 10,000) so it isn't hit per request. Downside: keys are sequential and enumerable, so anyone can crawl every link.

*Random.* Generate 7 random Base62 characters, insert with a unique constraint, retry on conflict. Unguessable and stateless. At 100M rows out of 3.5 trillion, collisions are vanishingly rare and one retry handles them.

*Hash the URL.* Take the first N characters of a hash. Gives free deduplication of identical URLs, needs collision handling anyway, and leaks nothing useful.

**Say which and why.** Random Base62 with a unique constraint is the best default for a public service — enumerable keys are a genuine privacy problem when people shorten links to private documents.

**The read path.** Redirect is one key lookup. Cache aggressively — link popularity is heavily skewed, so a small cache absorbs most traffic — and put a CDN or edge function in front if latency matters. Use **301** for permanent (cached by browsers, so you lose analytics) or **302** for temporary (every click reaches you, so analytics work). That trade is a favourite follow-up.

**Analytics.** Don't write a row per click synchronously — that turns a 300/s read path into a 300/s write path on the same database. Emit an event to a queue or log, aggregate asynchronously, and serve counts from a rollup table.

**Custom aliases** need a uniqueness check against the same keyspace, plus a reserved-words list, and they're the reason the key column needs a unique index regardless of scheme.

## Why it matters

It's the standard warm-up, and it's used to see whether you scope and estimate before designing. The trap is over-engineering: candidates reach for sharding and distributed ID services on a 50GB dataset. The signal is estimating first, concluding that it's small, choosing a key scheme with a stated reason, and spending the remaining time on the parts that are actually interesting — analytics volume, cache strategy, and abuse.

## Key points

- Estimate first: this is a tiny, read-heavy workload that one database and a cache can serve.
- Base62 over 7 characters gives 3.5 trillion keys — length is never the constraint.
- Counter-based keys are shortest but enumerable; random keys with a unique constraint are the safer default.
- If you use a counter, hand out ranges per instance so it isn't a per-request bottleneck.
- Link popularity is skewed, so a small cache absorbs the large majority of redirects.
- 301 is cacheable and loses analytics; 302 keeps every click on your servers.
- Write click events to a queue and aggregate asynchronously — never a synchronous row per click.
- Custom aliases share the keyspace and need a reserved-word list.
