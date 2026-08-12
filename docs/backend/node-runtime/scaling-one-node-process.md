---
title: Scaling One Node Process
summary: Using every core with cluster or containers, moving CPU work to worker threads, and knowing which of the two a problem actually needs.
level: core
minutes: 20
order: 5
tags: [node, scaling, concurrency, performance]

related:
  - backend/node-runtime/the-node-event-loop-on-a-server
  - backend/services-in-production/serverless-vs-long-running-services
  - system-design/scalability/stateless-services-and-session-state

resources:
  - title: Worker threads
    url: https://nodejs.org/api/worker_threads.html
    source: Node.js
    type: docs
    minutes: 25
  - title: Cluster
    url: https://nodejs.org/api/cluster.html
    source: Node.js
    type: docs
    minutes: 20
    primary: true
  - title: PM2 cluster mode
    url: https://pm2.keymetrics.io/docs/usage/cluster-mode/
    source: PM2
    type: docs
    minutes: 15
---

## In one line

One Node process uses one core, so scaling means running several processes — and worker threads are for the different problem of getting CPU work out of the request path.

## What it is

**Horizontal, within a machine.** `cluster` forks one worker per core sharing a listening socket, and the OS or the primary distributes connections. It works, but in a containerised world the better default is **one process per container** and let the orchestrator run more containers: identical scaling model, simpler process management, per-instance metrics that mean something, and no primary process to be a single point of failure. Reach for `cluster` (or its production wrapper, PM2) when you're on a VM with eight cores and no orchestrator.

Either way, multiple processes force the same discipline: **the service must be stateless**. In-memory sessions, per-process caches, rate-limit counters, and WebSocket connection registries all break the moment there are two instances, and they break intermittently — which is worse — because a given request may or may not land on the process holding the state. Push it to Redis or the database.

**Worker threads solve something else.** They're for CPU-bound work — parsing a huge document, image or PDF processing, tokenising, cryptography — that would otherwise block the event loop. Each worker has its own V8 isolate and event loop; they communicate by message passing, with structured-cloned copies rather than shared objects, except for `SharedArrayBuffer`. Spawning one costs tens of milliseconds and a few megabytes, so use a **pool** with a bounded queue rather than a thread per task. Worker threads are *not* a way to serve more concurrent requests — for I/O-bound work, which is most web serving, the single-threaded loop is already the efficient design.

The decision is therefore simple to state: **more traffic → more processes; slow CPU-bound operation → worker thread or a separate job service**. If the CPU work is long enough to be worth a queue (seconds, not milliseconds), it belongs in background work rather than a thread, so it survives a deploy and can be retried.

## Why it matters

"Node is single-threaded, so how do you use a 16-core box?" is a standard screening question, and the complete answer covers both axes plus the statelessness constraint. The stateless point is also where real bugs live: an in-memory rate limiter that silently allows N× the intended traffic once you scale to N instances.

## Key points

- One process, one core — parallelism comes from multiple processes, whether via `cluster` or the orchestrator.
- One process per container is the modern default; `cluster` is for bare VMs without an orchestrator.
- Multiple instances require stateless handlers: sessions, caches, counters and socket registries move to shared storage.
- In-memory rate limiters multiply their limit by the instance count — a real and easily-missed bug.
- Worker threads exist for CPU-bound work, not for concurrency; I/O already scales on one thread.
- Threads communicate by copied messages, so passing large objects has a real serialisation cost.
- Work measured in seconds belongs in a queue and a worker service, not a thread inside the web process.
