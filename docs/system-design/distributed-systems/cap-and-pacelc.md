---
title: CAP & PACELC
summary: What the theorem actually says, why "CP or AP" is usually a sloppy way to describe a database, and the extension that matters more in practice.
level: core
minutes: 20
order: 1
tags: [distributed-systems, consistency, availability]

related:
  - system-design/distributed-systems/consistency-models
  - system-design/scalability/multi-region-architecture
  - system-design/distributed-systems/replication-and-quorums

resources:
  - title: Please Stop Calling Databases CP or AP
    url: https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html
    source: Martin Kleppmann
    type: article
    minutes: 20
    primary: true
  - title: CAP Twelve Years Later — How the "Rules" Have Changed
    url: https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/
    source: Eric Brewer / InfoQ
    type: article
    minutes: 30
  - title: PACELC — Consistency Tradeoffs in Modern Distributed Database System Design
    url: https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf
    source: Daniel Abadi
    type: article
    minutes: 25
---

## In one line

When the network partitions, a distributed system can either refuse requests or serve possibly-stale data — and PACELC adds the part that matters every other day: even without a partition, you're trading latency for consistency.

## What it is

**The theorem, stated carefully.** In the presence of a network **P**artition, you must choose between **C**onsistency (every read sees the latest write, i.e. linearizability) and **A**vailability (every non-failing node answers). You do not "choose two of three" — partitions are not something you opt out of, so the choice is only between C and A, and only during a partition.

**Why "CP or AP" is misleading.** The labels are much cruder than real systems. Most databases offer several consistency levels, configurable per operation; the same cluster can serve a linearizable read and an eventually-consistent one. And "consistency" in CAP means linearizability specifically — not the C in ACID, which is a different word for a different idea. Being precise about this is itself a senior signal, because sloppy CAP talk is extremely common.

**PACELC is the more useful version.** *If there is a **P**artition, choose **A**vailability or **C**onsistency; **E**lse, choose **L**atency or **C**onsistency.* The second half is the one that governs normal operation: making a write visible everywhere before acknowledging it costs a cross-node — often cross-region — round trip on every request. Partitions are rare; that latency bill is paid all day, every day. Most systems you'll design are effectively PA/EL or PC/EL.

**In practice you decide per operation, not per system.** Postgres with synchronous replication is consistent and pays latency; the same Postgres with async replicas serves fast, slightly stale reads. A shopping cart can be eventually consistent; a payment authorisation cannot. The strong answer in a design round is not "this system is AP" — it's "these three reads tolerate staleness and go to replicas, this one write needs linearizability and goes to the primary."

**What availability means in an outage.** If you pick consistency, define the degraded mode explicitly: read-only, reduced functionality, or an error. "Unavailable" as an unexamined outcome is not a design.

## Why it matters

CAP is the most name-dropped and least precisely-used concept in system design interviews, so using it precisely stands out immediately. More practically, the question behind it — what does a user see when a node can't be reached — has to be answered for every design that replicates data, and PACELC is the framing that turns it into a per-operation decision rather than a slogan.

## Key points

- Partitions aren't optional, so CAP is a choice between consistency and availability *during* one.
- "Consistency" in CAP means linearizability — not the C in ACID.
- Labelling a whole database CP or AP is too coarse; real systems tune consistency per operation.
- PACELC adds the everyday trade: without a partition you're still choosing latency versus consistency.
- The latency cost of strong consistency is paid continuously; the partition cost is paid rarely.
- Decide per operation — stale-tolerant reads to replicas, linearizable operations to the primary.
- If you choose consistency, state the degraded mode explicitly: read-only, reduced, or error.
