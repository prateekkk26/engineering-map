---
title: Replication & Quorums
summary: How copies of data stay in step — single-leader, multi-leader and leaderless — and the R + W > N arithmetic behind tunable consistency.
level: core
minutes: 25
order: 3
tags: [distributed-systems, replication, availability]

related:
  - data/scaling-data/replication-and-read-replicas
  - system-design/distributed-systems/consistency-models
  - system-design/distributed-systems/consensus-and-leader-election

resources:
  - title: Designing Data-Intensive Applications — Chapter 5, Replication
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
    primary: true
  - title: Dynamo — Amazon's Highly Available Key-value Store
    url: https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf
    source: Amazon
    type: article
    minutes: 60
  - title: PostgreSQL — Synchronous Replication
    url: https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION
    source: PostgreSQL
    type: docs
    minutes: 20
---

## In one line

Replication is keeping N copies of the data, and every design decision comes down to who accepts writes and how many copies must acknowledge before you call it done.

## What it is

**Single-leader.** One node accepts writes and streams them to followers. Simple, no write conflicts, and what Postgres, MySQL and most managed databases do by default. Reads can go to followers with the lag caveats. The interesting parts are failover — detecting the leader is dead, promoting a follower, making sure the old leader doesn't come back and accept writes (split brain), and accepting that any writes the old leader hadn't replicated are lost.

**Synchronous versus asynchronous.** Async acknowledges the write as soon as the leader has it: fast, and a leader failure loses recent writes. Sync waits for a follower: durable across a node loss, and every write now pays that round trip — and if the follower is slow, writes stall. The usual compromise is semi-synchronous: one synchronous follower, the rest async.

**Multi-leader.** Several nodes accept writes, typically one per region. Good for write latency and offline clients, and it introduces write conflicts that must be resolved — last-write-wins (lossy, and dependent on clocks you shouldn't trust), application-defined merge, or CRDTs for data types that converge by construction.

**Leaderless / quorum.** Clients write to several replicas and read from several — the Dynamo model. With N replicas, W acknowledgements per write and R responses per read: **R + W > N** guarantees the read set overlaps the write set, so a read sees the latest acknowledged write. N=3, W=2, R=2 is the canonical setting. Tune W up for durability, R up for read freshness, or both down for latency and availability. Anti-entropy — read repair and background comparison — repairs replicas that missed writes.

**The caveats on quorums.** R + W > N is weaker than it looks: without extra machinery it doesn't give you linearizability, concurrent writes can still conflict, and a "sloppy quorum" (accepting writes on whichever nodes are reachable) buys availability by giving up the overlap guarantee entirely.

**Replication factor 3** is the near-universal default: survives one node failure while still forming a quorum, and spreads across availability zones.

## Why it matters

Replication is how every real system gets durability and read scale, and it's where "the database is highly available" turns into specific questions: what happens to the write that was in flight when the leader died, how long is failover, and does the application notice. The quorum arithmetic is also one of the few genuinely formulaic things in system design, so knowing it precisely is a cheap and visible win.

## Key points

- Single-leader replication avoids write conflicts entirely and is the right default.
- Async replication loses recent writes on leader failure; sync replication puts a round trip in every write.
- Failover must fence the old leader, or split brain accepts writes on both.
- Multi-leader buys local write latency and requires a real conflict-resolution strategy.
- With quorums, R + W > N makes read and write sets overlap; N=3, W=2, R=2 is the standard.
- Quorums alone don't give linearizability, and sloppy quorums give up the overlap guarantee.
- Read repair and anti-entropy are what fix replicas that missed writes.
- Replication factor 3 across availability zones is the default for a reason.
