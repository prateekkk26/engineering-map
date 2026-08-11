---
title: Replication & Read Replicas
summary: Replicas multiply read capacity and introduce lag, which shows up as a user not seeing their own write.
level: core
minutes: 20
order: 1
tags: [data, scaling, consistency]

related:
  - data/scaling-data/partitioning-and-sharding
  - data/postgres-in-depth/connection-pooling
  - data/transactions-and-consistency/isolation-levels-and-anomalies

resources:
  - title: High Availability, Load Balancing, and Replication
    url: https://www.postgresql.org/docs/current/high-availability.html
    source: PostgreSQL
    type: docs
    minutes: 30
    primary: true
  - title: Designing Data-Intensive Applications — Ch. 5, Replication
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
  - title: Hot Standby
    url: https://www.postgresql.org/docs/current/hot-standby.html
    source: PostgreSQL
    type: docs
    minutes: 20
---

## In one line

A replica replays the primary's write-ahead log to serve reads, which buys read scale and failover at the price of being slightly behind.

## What it is

Postgres streams the WAL to standbys, which apply it and can serve read-only queries. **Asynchronous** replication — the default — acknowledges the commit on the primary without waiting, so a failover can lose recent transactions. **Synchronous** replication waits for a standby to confirm, so nothing committed is lost, at the cost of primary latency and of a stalled primary if the standby is unreachable and you configured it strictly.

Replication buys three distinct things, and they're worth separating: **read capacity** (route heavy or analytical reads away from the primary), **high availability** (promote a standby when the primary dies), and **geographic locality** (serve readers near them). Writes always go to the primary — a replica does not help write throughput at all, and that misconception is a common interview stumble.

**Replication lag is the whole problem.** It is normally milliseconds and spikes to seconds under heavy write load, a long-running query on the standby, or a big backfill. The user-visible symptom is "read your own writes" breaking: a user updates their profile, the redirect reads a replica, and the old value comes back. The fixes, in ascending sophistication: route reads to the primary for a short window after a write (usually per user, via a cookie or session flag); send only *known-stale-tolerant* reads to replicas — dashboards, search, exports; or capture the WAL position at write time and wait for the replica to reach it before reading.

**Failover is not free.** Promoting a standby needs a mechanism (Patroni, or your provider's), the application must reconnect, and asynchronous replication means you may have lost the last few transactions. Split-brain — two primaries accepting writes — is the failure to design against, which is what fencing and quorum are for.

The multi-primary variant is generally the wrong answer at product-engineer altitude: accepting writes in two places means resolving conflicts, and unless you're using a database designed for it, that becomes your problem.

## Why it matters

Read replicas are the standard first move when a database gets hot, and the follow-up — "what breaks?" — is exactly the lag question. Being able to name read-your-own-writes and describe the routing fix is the difference between having read about replicas and having shipped one.

## Key points

- Replicas serve reads only; write throughput is unchanged, so replication does not solve a write bottleneck.
- Asynchronous replication can lose committed transactions on failover; synchronous trades primary latency to prevent that.
- Lag is normal and spikes under write load or long standby queries — design for it rather than assuming milliseconds.
- The classic user-visible bug is read-your-own-writes, and it shows up as an update that appears not to have applied.
- Route post-write reads to the primary for a short window, and send only stale-tolerant traffic to replicas.
- Failover requires a promotion mechanism, application reconnection, and protection against split-brain.
- A replica is also the cheapest place to run analytics, isolating heavy scans from user traffic.
