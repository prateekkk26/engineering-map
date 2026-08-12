---
title: When Work Leaves the Request
summary: Deciding what to do inside the request and what to hand to a background worker — and the contract you owe the client either way.
level: core
minutes: 20
order: 1
tags: [async, architecture, api]

related:
  - backend/async-work/queues-and-workers
  - backend/api-design/api-errors-clients-can-act-on
  - system-design/building-blocks/background-jobs-and-schedulers

resources:
  - title: Avoiding insurmountable queue backlogs
    url: https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/
    source: AWS Builders' Library
    type: article
    minutes: 25
    primary: true
  - title: Asynchronous operations — API design guide
    url: https://google.aip.dev/151
    source: Google AIP
    type: docs
    minutes: 15
  - title: The Outbox Pattern
    url: https://microservices.io/patterns/data/transactional-outbox.html
    source: Chris Richardson
    type: article
    minutes: 20
---

## In one line

Work belongs in the background when it's slow, retryable, or not something the user is waiting on — and moving it there converts a latency problem into a state-tracking problem.

## What it is

The test is not "is this slow" but **"does the response depend on it"**. Sending a welcome email, generating a thumbnail, syncing to a CRM, re-indexing search, calling a model to summarise an upload: the user does not need any of it to have finished, and doing it inline means their request fails when a third party is down. Conversely, anything the response asserts to be true — the row was created, the payment was authorised — must happen inside the request, or you're lying to the client.

Three arguments for moving work out. **Latency**: p99 stops being hostage to the slowest dependency. **Failure isolation**: a down provider becomes a retry, not a `500`. **Load smoothing**: a spike becomes queue depth instead of a timeout storm.

The costs are real and are what interviewers probe. You now owe the client a way to **observe the outcome** — `202 Accepted` with a job ID and a status endpoint, a webhook, or a realtime push. You have introduced **eventual consistency**, so the UI must be designed for "processing" as a legitimate state rather than showing a stale value and hoping. And you need somewhere for **failures to land**, because a job that fails silently after the user has walked away is worse than a failed request they could see.

The subtle correctness issue is **enqueuing atomically with the write**. `INSERT` then `queue.publish()` is two systems and no transaction: the insert can commit and the publish fail, losing the job, or the publish can succeed and the transaction roll back, so a worker processes a row that doesn't exist. The **transactional outbox** solves it — write the job into an outbox table in the same transaction, and a separate relay publishes it. If you're already on Postgres, a jobs table *is* an outbox, which is one good reason small products should skip the broker.

## Why it matters

"The endpoint takes eight seconds because it calls three APIs" is a standard design prompt, and the expected move is to return immediately and process asynchronously — but the follow-up is always how the client learns the result and what happens when the job fails. This is also the standard shape of any AI feature, where the model call is far too slow to sit inside a request.

## Key points

- The criterion is whether the response depends on the work, not how slow the work is.
- Anything the response claims has happened must happen inside the request and its transaction.
- Backgrounding buys latency, failure isolation and load smoothing, and costs you eventual consistency.
- `202` plus a job ID and a status resource is the honest API shape for deferred work.
- The UI needs a real "processing" state — asynchrony you hide from the user leaks as a bug report.
- Enqueue in the same transaction as the write, or use an outbox table; a publish after commit can be lost.
- Failed background jobs need somewhere visible to land, since nobody is watching the response.
