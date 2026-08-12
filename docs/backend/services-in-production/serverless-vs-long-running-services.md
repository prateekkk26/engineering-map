---
title: Serverless vs Long-Running Services
summary: What you actually give up when a request gets its own short-lived instance — connections, memory, background work, and stream duration.
level: core
minutes: 25
order: 1
tags: [deployment, serverless, architecture]

related:
  - backend/services-in-production/connection-management-and-pooling
  - frontend/nextjs/deployment-runtimes-and-hosting
  - backend/node-runtime/scaling-one-node-process

resources:
  - title: Lambda execution environment
    url: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html
    source: AWS
    type: docs
    minutes: 20
    primary: true
  - title: How Workers works
    url: https://developers.cloudflare.com/workers/reference/how-workers-works/
    source: Cloudflare
    type: docs
    minutes: 20
  - title: Choose an Azure compute service
    url: https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/compute-decision-tree
    source: Microsoft Azure
    type: docs
    minutes: 20
---

## In one line

Serverless trades control over the process lifetime for not managing servers, and every constraint that follows — cold starts, no shared connections, no background work after the response — comes from that one trade.

## What it is

Three runtime models. A **long-running server** (a container, a VM) starts once and handles many requests: it can hold a connection pool, an in-memory cache, background timers, and open streams for as long as it likes. **Serverless functions** (Lambda, Vercel Functions) spin an instance per concurrent request, freeze it between invocations, and reclaim it after idle. **Edge runtimes** (Cloudflare Workers, and the edge variants of the above) run V8 isolates close to the user with millisecond start-up, but a restricted API surface — no full Node built-ins, no raw TCP, tight CPU-time limits.

What actually changes when you go serverless:

**Connections.** Each instance has its own pool of one or two, and a hundred concurrent invocations means a hundred database connections — which is how a Postgres `max_connections` gets exhausted by a service under no real load. This is the number-one operational surprise, and the fix is an external pooler (PgBouncer, a serverless driver, a data proxy).

**Cold starts.** The first request into a new instance pays initialisation: a few hundred milliseconds for a small Node function, more with heavy dependencies. Edge isolates are effectively free; container starts are slower. It matters for user-facing p99 and not at all for a queue worker.

**Nothing survives the response.** Work fired off after returning is frozen or killed — no background timers, no in-memory cache you can rely on, no `setInterval` cleanup. Deferred work has to go to a queue or an explicit background primitive (`waitUntil`).

**Duration and streaming limits.** A long model response can outlive the platform's maximum invocation time, and this is the constraint that most often pushes AI features onto a long-running service.

The pragmatic answer is usually **both**: serverless for the request/response API where scale-to-zero and no ops genuinely pay, and a long-running service for workers, WebSockets, and long streams. Choosing per-workload rather than per-company is the senior position.

## Why it matters

Next.js on Vercel is the default stack for the target companies, so these constraints are daily reality rather than trivia — and "why is our database out of connections?" is the archetypal incident. In interviews, naming connection exhaustion and duration limits shows you've deployed serverless rather than read about it.

## Key points

- One instance per concurrent request is the model everything else follows from.
- Connection pools don't work per-instance; serverless plus Postgres needs an external pooler.
- Cold starts hurt user-facing p99 and are irrelevant for background workloads.
- Nothing runs after the response returns — background work goes to a queue or an explicit primitive.
- Platform duration limits can truncate long-lived streams, which pushes AI endpoints toward long-running hosts.
- Edge runtimes are fast to start but restrict the API surface and CPU time available.
- Mixing models per workload is normal and usually correct; the choice isn't company-wide.
