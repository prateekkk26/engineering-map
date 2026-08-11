---
title: Consensus & Leader Election
summary: How a group of machines agrees on one value or one leader — enough Raft to use it correctly, and the fencing detail that prevents split brain.
level: core
minutes: 25
order: 4
tags: [distributed-systems, consensus, coordination]

related:
  - system-design/distributed-systems/replication-and-quorums
  - system-design/building-blocks/background-jobs-and-schedulers
  - system-design/distributed-systems/partial-failure-and-failure-detection

resources:
  - title: The Raft Consensus Algorithm
    url: https://raft.github.io/
    source: Ongaro & Ousterhout
    type: docs
    minutes: 40
    primary: true
  - title: The Chubby Lock Service for Loosely-Coupled Distributed Systems
    url: https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/
    source: Google Research
    type: article
    minutes: 45
  - title: How to Do Distributed Locking
    url: https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
    source: Martin Kleppmann
    type: article
    minutes: 25
---

## In one line

Consensus is getting a majority of nodes to agree on an ordered sequence of decisions despite failures, and in practice you consume it from etcd, ZooKeeper or your database rather than implementing it.

## What it is

**What it's for.** Electing a leader, agreeing on cluster membership, holding a distributed lock, and ordering a replicated log. Anywhere exactly one node must do a thing, or all nodes must agree on the same value.

**Raft, in the amount you need.** Nodes are follower, candidate or leader. A leader is elected for a numbered **term** by winning a majority vote. The leader takes all writes, appends them to a replicated log, and a log entry is *committed* once a majority has stored it. Followers with a randomised election timeout that expires without a heartbeat start a new election in a higher term. Majority quorums mean a 3-node cluster tolerates one failure, 5 tolerates two — and that **even node counts buy you nothing**, which is why coordination clusters are odd-sized.

**The consequences that matter in a design.** Consensus needs a majority to be alive, so it stops accepting writes during a partition where no side has a majority — this is the "CP" behaviour. Every decision costs a round trip to a majority, so it's slow relative to local work, and you keep it off the hot path: use it to elect a leader who then serves many requests, not to agree on every request.

**Leader election in application code.** The common cases — one instance runs the cron job, one consumer owns a partition — are usually solved with a lease: a key with a TTL in Redis or etcd, refreshed while alive. **The critical detail is fencing.** A leader can be paused (GC, VM freeze) long enough for its lease to expire and a new leader to be elected, then wake up believing it's still the leader. A lock alone does not prevent it from acting. The fix is a monotonically increasing fencing token issued with the lock, which downstream systems check and use to reject writes from a stale leader. This is the single most commonly missed point on this topic, and naming it is a strong signal.

**Paxos, Raft, ZAB** solve the same problem; Raft was designed to be understandable and won on that. Naming Paxos without being able to say anything about it is a trap — say you'd use etcd or your database's built-in election.

## Why it matters

It comes up whenever a design has "one node does X" in it — scheduled jobs, primary election, exclusive ownership of a shard — and the follow-up is always "what if two think they're the leader?" Knowing that a lease alone is insufficient without fencing separates people who've read about distributed locks from people who've been burned by one.

## Key points

- Consensus gives agreement on an ordered sequence of decisions as long as a majority is alive.
- Raft elects a leader per term; an entry commits once a majority has stored it.
- Majority quorums make odd cluster sizes the only sensible choice — 3 tolerates 1, 5 tolerates 2.
- No majority means no progress: consensus systems stop accepting writes during a bad partition.
- Keep consensus off the hot path — elect a leader, then let it serve many requests locally.
- A lease alone doesn't prevent split brain; a paused leader can wake up believing it still holds it.
- Fencing tokens — monotonic numbers checked by downstream systems — are what actually make locks safe.
- Use etcd, ZooKeeper or your database's election rather than implementing consensus.
