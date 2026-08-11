---
title: Testing Server Components & Actions
summary: What can and cannot be unit tested in an RSC codebase, and where the coverage should actually go.
level: deep
minutes: 20
order: 7
tags: [testing, rsc, nextjs]

related:
  - frontend/react/react-server-components
  - frontend/nextjs/server-actions
  - frontend/testing/e2e-with-playwright

resources:
  - title: Testing
    url: https://nextjs.org/docs/app/guides/testing
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: Playwright
    url: https://playwright.dev/docs/intro
    source: Playwright
    type: docs
    minutes: 30
  - title: Vitest
    url: https://vitest.dev/guide/
    source: Vitest
    type: docs
    minutes: 25
---

## In one line

Async server components are not reliably unit-testable today, so the practical strategy is to extract the logic, test that directly, and cover the rendered result end-to-end.

## What it is

The tooling gap is real and worth stating plainly: React Testing Library cannot render an async server component in jsdom, because there is no client runtime to await it and no server environment to run it in. Next's own guidance points at end-to-end tests for these, and pretending otherwise produces tests that mock so much they verify nothing.

**So extract.** A server component should be a thin composition: call a data function, render markup. Put the fetching and shaping in a plain async function, unit-test that with the database or API mocked, and let the component be trivial enough that its correctness is visible. This is good structure independent of testing, which is the usual sign that a testing constraint is pointing at a design improvement.

**Server actions test well**, because they are just async functions. Import the action, call it with a `FormData` or plain arguments, and assert the returned value and the side effect. The cases that matter are the ones the UI cannot show you: unauthenticated caller, authenticated but unauthorised caller, invalid input, and the happy path. Since an action is a public endpoint, those authorisation tests are security tests and belong in the suite.

**Client components inside an RSC app test normally** with Testing Library — they are ordinary React. The seam to cover is the boundary: what the server passes down, and whether the client component handles the shapes it can receive.

**Route handlers** are also straightforward: construct a `Request`, call the exported `GET` or `POST`, assert the `Response`. Web standards make them testable without a framework harness.

**End-to-end carries the rest.** Playwright against a running app verifies the composed page — server render, streamed content, hydration, and the action round trip — which is exactly the part unit tests cannot reach.

Two things worth asserting explicitly at that level, because they are easy to break and invisible otherwise: that the page renders usefully **before hydration** (disable JavaScript and check the content is there), and that a server action **works from a form without JavaScript**, which is the progressive-enhancement guarantee people claim and rarely verify.

## Why it matters

Every App Router codebase hits this, and the common outcome is either no coverage for server-rendered paths or a pile of heavily-mocked tests that pass regardless of behaviour.

The authorisation tests for server actions are the highest-value tests in the whole suite, because that is where a real vulnerability lives.

## Key points

- Async server components cannot be reliably unit-tested today; do not fake it with heavy mocking.
- Extract data fetching into plain functions, test those, and keep the component a thin composition.
- Server actions are async functions — test them directly, especially the unauthenticated and unauthorised paths.
- Client components inside an RSC app test normally; cover the boundary shapes they receive.
- Route handlers take a `Request` and return a `Response`, so they test without a harness.
- Use Playwright for the composed page: server render, streaming, hydration, and action round trips.
- Assert the no-JavaScript path explicitly — it is the progressive-enhancement claim nobody verifies.
