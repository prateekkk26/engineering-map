---
title: Background Jobs & Schedulers
summary: Work that happens outside a request — job runners, cron at scale, and why "run this once at 3am" is harder than it sounds.
level: core
minutes: 20
order: 8
tags: [async, reliability, scheduling]

related:
  - system-design/building-blocks/message-queues-and-brokers
  - system-design/distributed-systems/idempotency-and-delivery-semantics
  - data/data-pipelines/idempotent-jobs-and-data-quality

resources:
  - title: Reliable Cron Across the Planet
    url: https://queue.acm.org/detail.cfm?id=2745840
    source: ACM Queue / Google
    type: article
    minutes: 30
    primary: true
  - title: Sidekiq Best Practices
    url: https://github.com/sidekiq/sidekiq/wiki/Best-Practices
    source: Sidekiq
    type: docs
    minutes: 15
  - title: Avoiding Insurmountable Queue Backlogs
    url: https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/
    source: AWS Builders' Library
    type: article
    minutes: 25
---

## In one line

Anything slow, retryable, or scheduled runs outside the request path — and the design work is in retries, idempotency, and making sure "once an hour" means once across the whole fleet.

## What it is

**Two shapes.** *Job queues* — work enqueued by a request and processed by a pool of workers: send the email, generate the thumbnail, recompute the feed. *Scheduled jobs* — work triggered by time: nightly reports, expiry sweeps, reconciliation, retraining.

**Distributed cron is the non-obvious part.** A cron entry on every instance in an autoscaled fleet fires N times. The fixes: a single leader elected via a lock (a row with a lease, Redis `SET NX PX`, or the platform's own primitive), or a managed scheduler that guarantees a single trigger. Then the harder question — **the job must be idempotent anyway**, because a scheduler that guarantees "at least once" plus a worker that crashes mid-run means partial reruns are normal. Design every job so running it twice is a no-op, usually via a run record keyed on the period, or by making the work naturally convergent (`UPDATE ... WHERE status = 'pending'` rather than "process the next 100").

**Missed and overlapping runs.** If the system was down at 3am, does the 3am job run late or get skipped? If a run takes 70 minutes and fires hourly, do two run at once? Both need an explicit answer — usually a lock preventing overlap, and a catch-up policy that's either "skip" or "run for the missed window", never left to chance.

**Long jobs need to be chunked.** A single job that processes ten million rows will be killed by a deploy, a timeout or an OOM, and restart from zero. Break it into batches with a durable cursor so a restart resumes. This is also what makes a backfill pausable when it starts hurting the database.

**Priority and isolation.** One queue for everything means a flood of low-priority work delays password-reset emails. Separate queues by latency requirement, with their own worker pools, so a slow class of job can't starve a fast one.

**Visibility.** Per-job success and failure counts, duration, queue depth, and oldest-message age. The alert that matters most is *oldest unprocessed message*, not queue length — a queue of 100,000 that drains in a minute is fine, a queue of 3 with a message from an hour ago is broken.

## Why it matters

Every real system has background work, and it's where quiet failures live: jobs that stopped running weeks ago, retries that double-charged a customer, a nightly report nobody noticed had been empty since a deploy. In a design round, saying "this runs on a schedule" invites exactly the questions above, and having crisp answers is a strong reliability signal.

## Key points

- Anything the user doesn't need in the response — slow, retryable, or bursty — runs as a job.
- Cron on every instance fires once per instance; use leader election or a managed scheduler.
- Idempotency is required regardless, because crashes mid-run make partial reruns normal.
- Decide explicitly whether missed runs are skipped or caught up, and prevent overlapping runs with a lock.
- Chunk long jobs with a durable cursor so a deploy or crash resumes instead of restarting.
- Separate queues by latency class so bulk work can't starve user-facing jobs.
- Alert on oldest-unprocessed-message age, not queue depth.
