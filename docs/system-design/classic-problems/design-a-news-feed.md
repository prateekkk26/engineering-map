---
title: Design a News Feed
summary: The fan-out problem — write-time versus read-time assembly, why the answer is hybrid, and how ranking changes the design.
level: core
minutes: 25
order: 3
tags: [system-design, classic-problem, feeds]

related:
  - system-design/scalability/hot-keys-and-load-imbalance
  - system-design/frontend-system-design/design-an-infinite-feed
  - data/scaling-data/denormalisation-and-materialised-views

resources:
  - title: Facebook News Feed — Serving Billions of Personalized Stories
    url: https://engineering.fb.com/2021/01/26/ml-applications/news-feed-ranking/
    source: Meta Engineering
    type: article
    minutes: 25
  - title: Timelines at Scale
    url: https://www.infoq.com/presentations/Twitter-Timeline-Scalability/
    source: Raffi Krikorian / InfoQ
    type: video
    minutes: 45
    primary: true
  - title: Designing Data-Intensive Applications — Chapter 1, Describing Load
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
---

## In one line

Either write each post into every follower's inbox as it's created, or gather posts from everyone you follow at read time — and at scale you do both, split by follower count.

## What it is

**Scope.** Post; follow; see a feed of posts from people you follow, newest-first or ranked; paginate. Park DMs, search, ads and notifications.

**Estimate, because this is where the design is decided.** 10M DAU, each reading the feed 10× a day = 100M reads/day ≈ 1,200/s average, several thousand at peak. Writes maybe 1M posts/day ≈ 12/s. **A 100:1 read-heavy system** — which is the argument for doing work at write time.

**Fan-out on write (push).** When a post is created, insert its ID into a per-follower feed list (Redis list or a `feed_items` table). Reads are then one lookup of a precomputed list — fast and cheap, which is what you want at 1,200 reads/s. The cost: a post by someone with 40M followers is 40M writes. That's the celebrity problem, and it's the whole reason this question is asked.

**Fan-out on read (pull).** At read time, fetch recent posts from everyone the user follows and merge. Writes are trivial; reads are expensive and get worse the more people you follow. Fine for users with few followees, terrible as a general answer at this read ratio.

**The hybrid, which is the expected answer.** Push for normal accounts; for accounts above a follower threshold, skip fan-out entirely and pull their recent posts at read time, merging them into the precomputed list. Most of the feed comes from the cheap precomputed path, and the handful of celebrity accounts are merged in on demand. Say the threshold is tunable and derived from measurement.

**Details that earn credit.** Store post IDs in the feed, not post bodies — hydrate from a post store or cache, so an edited or deleted post doesn't need rewriting across millions of inboxes. Cap the materialised feed (a few hundred entries) and fall back to pull for deeper pagination. Only fan out for active users; don't maintain inboxes for accounts that haven't logged in for months, and rebuild lazily on their return. Use **cursor-based pagination** on `(score, post_id)`, never `OFFSET` — offsets are slow and skip or duplicate items when the feed shifts under the user.

**Ranking changes things.** A chronological feed can be merged trivially. A ranked feed needs features (recency, affinity, engagement) and a scoring pass over a candidate set at read time, which means the precomputed list becomes a *candidate generator* rather than the answer. Fan-out still earns its place; the ranking layer sits on top with a tight latency budget.

**Fan-out is asynchronous.** The post write commits, an event goes on a queue, and workers do the fan-out. The user sees their own post immediately from their own posts list; followers see it within seconds. That staleness is acceptable and should be stated as a requirement, not discovered as a bug.

## Why it matters

This is the canonical scalability problem and the cleanest test of whether you'll do work at write time or read time based on the actual ratio. The celebrity case is the interviewer's planned follow-up in essentially every run of this question, so arriving at the hybrid yourself — with a threshold and a reason — is what a strong answer looks like.

## Key points

- Estimate the read:write ratio first; ~100:1 read-heavy is what justifies precomputing at write time.
- Fan-out on write makes reads a single list lookup and makes celebrity posts enormously expensive.
- Fan-out on read makes writes trivial and reads scale with how many accounts you follow.
- The expected answer is hybrid: push for normal accounts, pull for high-follower accounts, merge at read.
- Store post IDs and hydrate, so edits and deletes don't rewrite millions of inboxes.
- Cap materialised feeds and fall back to the pull path for deep pagination.
- Skip fan-out for dormant users and rebuild their feed lazily when they return.
- Use cursor pagination on (score, id); `OFFSET` breaks when the feed shifts under the reader.
- Ranking turns the precomputed feed into a candidate set scored at read time under a latency budget.
