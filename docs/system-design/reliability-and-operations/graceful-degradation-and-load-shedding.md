---
title: Graceful Degradation & Load Shedding
summary: Deciding in advance which parts of the product are allowed to disappear, so overload costs you a feature instead of the whole page.
level: core
minutes: 20
order: 5
tags: [reliability, resilience, product]

related:
  - system-design/reliability-and-operations/circuit-breakers-and-bulkheads
  - system-design/scalability/rate-limiting-and-backpressure
  - frontend/ai-interfaces/error-retry-and-degraded-modes

resources:
  - title: Using Load Shedding to Avoid Overload
    url: https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/
    source: AWS Builders' Library
    type: article
    minutes: 25
    primary: true
  - title: Handling Overload
    url: https://sre.google/sre-book/handling-overload/
    source: Google SRE Book
    type: docs
    minutes: 30
  - title: Addressing Cascading Failures
    url: https://sre.google/sre-book/addressing-cascading-failures/
    source: Google SRE Book
    type: docs
    minutes: 35
---

## In one line

Under overload, serving 90% of requests well beats serving 100% of them too slowly to be useful — and which 10% you drop should be a decision made in advance, not an accident.

## What it is

**Rank your dependencies by criticality.** For a product page: the price and the buy button are critical; recommendations, reviews and the "recently viewed" strip are not. Non-critical dependencies get a short timeout and an empty-or-cached fallback, and their failure must not be able to fail the page. Writing that ranking down is the design work — the code is easy once the decision exists.

**The degraded modes worth naming.** Serve stale cache instead of fresh data. Drop personalisation and serve the generic version, which is also cacheable and therefore cheap. Go read-only when writes are the problem. Disable expensive features — search suggestions, live counts, recommendation ranking — behind a flag. Queue writes for later instead of rejecting them. Return a smaller page. Each is a specific, defensible answer to "what happens under load."

**Load shedding.** When you're beyond capacity, reject work quickly at the edge rather than accepting everything and degrading for everyone. Two things make it work: reject **early** (at the gateway, before the expensive work) and reject by **priority**. Shed background and batch traffic before interactive traffic; shed anonymous before authenticated; shed retries before first attempts. A request that's already exceeded its client deadline should be dropped without being served at all — work no one is waiting for is pure waste.

**Queues need age limits.** Under sustained overload an unbounded queue fills with requests that will be answered long after the client gave up. Drop requests older than the client timeout, and process newest-first when the queue is deep (LIFO under overload, counter-intuitive but correct — it keeps some requests fresh instead of making all of them stale).

**The frontend half.** Skeletons, cached last-known-good data, and features that hide themselves when their data isn't available. A page that renders with a missing section is a degradation; a page that throws because one fetch failed is an outage. For AI features specifically: fall back to a smaller model, to a cached answer, or to a clear "try again shortly" rather than a spinner that never resolves.

**Test it.** A degraded path that has never been exercised does not work. Flags to force a dependency off, and failure injection in staging or production, are what turn the design into a property.

## Why it matters

Raising degradation unprompted is a strong senior signal, and it's genuinely a product decision as much as an engineering one — which is why it comes up in hiring-manager conversations too. It's also the practical difference between an incident where a feature was missing for ten minutes and one where the site was down.

## Key points

- Rank dependencies as critical or not; non-critical failures must never fail the request.
- Give non-critical calls short timeouts and a defined fallback — cached, empty, or generic.
- Degraded modes: stale data, no personalisation, read-only, features flagged off, queued writes.
- Shed load early at the edge and by priority — background before interactive, retries before first attempts.
- Drop requests older than the client's timeout; nobody is waiting for the answer.
- Under deep queueing, newest-first keeps some requests fresh instead of making all of them stale.
- The UI should render usefully with sections missing rather than failing on one bad fetch.
- Exercise degraded paths deliberately, or they won't work when needed.
