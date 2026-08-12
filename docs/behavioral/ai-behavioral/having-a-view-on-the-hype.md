---
title: Having a View on the Hype
summary: The founder round asks what you think AI is actually good for, and the only failing answers are the two unexamined ones at either end.
level: core
minutes: 18
order: 3
tags: [ai, product-sense, judgement]

related:
  - ai/ai-product-thinking/when-not-to-use-an-llm
  - behavioral/the-reverse-interview/diligence-on-an-ai-startup
  - behavioral/ai-behavioral/the-ai-experience-question

resources:
  - title: The bitter lesson of AI product development
    url: https://www.oreilly.com/radar/what-we-learned-from-a-year-of-building-with-llms-part-ii/
    source: O'Reilly Radar
    type: article
    minutes: 30
    primary: true
  - title: Things we learned about LLMs in 2024
    url: https://simonwillison.net/2024/Dec/31/llms-in-2024/
    source: Simon Willison
    type: article
    minutes: 30
  - title: AI is a normal technology
    url: https://knightcolumbia.org/content/ai-as-normal-technology
    source: Narayanan & Kapoor
    type: article
    minutes: 45
---

## In one line

Come with a specific, defensible opinion about where models are genuinely useful and where they aren't, grounded in something you've actually built or used.

## What it is

The founder or hiring-manager round at an AI company usually includes some version of: what do you think is overhyped? what would you build with this? what's hard about our problem? They're not testing agreement — they're testing whether you think about this domain at all when nobody's asking.

**The two failing answers** are symmetrical. Uncritical enthusiasm — "agents will do everything within a year" — signals you'll build things that don't work and won't notice. Blanket dismissal — "it's autocomplete, it's all hype" — signals you'll be a drag on the roadmap at a company whose entire premise you don't believe. Both are positions adopted rather than reached.

**What a good answer looks like** is a distinction with a reason behind it. For example: models are extremely good where the output is checkable, cheap to reject, and has a human in the loop — drafting, extraction, classification with a review step, code with tests. They're weak where an error is silent and expensive, where you need a guarantee rather than a probability, or where the value depends on being right every time with no verification path. That framing survives follow-ups because it's mechanical rather than tribal, and it points at design decisions.

**Have a live example each way.** One thing you were surprised worked, one thing you expected to work and didn't. Specificity is the whole signal here — everyone has takes, few have observations.

**Do the homework on their product.** "You're betting that X is checkable enough to automate; the thing I'd be nervous about is Y" is the answer that gets you the offer, because it's the conversation their team is already having. It requires an hour with their docs, their blog, and their product beforehand.

**Stay current.** The field moves fast enough that a two-year-old take reads as stale — capabilities that were genuinely impossible when you last checked may be routine now, and "that doesn't work" is a claim with an expiry date.

## Why it matters

For senior roles at product companies, judgement about what to build is a large fraction of the value, and the founder round exists to sample it. It's also the round where preparation is most visible: an opinion formed from having used the things beats one assembled from headlines, and the difference is obvious in two follow-ups.

## Key points

- Both uncritical enthusiasm and blanket dismissal fail; each reads as an unexamined position.
- Anchor the view in a mechanism: verifiability, cost of a silent error, whether a human reviews the output.
- Bring one thing that surprised you by working and one that didn't work as expected.
- Specific observations from things you've built beat general takes assembled from posts.
- Read the company's product and blog first, and bring a real question about their bet.
- Naming what you're nervous about in their approach is a strength, not a risk, if it's specific and non-hostile.
- Keep the view current; "models can't do X" ages badly and quickly.
