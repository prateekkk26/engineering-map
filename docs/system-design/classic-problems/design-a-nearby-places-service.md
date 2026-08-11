---
title: Design a Nearby Places Service
summary: Geospatial indexing — turning two-dimensional proximity into a one-dimensional key so "what's within 5km" becomes a range scan.
level: deep
minutes: 20
order: 10
tags: [system-design, classic-problem, geo]

related:
  - system-design/scalability/sharding-and-partitioning
  - system-design/building-blocks/picking-the-datastore-in-a-design
  - system-design/scalability/hot-keys-and-load-imbalance

resources:
  - title: S2 Geometry
    url: https://s2geometry.io/
    source: Google
    type: docs
    minutes: 30
  - title: Geohash
    url: https://en.wikipedia.org/wiki/Geohash
    source: Wikipedia
    type: article
    minutes: 15
    primary: true
  - title: PostGIS — Spatial Indexing
    url: https://postgis.net/workshops/postgis-intro/indexing.html
    source: PostGIS
    type: docs
    minutes: 25
---

## In one line

Databases index one dimension well and two dimensions badly, so geospatial systems encode a location into a single sortable key where nearby points share a prefix.

## What it is

**Scope.** Find entities within a radius of a point, ranked by distance, possibly filtered (open now, cuisine, rating). Two very different variants — mostly-static places, or moving drivers updating position every few seconds — and asking which one you're designing is the first move, because the second is a write-heavy problem and the first isn't.

**Why the naive query fails.** `WHERE lat BETWEEN ... AND lng BETWEEN ...` can only use an index on one column efficiently; the other becomes a filter over a large candidate set. It works fine on 10,000 rows and falls apart on 10 million.

**Geohash.** Recursively divide the world into a grid, interleaving latitude and longitude bits into a Base32 string. Nearby locations mostly share a prefix, so "within ~5km" becomes a prefix range scan on a normal B-tree index — the key trick, and the one to explain. Two caveats worth raising yourself: points either side of a grid boundary can be physically adjacent with completely different hashes, so you query the target cell **plus its eight neighbours**; and the grid is uneven because cells shrink toward the poles.

**S2 and H3.** S2 maps the sphere onto cube faces and uses a Hilbert curve, giving better locality and more uniform cells. H3 uses hexagons, so every neighbour is equidistant — nice for aggregation and demand modelling. Both are what a serious system uses; naming one and knowing why it's better than geohash (locality, uniformity) is enough depth for these loops.

**Or just use PostGIS.** A GiST index on a `geography` column with `ST_DWithin` handles this properly, with correct distance maths on a sphere and no manual cell juggling. For anything under a few million static rows this is the right answer, and reaching for a custom geohash scheme first is over-engineering.

**Moving objects change the design.** Drivers pushing location every 5 seconds is a high-rate write workload where the current position is all that matters and history mostly doesn't. Keep live positions in Redis — a geospatial set per region, which is itself geohash-backed — and persist a sampled trail asynchronously if you need history. Writes go to memory, queries are `GEOSEARCH`, and the durable store is out of the hot path.

**Sharding by geography is natural and skewed.** Cells partition cleanly, but Manhattan has vastly more activity than rural Nebraska — so shard by cell, then split hot cells further, which is the hot-key problem in geographic clothing.

**Ranking.** Geo gives you the candidate set; ranking by distance plus rating, availability and business rules happens over that small set. Filter geographically first, then rank — never the reverse.

## Why it matters

It's the one classic problem with a genuinely distinct algorithmic core, and the insight — collapse two dimensions to one so ordinary indexes work — is a transferable idea. It's `deep` here rather than `core` because it's asked less often than feeds or chat in frontend-leaning loops, but it's a common enough prompt at marketplace and logistics companies to be worth an hour.

## Key points

- Two-dimensional range queries can't use a normal index efficiently; encoding to one dimension fixes that.
- Geohash interleaves lat/lng bits so nearby points share a prefix and proximity becomes a range scan.
- Always query the target cell plus its eight neighbours — boundaries split physically adjacent points.
- S2 (Hilbert curve) and H3 (hexagons) give better locality and more uniform neighbours than geohash.
- PostGIS with a GiST index and `ST_DWithin` is the correct default below a few million static rows.
- Moving objects are a write-heavy problem: keep live positions in Redis geo sets, persist trails asynchronously.
- Geographic sharding is natural but heavily skewed — split hot cells further.
- Use geo to generate candidates, then rank on business criteria over that small set.
