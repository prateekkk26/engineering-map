---
title: Consistency Models
summary: The vocabulary between "strong" and "eventual" — linearizability, causal consistency, and the session guarantees users actually notice.
level: core
minutes: 25
order: 2
tags: [distributed-systems, consistency, data]

related:
  - system-design/distributed-systems/cap-and-pacelc
  - data/transactions-and-consistency/isolation-levels-and-anomalies
  - system-design/scalability/scaling-reads

resources:
  - title: Consistency Models
    url: https://jepsen.io/consistency
    source: Jepsen
    type: docs
    minutes: 30
    primary: true
  - title: Eventually Consistent
    url: https://www.allthingsdistributed.com/2008/12/eventually_consistent.html
    source: Werner Vogels
    type: article
    minutes: 20
  - title: Designing Data-Intensive Applications — Chapter 9, Consistency and Consensus
    url: https://dataintensive.net/
    source: Martin Kleppmann
    type: book
---

## In one line

A consistency model is a contract about which reads can see which writes, and the interesting ones live between "always the latest value" and "eventually, probably."

## What it is

**Linearizability (strong).** The system behaves as if there were one copy of the data and every operation took effect instantaneously at some point between its start and end. Once a write returns, every subsequent read anywhere sees it. This is what people mean by "strongly consistent," and it costs coordination — a cross-node round trip on the critical path.

**Sequential / serializable** are related but distinct: serializability is about transactions being equivalent to *some* serial order, and doesn't by itself require that order to match real time. Strict serializability is the transactional version of linearizability, and is what a single-primary SQL database gives you.

**Causal consistency.** Operations that are causally related are seen in the same order by everyone; unrelated operations may be seen in different orders. This is the sweet spot for a lot of product behaviour — a reply never appears before the message it answers — and it's much cheaper than linearizability.

**Eventual consistency.** Replicas converge if writes stop. It says nothing about when, or what you see in the meantime, including reads that go backwards in time. Adequate for view counts, wrong for anything a user will compare against something else on the same screen.

**The session guarantees — the ones users actually notice.** These are the practically important layer:

- *Read your writes.* After you post, you see your post. Violating this is the most-reported "bug" in replicated systems.
- *Monotonic reads.* You never see data go backwards — refresh doesn't lose your comment. Two requests hitting replicas with different lag causes exactly this.
- *Monotonic writes.* Your own writes apply in the order you made them.
- *Writes follow reads.* Your reply is ordered after the message you were replying to.

You can get all four with an eventually-consistent store by pinning a session to a replica, or routing recent-writers to the primary — much cheaper than global strong consistency, and it fixes the user-visible symptoms.

**How to use this in a design.** Don't declare a consistency level for the system. Go feature by feature: this counter is eventual, this timeline is causal, this balance check is linearizable. Then say how the weak cases stay acceptable — usually optimistic UI plus reconciliation, or routing reads for recent writers to the primary.

## Why it matters

"Eventually consistent" is often used as a way to avoid the question rather than answer it, and interviewers know it. The candidates who stand out name the specific guarantee a feature needs and the mechanism that provides it. On the job this is the vocabulary for the bug report that says "I updated it and it went back to the old value" — that's a monotonic reads violation, and knowing the name gets you to the fix quickly.

## Key points

- Linearizability means a write is visible to everyone the instant it returns, and it costs a coordination round trip.
- Serializability is about transaction ordering; strict serializability is the version that also respects real time.
- Causal consistency preserves cause-and-effect ordering without global coordination — often exactly enough.
- Eventual consistency guarantees convergence only, with no bound and no in-between guarantees.
- Read-your-writes and monotonic reads are what users actually notice; violations read as bugs.
- Session guarantees can be provided cheaply by sticky replica routing or by sending recent writers to the primary.
- Choose consistency per feature, and state how the weakly-consistent cases stay acceptable to the user.
