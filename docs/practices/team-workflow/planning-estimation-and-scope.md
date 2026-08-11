---
title: Planning, estimation & scope
summary: Estimates are forecasts under uncertainty, so give ranges with their driving unknown, and cut scope rather than quality when the date is fixed.
level: core
minutes: 20
order: 2
tags: [planning, communication, process]

related:
  - practices/technical-communication/communicating-with-non-engineers
  - practices/team-workflow/shipping-incrementally
  - practices/quality-and-tech-debt/making-the-case-for-paydown

resources:
  - title: Shape Up
    url: https://basecamp.com/shapeup
    source: Ryan Singer
    type: book
    primary: true
  - title: Purpose Of Estimation
    url: https://martinfowler.com/bliki/PurposeOfEstimation.html
    source: Martin Fowler
    type: article
    minutes: 8
  - title: The Cone of Uncertainty
    url: https://www.construx.com/books/the-cone-of-uncertainty/
    source: Construx
    type: article
    minutes: 10
---

## In one line

You cannot know how long unfamiliar work takes, so the job is to make the uncertainty visible and to keep something shippable at every point along the way.

## What it is

Estimates fail predictably: the parts you understand get estimated well and the parts you don't get estimated at all, because you don't know they exist. The cone of uncertainty describes the shape — early estimates are off by multiples, and the only reliable way to narrow the range is to learn more by building. That's why a **spike** (a timeboxed investigation with a written conclusion) is usually a better response to "how long?" than a number pulled from optimism.

What makes an estimate usable: a **range plus the unknown that drives it**. "Three to five days; if the vendor's webhook doesn't support replay, add a week and we won't know for two days." That lets someone plan around risk instead of discovering it. A single confident number is more likely to be wrong and much more likely to be trusted, which is the worst combination.

**Shape Up's inversion** is the most useful idea here: fix the time and vary the scope. Give the work an appetite — "this is worth six weeks" — and design to fit it, rather than specifying fully and estimating. It reframes the conversation from "when will it be done?" to "what's the best version we can ship by then?", which is the question that actually has an answer.

When a date is genuinely fixed, the levers are **scope, quality, and people**, and only one of them is safe. Adding people late slows a project down; cutting quality borrows against the same quarter. **Cut scope** — and cut it into something coherent that ships, not a shell of everything. Deciding in advance which slices are droppable is what makes it possible to do this calmly on the day.

Two habits that pay: **decompose until the pieces are boring** — anything estimated at more than a few days is hiding something, and breaking it down is the estimate — and **re-forecast out loud when you learn something**, early. A schedule slip communicated in week one is a planning input; the same slip in week six is a crisis.

## Why it matters

"How do you estimate?" and "what do you do when you're going to miss a deadline?" are common hiring-manager questions, and both are really about honesty under pressure. The strong answer involves ranges, early signalling, and cutting scope deliberately rather than quietly cutting quality.

## Key points

- Estimation error comes mostly from work you haven't discovered yet, not from mis-sizing known work.
- Give a range with the specific unknown driving it, not a single confident number.
- A timeboxed spike with a written outcome beats guessing at an unfamiliar problem.
- Fixing time and varying scope produces better conversations than fixing scope and estimating time.
- Decompose until pieces are a few days at most; anything larger is concealing unknowns.
- When the date is fixed, cut scope into something coherent — adding people late makes it later.
- Decide in advance which slices are droppable so the cut is calm rather than panicked.
- Communicate slips as soon as you believe them; a late warning converts a plan change into a crisis.
