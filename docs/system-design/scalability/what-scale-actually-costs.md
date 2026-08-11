---
title: What Scale Actually Costs
summary: Where the money goes in a large system, and why cost per request is a design constraint rather than a finance problem.
level: deep
minutes: 20
order: 8
tags: [cost, scalability, tradeoffs]

related:
  - ai/observability-and-cost/unit-economics-of-an-llm-feature
  - system-design/ai-system-design/multi-tenant-quotas-and-cost-control
  - system-design/architecture-decisions/designing-under-constraints

resources:
  - title: The Cost of Cloud, a Trillion Dollar Paradox
    url: https://a16z.com/the-cost-of-cloud-a-trillion-dollar-paradox/
    source: Andreessen Horowitz
    type: article
    minutes: 25
    primary: true
  - title: Frugal Architect
    url: https://www.thefrugalarchitect.com/
    source: Werner Vogels
    type: docs
    minutes: 20
  - title: AWS Data Transfer Costs Explained
    url: https://aws.amazon.com/blogs/architecture/overview-of-data-transfer-costs-for-common-architectures/
    source: AWS
    type: article
    minutes: 25
---

## In one line

At scale the expensive things are rarely CPU — they're data transfer, storage that never gets deleted, over-provisioned redundancy, and per-request calls to somebody else's API.

## What it is

**Where the money actually goes.**

*Egress and cross-zone/cross-region transfer.* Bytes leaving the cloud, and often bytes crossing an availability zone, are billed. A chatty microservice architecture that ignores zone affinity can spend more on internal network transfer than on compute. Serving media straight from a bucket instead of through a CDN is the classic version of this bill.

*Storage that grows forever.* Logs, events, backups, old versions, embeddings. Nobody deletes anything and the line grows monotonically. Retention policies and lifecycle rules to colder tiers are the fix, and they need deciding at design time because it's much harder to argue for deletion later.

*Idle capacity.* Provisioning for peak means paying for peak all night. Autoscaling, spot/preemptible instances for interruptible work, and serverless for spiky low-volume workloads are the levers — each with its own tradeoff.

*Managed services.* You pay a multiple over raw infrastructure and get back the engineering time you'd have spent operating it. Almost always correct for a small team, and worth saying explicitly: an engineer costs more per year than a lot of RDS.

*Per-call third-party APIs*, which in AI products dominate everything else. Model inference is priced per token, so cost scales with usage in a way that compute doesn't, and a feature can be technically excellent and economically unviable. Cost per request becomes a design input on the same footing as latency.

**Design levers that are also cost levers.** Caching cuts both latency and spend. Batching amortises fixed per-call overhead. Compression trades CPU for transfer. Moving work to the client removes it from your bill. Choosing a smaller model, or routing only hard requests to the expensive one, is the AI-specific version of the same move.

**The number to carry:** cost per request, or per user per month. Once you have it, decisions that were arguments about taste become arithmetic — and it's the number a hiring manager will be delighted you thought about.

## Why it matters

Senior engineers get asked to justify architecture to people who look at the bill, and at AI-forward companies gross margin is a live engineering concern rather than a finance one — inference cost is often the largest variable cost in the product. Raising cost unprompted in a design round is a distinguishing signal, and it's rarer than raising performance.

## Key points

- Data transfer — egress, cross-region, and often cross-zone — is a bigger bill than most designs expect.
- Storage grows monotonically unless retention and lifecycle policies are decided up front.
- Provisioning for peak means paying for peak continuously; autoscaling and spot capacity are the levers.
- Managed services cost a multiple of raw infrastructure and are usually still cheaper than the engineer.
- In AI products, per-token inference cost dominates and scales directly with usage.
- Caching, batching, compression and model routing are latency levers and cost levers simultaneously.
- Carry a cost-per-request figure; it converts architecture arguments into arithmetic.
