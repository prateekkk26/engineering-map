---
title: What to look for in a review
summary: Read the change in priority order — design, then correctness, then failure modes, then naming — and stop arguing about anything a tool could enforce.
level: core
minutes: 22
order: 2
tags: [code-review, quality, security]

related:
  - practices/code-review/what-code-review-is-for
  - practices/working-with-ai-tools/reviewing-ai-generated-code
  - frontend/security/xss-and-output-encoding

resources:
  - title: What to look for in a code review
    url: https://google.github.io/eng-practices/review/reviewer/looking-for.html
    source: Google
    type: docs
    minutes: 15
    primary: true
  - title: Navigating a CL in review
    url: https://google.github.io/eng-practices/review/reviewer/navigate.html
    source: Google
    type: docs
    minutes: 8
  - title: How to Do Code Reviews Like a Human
    url: https://mtlynch.io/human-code-reviews-1/
    source: Michael Lynch
    type: article
    minutes: 20
---

## In one line

Start with the design and the tests, not the first file GitHub shows you, and spend your attention where a mistake would be expensive to undo.

## What it is

Order matters because attention is finite. Read the description and the **design** first: is this in the right place, does it belong at this layer, does it duplicate something that exists, is the abstraction pulling its weight? Design mistakes are the only ones that get more expensive over time — a wrong name is a five-minute fix in a year, a wrong boundary is a quarter.

Then find the file with the core logic and read that before the periphery, which is what `navigate` in Google's guide is about. Once you understand the change, check **correctness**: the edge cases the author didn't mention, off-by-ones, null and empty states, concurrency where two of these could run at once, and what happens on the unhappy path — errors swallowed, retries that aren't idempotent, timeouts absent.

Then the categories that are easy to skip and expensive to miss:

- **Security** — untrusted input reaching a sink (SQL, HTML, shell, file paths), authorisation checked at the right layer rather than in the UI, secrets not committed, new dependencies actually needed and maintained.
- **Data** — migrations that are backwards-compatible with the currently-running code, queries that will do a sequential scan at production row counts, N+1s introduced by an innocent-looking loop.
- **Operability** — will you be able to tell this broke? Logs at the right level, a metric or trace on a new external call, an alert if this path silently fails.
- **Tests** — do they test behaviour or implementation, would they fail if the change were wrong, and does the diff include a test that would have caught the bug being fixed?

Then naming, comments, and readability — real, and worth commenting on, but not worth blocking a change with. And nothing at all about formatting: that's the formatter's job.

Two questions worth asking on every substantial diff: *what's the blast radius if this is wrong in production*, and *how would we undo it*. Those two decide how carefully you read the rest.

## Why it matters

The take-home and practical rounds are frequently scored by exactly this list — reviewers look for error and loading states, edge cases, and whether the tests are meaningful. And in a deep-dive round, describing what you look for when reviewing is one of the fastest ways to demonstrate you've operated real systems rather than just built features.

## Key points

- Review in priority order: design, core logic, correctness, failure modes, tests, then naming.
- Design problems are the only ones that get more expensive with time — spend the attention there.
- Check the unhappy path explicitly: errors, timeouts, retries, partial failure, empty and null states.
- Untrusted input reaching a sink and authorisation enforced only in the UI are the two security defects most often waved through.
- Migrations must be compatible with the code currently deployed, not just the code in the diff.
- Ask whether a failure would be observable at all, and whether the change can be undone.
- Tests should fail when the behaviour is wrong; a test that mirrors the implementation proves nothing.
- Never comment on formatting — if it's arguable, the tooling is misconfigured.
