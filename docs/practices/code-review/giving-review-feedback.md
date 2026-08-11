---
title: Giving review feedback
summary: Say what and why, mark what's optional, ask instead of asserting when you might be wrong, and get the first response back fast.
level: core
minutes: 18
order: 3
tags: [code-review, communication, collaboration]

related:
  - practices/code-review/receiving-feedback-and-disagreement
  - practices/code-review/what-code-review-is-for
  - practices/technical-communication/async-updates-and-visibility

resources:
  - title: How to write code review comments
    url: https://google.github.io/eng-practices/review/reviewer/comments.html
    source: Google
    type: docs
    minutes: 10
    primary: true
  - title: Speed of code reviews
    url: https://google.github.io/eng-practices/review/reviewer/speed.html
    source: Google
    type: docs
    minutes: 10
  - title: How to Make Your Code Reviewer Fall in Love with You
    url: https://mtlynch.io/code-review-love/
    source: Michael Lynch
    type: article
    minutes: 20
---

## In one line

Comment on the code rather than the person, explain the reasoning behind the request, and label whether it blocks — most review friction is ambiguity about whether a comment must be acted on.

## What it is

Three habits do most of the work.

**Give the reasoning, not just the instruction.** "Use a `Map` here" is an order; "this is O(n²) at the sizes we see on the dashboard page — a `Map` keyed by id makes it linear" is teaching, and it also exposes your assumption so the author can tell you it's wrong. Every comment that carries its *why* is one the author can either act on or refute without another round trip.

**Label the severity.** A widely-used convention prefixes comments: `nit:` for trivial and non-blocking, `question:` when you genuinely don't know, `suggestion:` for take-it-or-leave-it, and plain prose for things that must change. Without labels, authors treat every comment as mandatory, which turns a two-line typo note into a day of rework and quiet resentment. Say explicitly when something is a preference.

**Ask rather than assert when you might be missing context.** "What happens if this is called twice?" is better than "this is not idempotent" — you may be wrong, and if you're right the author reaches the conclusion themselves. It also avoids the failure mode where a confident reviewer is wrong and the author complies anyway.

Beyond phrasing: **respond fast**. Google's guidance is one business day maximum for a first response, and it's the right target — the cost of slow review is the author's context, not the reviewer's time. If a full review will take a while, say so immediately rather than leaving silence. And a partial review that unblocks the obvious parts beats a perfect review tomorrow.

Two more that change how review feels: say something positive when the change deserves it — a clean abstraction or a good test is worth a sentence, and it makes the critical comments land as craft rather than criticism. And know when to leave the thread: if two rounds haven't converged, a five-minute call resolves what fifteen more comments will not. Write the outcome back in the thread afterwards so the decision is recorded.

## Why it matters

Review is where most day-to-day team friction originates, and the behavioural round asks about it directly — "tell me about a disagreement with a colleague" is very often a code-review story. Being able to describe how you make feedback actionable and non-personal is a straightforward senior signal.

## Key points

- Attach reasoning to every request so the author can act on it or correct you without another round trip.
- Label non-blocking comments explicitly (`nit:`, `suggestion:`) — unlabelled comments read as mandatory.
- Phrase uncertain observations as questions; you may be the one missing context.
- Comment on the code, never the author — "this function does X" not "you did X".
- A first response within a business day matters more than a thorough response later.
- Escalate to a call after two unresolved rounds, then record the outcome in the thread.
- Note what's good, not only what's wrong — it's what makes critical feedback land as craft.
