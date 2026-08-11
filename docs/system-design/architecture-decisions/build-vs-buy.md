---
title: Build vs Buy
summary: Deciding what to own — the real cost of building, the real cost of depending, and the question that settles most cases.
level: core
minutes: 20
order: 4
tags: [architecture, tradeoffs, cost]

related:
  - system-design/architecture-decisions/designing-under-constraints
  - system-design/scalability/what-scale-actually-costs
  - system-design/architecture-decisions/architecture-decision-records

resources:
  - title: Choose Boring Technology
    url: https://mcfunley.com/choose-boring-technology
    source: Dan McKinley
    type: article
    minutes: 20
    primary: true
  - title: The Cost of Cloud, a Trillion Dollar Paradox
    url: https://a16z.com/the-cost-of-cloud-a-trillion-dollar-paradox/
    source: Andreessen Horowitz
    type: article
    minutes: 25
  - title: Innovation Tokens
    url: https://boringtechnology.club/
    source: Dan McKinley
    type: article
    minutes: 20
---

## In one line

Build what your product is differentiated by; buy everything else — and remember that the cost of building is the ongoing maintenance, not the initial implementation.

## What it is

**The question that settles most cases:** is this a differentiator, or is it table stakes? Auth, email delivery, payment processing, error tracking, feature flags, log aggregation — nobody chooses your product because you implemented these yourself. The core domain logic, the thing your customers actually pay for, is the thing to own outright.

**The real cost of building** is not the two weeks to a working version. It's the edge cases discovered over two years, the security patches, the on-call rotation, the documentation, the person who has to learn it when the author leaves, and every hour spent on it that wasn't spent on the product. Vendors amortise all of that across every customer.

**The real cost of buying** is also more than the invoice: integration effort, a data model that isn't quite yours, per-seat or per-event pricing that scales unpleasantly, an availability dependency you don't control, a compliance and data-processing review, and lock-in that makes leaving expensive. Pricing changes and acquisitions are real risks with real precedent.

**Where the cost lands matters organisationally.** Buying is opex on someone's budget line; building is engineering headcount that's already paid for and therefore looks free. It isn't — an engineer's fully-loaded cost dwarfs most SaaS bills — but the accounting makes buying feel more expensive than it is, and naming that is a mature observation.

**Open source is the third option**, and it's build-shaped, not buy-shaped: no licence fee, and you own the operating, upgrading and debugging. Self-hosting a database or a queue is a real commitment. The managed version of the same open-source component is usually the right middle.

**Make it reversible.** Whatever you choose, put it behind your own interface so swapping the implementation is a contained change rather than a migration. That single move turns a hard-to-reverse decision into a soft one, and it's cheap when done at the start.

**The heuristics that hold up.** Buy when it's a solved commodity problem and integration is straightforward. Build when it's your differentiator, when no vendor fits a genuinely unusual requirement, when the data can't leave your infrastructure, or when the pricing curve becomes untenable at your projected scale. Start bought and build later if it becomes a bottleneck — that ordering is almost always cheaper than the reverse.

**Prefer boring technology.** Every unfamiliar component costs learning, operational surprise and hiring difficulty. Spend that budget on the parts of the system that are actually novel.

## Why it matters

Hiring managers ask this because it reveals whether you optimise for engineering interest or for shipping. The unsophisticated answer builds everything because it's more fun; the sophisticated one names the differentiator, buys the rest, and puts an interface in front so the decision can be revisited.

## Key points

- Build your differentiator; buy the commodity. Nobody buys your product for its email delivery.
- The cost of building is years of maintenance, not the first implementation.
- The cost of buying includes integration, pricing curves, availability dependency and lock-in.
- Engineering time looks free because it's already budgeted; it's usually the more expensive option.
- Self-hosted open source is a build decision — managed open source is the usual middle ground.
- Put your own interface in front of the choice so it stays reversible.
- Start with the bought option and build later if it becomes a genuine bottleneck.
- Spend novelty budget only where the problem is actually novel.
