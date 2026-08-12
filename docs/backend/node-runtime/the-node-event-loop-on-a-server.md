---
title: The Node Event Loop on a Server
summary: One thread serving every concurrent request, and the specific ways a handler stops all of them at once.
level: core
minutes: 25
order: 1
tags: [node, runtime, performance, concurrency]

related:
  - frontend/javascript/event-loop
  - _shared/concurrency-models
  - backend/node-runtime/scaling-one-node-process

resources:
  - title: The Node.js Event Loop
    url: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
    source: Node.js
    type: docs
    minutes: 25
    primary: true
  - title: Everything You Need to Know About Node.js Event Loop
    url: https://www.youtube.com/watch?v=zphcsoSJMvM
    source: Bert Belder, Node.js Interactive
    type: video
    minutes: 30
  - title: libuv — Design overview
    url: https://docs.libuv.org/en/v1.x/design.html
    source: libuv
    type: docs
    minutes: 20
---

## In one line

Node serves thousands of concurrent connections on one JavaScript thread by never waiting for I/O — which means any code that *does* wait, or that computes for too long, blocks every other request in the process.

## What it is

The loop runs phases in order: timers (`setTimeout`), pending callbacks, poll (where I/O completions arrive and where the loop parks when idle), check (`setImmediate`), and close callbacks. Between every callback it drains the microtask queue — promise continuations and `process.nextTick`, with `nextTick` running first. That last detail is a real footgun: a recursive `process.nextTick` starves the loop entirely, because the microtask queue must empty before the loop can advance.

Underneath sits **libuv**, and the important asymmetry lives there. Network I/O is genuinely asynchronous at the OS level — epoll, kqueue — so sockets scale without threads. Filesystem operations, DNS lookups via `getaddrinfo`, and crypto functions like `pbkdf2` are not, so they run on a **thread pool of four by default** (`UV_THREADPOOL_SIZE`). Five concurrent `fs.readFile` calls means the fifth waits, and a slow DNS resolution can queue behind file reads in a way that looks impossible from the JavaScript side.

The failure mode on a server has no browser analogue: **blocking is total**. A 200ms JSON parse in one request adds 200ms of latency to every other request in flight, and the effect shows up as a tail-latency problem long before anyone suspects CPU. The usual culprits are large `JSON.parse`/`JSON.stringify`, synchronous crypto (`bcrypt` in sync mode), `fs.readFileSync` outside startup, catastrophic regex backtracking on user input (ReDoS — a security issue, not just a performance one), and per-request loops over big arrays.

Practical instrumentation: measure **event loop lag** (`perf_hooks`'s `monitorEventLoopDelay`) and export it as a metric — it is the earliest and most reliable indicator that a Node service is in trouble, more so than CPU. For genuinely CPU-bound work, the answer is a worker thread or a separate service, not a cleverer async pattern; `await` doesn't yield to the loop in the middle of a synchronous computation.

## Why it matters

Every Node performance question in a backend-flavoured interview reduces to this model, and the diagnostic story — "p99 latency degraded across all endpoints, event loop lag was 400ms, one endpoint was parsing a 10MB payload" — is the kind of concrete answer deep-dive rounds are looking for. It also explains the shape of Node's whole API surface.

## Key points

- One thread runs your JavaScript, so a slow synchronous block delays every concurrent request, not just its own.
- Microtasks drain between callbacks, and `process.nextTick` runs before promises — recursive use starves the loop.
- Network I/O is truly async; filesystem, DNS and some crypto go through a four-thread pool you can resize.
- Event loop lag is the leading indicator of a struggling Node service and belongs on your dashboard.
- `async`/`await` doesn't make CPU work concurrent — it only yields at real await points.
- ReDoS on user-supplied input blocks the whole process and is a denial-of-service vector, not just slow code.
- CPU-bound work belongs in a worker thread or another service; there is no async trick that fixes it in-loop.
