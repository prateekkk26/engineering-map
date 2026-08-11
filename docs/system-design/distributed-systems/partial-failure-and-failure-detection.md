---
title: Partial Failure & Failure Detection
summary: The defining property of a distributed system — some of it is broken and you can't tell which — and what to do given that you can never be sure.
level: core
minutes: 20
order: 8
tags: [distributed-systems, reliability, failure]

related:
  - system-design/reliability-and-operations/timeouts-retries-and-backoff
  - system-design/reliability-and-operations/failure-modes-and-blast-radius
  - cs-fundamentals/networking/network-failure-modes

resources:
  - title: Fallacies of Distributed Computing Explained
    url: https://nighthacks.com/jag/res/Fallacies.html
    source: Peter Deutsch / James Gosling
    type: article
    minutes: 15
  - title: Notes on Distributed Systems for Young Bloods
    url: https://www.somethingsimilar.com/2013/01/14/notes-on-distributed-systems-for-young-bloods/
    source: Jeff Hodges
    type: article
    minutes: 25
    primary: true
  - title: Implementing Health Checks
    url: https://aws.amazon.com/builders-library/implementing-health-checks/
    source: AWS Builders' Library
    type: article
    minutes: 30
---

## In one line

A local function call either returns or throws; a remote one can also do nothing, do the work and lose the reply, or succeed twenty seconds later — and you cannot tell these apart from the outside.

## What it is

**The ambiguity is fundamental.** When a request times out, the possibilities are: it never arrived, it arrived and is still running, it completed and the response was lost, or the server is up but overloaded. From the caller's side these are indistinguishable. Everything else on this page follows from that.

**So: timeouts are mandatory, and idempotency is mandatory.** A call with no timeout can hang forever and exhaust your connection pool, taking your service down because of someone else's slowness. And since you must retry after a timeout but the work may already have happened, the operation must be safe to repeat.

**Failure detectors are heuristics, not oracles.** Heartbeats and health checks can only ever say "I haven't heard from it recently." A node that's alive but slow looks dead; a node that's dead looks the same as a partitioned one. Tuning is a genuine trade: react quickly and you'll evict healthy nodes during a blip (and that eviction reduces capacity, which causes more timeouts — a feedback loop); react slowly and you send traffic to dead nodes for longer.

**Grey failure is the hard case.** Total failures are easy: the process is gone, health checks fail, traffic moves. The painful ones are partial — a node serving 5% errors, a disk that's slow but working, one replica lagging, a dependency that's fine for reads and broken for writes. These evade binary health checks and cause the incidents that take hours to diagnose. Outlier detection (compare each node's error rate and latency against the fleet median, eject the deviants) catches what up/down checks miss.

**Health checks shouldn't be transitive.** If your `/health` returns unhealthy whenever the database is slow, one slow database marks the entire fleet unhealthy and the load balancer removes everything — turning a degradation into an outage. Separate *liveness* (is this process working?) from *readiness* (should it receive traffic?), and keep deep dependency checks out of the signal that controls traffic.

**Design so partial failure is survivable**: bulkheads so one dependency's failure doesn't consume all your threads, circuit breakers so you stop calling something that's clearly broken, and degraded modes so a non-critical dependency being down loses a feature rather than the page.

## Why it matters

This is the mental shift from "distributed systems are systems with more machines" to "distributed systems are systems where you're always partly wrong about the state of the world." In interviews it drives every good failure question — what happens if this call times out, if this node is slow rather than dead, if the response is lost after the write committed — and having *the ambiguity* as your starting point produces better answers than memorised patterns.

## Key points

- A timed-out call may have not arrived, still be running, or have succeeded with a lost response — indistinguishable.
- Every remote call needs a timeout, or one slow dependency exhausts your resources.
- Retries after a timeout require idempotency, because the first attempt may have succeeded.
- Failure detection is a heuristic: alive-but-slow and dead-or-partitioned look identical.
- Aggressive eviction during a blip reduces capacity and can amplify the problem into a feedback loop.
- Grey failures — partial errors, slow disks, lagging replicas — pass binary health checks and cause the worst incidents.
- Outlier detection against fleet median catches what up/down checks miss.
- Keep dependency checks out of readiness, or one slow database takes the whole fleet out of rotation.
