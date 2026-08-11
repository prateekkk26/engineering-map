---
title: Resilient UI & Error Handling
summary: Designing for partial failure so one broken widget does not take the page, and errors reach someone who can act.
level: core
minutes: 25
order: 11
tags: [architecture, errors, reliability]

related:
  - frontend/react/error-boundaries
  - frontend/nextjs/error-and-not-found-handling
  - frontend/architecture/frontend-observability

resources:
  - title: Error boundaries
    url: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    source: react.dev
    type: docs
    minutes: 20
    primary: true
  - title: Resilient web design
    url: https://resilientwebdesign.com/
    source: Jeremy Keith
    type: book
  - title: Error handling
    url: https://nextjs.org/docs/app/getting-started/error-handling
    source: Next.js
    type: docs
    minutes: 25
---

## In one line

Assume every dependency will fail and decide in advance what the page looks like when it does — a resilient UI degrades in pieces rather than going blank.

## What it is

Start by enumerating what can fail, because the list is longer than "the API is down": a single request 500s or times out, the network drops mid-session, a third-party script fails to load, a chunk 404s after a deploy, the response is valid JSON with an unexpected shape, and a component throws while rendering.

**Boundaries decide the blast radius.** An error boundary per independently failing region — a dashboard panel, a third-party embed, a route — keeps a failure local while the shell, navigation and everything else stay usable. One boundary at the root is a nicer white screen. This is the same placement discipline as Suspense, and the two usually pair.

**Design the states, all four.** Loading, empty, error, and success are each a real design, and the last three are the ones that get skipped. An empty state that says nothing, or an error that says "Something went wrong", is where most products lose trust. A good error says what failed, whether it is the user's problem, and what to do next.

**Retries need judgement.** Retry idempotent reads with exponential backoff and jitter; do not silently retry a payment. Distinguish transient failures (network, 5xx, timeout) from permanent ones (400, 403, 404) — retrying a 403 wastes time and confuses the user.

**Chunk-load failures after deploy** are the specific frontend one worth naming: a user on an old build requests a chunk that no longer exists. Catch the dynamic import failure and prompt a reload rather than showing a stack trace.

**Never lose user input.** A failed submit must preserve what was typed, and a long form deserves draft persistence. Losing a paragraph to a network blip is the failure users remember.

Then the operational half: **report errors with context** — user, route, release, and a correlation id — because a stack trace with no context is unactionable, and production stacks are minified without uploaded source maps. Sample high-volume noise, alert on rate rather than on individual events, and route alerts to someone who can actually fix the thing.

## Why it matters

Reviewers score take-homes on loading, error and empty states explicitly, and the difference between an app that degrades and one that blanks is largely boundary placement.

In interviews, "what happens when this request fails?" is a routine follow-up, and the strong answer covers scope, the four states, retry policy, and reporting.

## Key points

- Enumerate the failure modes — including chunk 404s after deploy and valid-but-wrong response shapes.
- Place error boundaries per independently failing region; a single root boundary is just a nicer blank page.
- Design loading, empty, error, and success as four real states, with errors that say what to do next.
- Retry idempotent reads with backoff and jitter; never silently retry a mutation.
- Distinguish transient from permanent failures — a retried 403 helps nobody.
- Catch chunk-load failures and prompt a reload rather than surfacing a stack trace.
- Preserve user input on every failure path, and report errors with user, route, release, and correlation id.
