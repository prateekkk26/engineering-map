---
title: Communicating with non-engineers
summary: Translate technical facts into consequences the listener already cares about — cost, risk, timing, user impact — and give options instead of verdicts.
level: core
minutes: 18
order: 5
tags: [communication, influence, behavioral]

related:
  - practices/quality-and-tech-debt/making-the-case-for-paydown
  - practices/incident-response/triage-and-severity
  - practices/technical-communication/async-updates-and-visibility

resources:
  - title: Technical Writing Two — Writing for a technical audience
    url: https://developers.google.com/tech-writing/two
    source: Google
    type: course
    minutes: 90
    primary: true
  - title: The Pyramid Principle
    url: https://www.barbaraminto.com/
    source: Barbara Minto
    type: book
  - title: Is High Quality Software Worth the Cost?
    url: https://martinfowler.com/articles/is-quality-worth-cost.html
    source: Martin Fowler
    type: article
    minutes: 20
---

## In one line

Nobody outside engineering wants the mechanism; they want to know what it costs, what it risks, when it lands, and what they have to decide.

## What it is

The core move is **translation to consequence**. "We have a race condition in the payment webhook" is a fact about code. "A small number of customers get charged twice; it's happening about five times a week; fixing it properly takes four days, and until then we're refunding manually" is the same fact in the currency the room uses. The technical detail isn't hidden — it just isn't the headline.

**Lead with the answer** (Minto's pyramid): conclusion first, then the two or three reasons, then detail only for whoever asks. Engineers instinctively build up to the conclusion because that's how the investigation went, and it consistently loses the room.

**Offer options with tradeoffs, not a verdict.** "We can ship Tuesday without the CSV export, ship the full scope the following Monday, or ship Tuesday with a manual export process that costs support about an hour a day" gives a product manager a decision they're qualified to make. "It's not ready" gives them a problem. Attach your recommendation — being asked for one and not having it is worse than being wrong.

**Estimates need their uncertainty made explicit and legible**: "three to five days if the vendor API works as documented; if it doesn't, we won't know for two days and it becomes two weeks." Ranges plus the specific unknown that drives them are trusted, because they let someone plan around the risk instead of discovering it.

Analogies are useful and dangerous — good for building intuition, bad if the listener starts reasoning from them past their limits. Use one, say where it breaks, move on. Same with jargon: it's fine when it's shared vocabulary, and it's exclusion when it isn't. Watch for the acronyms you've stopped noticing.

During incidents, the register changes again: impact, who's affected, what's being done, next update time. No causes, no speculation, no ETA you're not confident in — an ETA you miss costs more trust than the outage did.

## Why it matters

The founder and hiring-manager rounds are largely testing this — can this person be trusted in front of a customer, and do they make engineering decisions legible to the business? Miscommunicated risk is also the underlying cause of most "engineering and product don't get along" situations, which is a problem senior engineers are expected to prevent.

## Key points

- Translate technical facts into cost, risk, timing, or user impact before saying anything else.
- Lead with the conclusion, then a couple of reasons, then detail on request.
- Present options with tradeoffs and include your recommendation.
- Give estimates as ranges tied to the specific unknown driving the uncertainty.
- Use an analogy to build intuition, then say explicitly where it stops holding.
- Jargon is fine only when it's genuinely shared; audit the acronyms you no longer notice.
- In incidents, communicate impact and next steps, never causes or unreliable ETAs.
- A missed ETA damages trust more than the original problem did.
