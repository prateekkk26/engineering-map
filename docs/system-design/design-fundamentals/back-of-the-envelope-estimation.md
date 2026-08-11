---
title: Back-of-the-Envelope Estimation
summary: Converting user counts into requests per second, bytes per day and storage per year — fast enough to do it out loud without a calculator.
level: core
minutes: 20
order: 3
tags: [system-design, estimation, capacity]

related:
  - system-design/design-fundamentals/latency-numbers-worth-knowing
  - system-design/design-fundamentals/requirements-and-scoping
  - system-design/reliability-and-operations/capacity-planning-and-autoscaling

resources:
  - title: Back-of-the-Envelope Estimation
    url: https://github.com/donnemartin/system-design-primer#appendix
    source: System Design Primer
    type: repo
    minutes: 10
  - title: Numbers Everyone Should Know
    url: https://static.googleusercontent.com/media/research.google.com/en//people/jeff/stanford-295-talk.pdf
    source: Jeff Dean
    type: article
    minutes: 20
    primary: true
  - title: Napkin Math
    url: https://github.com/sirupsen/napkin-math
    source: Simon Hørup Eskildsen
    type: repo
    minutes: 30
---

## In one line

Estimation exists to find out which dimension of the problem is hard, and it only needs to be right to within a factor of ten.

## What it is

A handful of conversions, done in your head, in this order.

**Users to requests per second.** Take daily active users, multiply by actions per user per day, divide by 100,000 — that's the round number for seconds in a day (86,400). So 10M DAU × 10 actions = 100M/day ≈ **1,200 requests/second average**. Then multiply by 2–3 for peak; traffic is never flat. Say "call it 3,000/s at peak" and move on.

**Requests to storage.** Bytes per record × records per day × 365 × retention. A 1KB record at 100M/day is 100GB/day, 36TB/year. That number decides whether one Postgres instance is fine (it usually is, below a few TB) or whether you're partitioning. Add a rough factor for indexes and replicas — three copies is the normal assumption.

**Read:write ratio.** Ask for it, or derive it. This is the number that shapes the design more than any other.

**Bandwidth.** Requests/second × payload size. 3,000/s × 100KB = 300MB/s, which is the moment you notice you need a CDN.

**Numbers worth memorising.** 86,400 seconds/day ≈ 100K. 1M seconds ≈ 12 days. 2^10 ≈ 1 thousand, 2^20 ≈ 1 million, 2^30 ≈ 1 billion. A char is 1 byte, a UUID 16 bytes, a timestamp 8, a typical row a few hundred bytes to a few KB, a photo 1–5MB, a minute of video 10–50MB. One commodity server handles order-of-1,000 simple requests/second; one Postgres primary handles order-of-10,000 simple queries/second with everything in memory.

**Round aggressively and say so.** Use 100,000 for a day. Use 1,000 for 1,024. The interviewer is not checking your arithmetic; they're checking whether the numbers led you anywhere. The sentence that scores is the conclusion: *"So this is 36TB a year and 3,000 reads a second — the reads are the problem, the storage isn't."*

## Why it matters

Numbers are what separate a design from a diagram. They justify every subsequent decision — why a cache, why sharding, why a queue — and they're the fastest way to demonstrate you won't over-engineer: showing that the whole dataset fits in one database is a stronger answer than reflexively sharding it. Interviewers also use estimation to see whether you can hold approximate reasoning in your head under pressure, which is exactly what capacity planning is on the job.

## Key points

- 86,400 seconds/day rounds to 100K; DAU × actions ÷ 100K gives average requests/second.
- Multiply average by 2–3× for peak, and say you're doing it.
- Storage = record size × rate × retention, then ×3 for replication and indexes.
- The read:write ratio decides the architecture more than the absolute numbers do.
- One Postgres primary handles order-of-10,000 simple queries/second; a few TB fits on one box.
- Round to powers of ten, out loud, and never reach for precision you don't need.
- Finish every estimate with a sentence naming which dimension is the hard one.
