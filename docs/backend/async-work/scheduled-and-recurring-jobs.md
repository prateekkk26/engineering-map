---
title: Scheduled & Recurring Jobs
summary: Cron in a world of many instances — running a job exactly once per tick, catching up after downtime, and not designing a nightly stampede.
level: core
minutes: 20
order: 5
tags: [async, cron, scheduling, reliability]

related:
  - backend/async-work/queues-and-workers
  - data/data-pipelines/idempotent-jobs-and-data-quality
  - data/schema-design-and-migrations/modelling-time-and-timezones

resources:
  - title: Distributed cron and scheduling
    url: https://sre.google/sre-book/distributed-periodic-scheduling/
    source: Google SRE Book
    type: book
    minutes: 40
    primary: true
  - title: CronJob
    url: https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
    source: Kubernetes
    type: docs
    minutes: 20
  - title: Reliability, constant work, and a good cup of coffee
    url: https://aws.amazon.com/builders-library/reliability-and-constant-work/
    source: AWS Builders' Library
    type: article
    minutes: 20
---

## In one line

A cron entry on every instance runs the job N times, so scheduled work needs a single owner for each tick — a lock, a scheduler, or a managed trigger.

## What it is

The first problem is **fan-out**. `node-cron` inside a web service that runs five replicas fires five times per schedule. Three fixes: a distributed lock keyed by job name and tick (Redis `SET NX` with a TTL, or a Postgres advisory lock) so the losers exit immediately; a managed scheduler outside your processes (Kubernetes `CronJob`, a cloud scheduler, Vercel Cron) that invokes an endpoint or spawns one pod; or a job library with leader election built in. The lock's TTL must exceed the job's runtime, and the job must handle the case where the lock expires mid-run.

The second is **the schedule is not the guarantee**. If the instance was down at 02:00, does the job run late, or skip? Both are legitimate — a report can skip, a billing run absolutely cannot — but it must be a decision, not an accident. Jobs that must not be missed should be **driven by state rather than by time**: instead of "at 02:00, process yesterday's invoices", write "process all invoices where `processed_at IS NULL`", and let the schedule merely be how often you check. That makes the job idempotent, catch-up-safe, and safe to run twice.

Third, **timezones and DST**. Cron in local time runs twice or not at all on DST boundaries. Schedule in UTC and convert for user-facing semantics ("send at 9am in the customer's timezone" is a per-customer computation, not a cron expression).

Fourth, **the midnight stampede**. Every tenant's job at 00:00 is a load spike, a database pileup, and a rate limit breach against whatever you call. Spread work across the window by hashing the tenant ID into a minute offset, or run a continuous drip instead of a batch — the "constant work" pattern, where the system does roughly the same amount of work all the time and therefore has no failure mode you haven't already tested.

Finally, scheduled jobs are the least observed part of most systems: they succeed silently and fail silently. Alert on **absence** — a heartbeat or dead-man's switch that fires when the job didn't run — not just on errors, because the common failure is that it never started.

## Why it matters

Nearly every product has nightly work — billing, digests, cleanup, re-embedding — and "how do you make sure it runs once when you have five instances?" is a compact senior question. The state-driven framing is the answer that also survives the follow-up about downtime and retries.

## Key points

- In-process cron multiplies by replica count; use a lock, a leader, or an external scheduler.
- Lock TTL must exceed worst-case runtime, and the job must tolerate losing the lock mid-run.
- Decide explicitly whether a missed tick is skipped or caught up — the two are different products.
- Prefer state-driven jobs ("everything unprocessed") over time-driven ones; they're idempotent and self-healing.
- Schedule in UTC; DST makes local-time cron run twice or not at all.
- Stagger per-tenant work or do constant work, or you build a midnight thundering herd.
- Alert on the job *not* running — silent absence is the dominant failure mode of scheduled work.
