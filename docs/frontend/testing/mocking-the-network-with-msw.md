---
title: Mocking the Network with MSW
summary: Intercepting requests at the network layer instead of stubbing fetch, so the same handlers serve tests, development and demos.
level: core
minutes: 20
order: 5
tags: [testing, msw, network]

related:
  - frontend/testing/component-testing-with-rtl
  - frontend/testing/test-data-and-factories
  - frontend/state-and-data/api-contracts-and-end-to-end-types

resources:
  - title: Mock Service Worker
    url: https://mswjs.io/docs/
    source: MSW
    type: docs
    minutes: 25
    primary: true
  - title: Stop mocking fetch
    url: https://kentcdodds.com/blog/stop-mocking-fetch
    source: Kent C. Dodds
    type: article
    minutes: 15
  - title: Service Worker API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
    source: MDN
    type: docs
    minutes: 30
---

## In one line

MSW intercepts requests at the network boundary — a service worker in the browser, an interceptor in Node — so your application code runs completely unmodified and unaware it is being tested.

## What it is

The alternative it replaces is stubbing `fetch` or mocking the API module. Both couple the test to how the request is made: swap `fetch` for `axios`, or move the call into a query hook, and every test breaks even though behaviour did not change. Worse, they let a test pass against a request shape the server would reject, because nothing checks the URL, method, or body.

Intercepting at the network layer avoids all of it. Handlers are written per endpoint — `http.get('/api/users', () => HttpResponse.json([...]))` — and they see the real request, so a wrong method or a malformed body shows up as a miss rather than a false pass.

**The handlers are reusable across contexts**, which is the underrated benefit. The same set powers unit and integration tests, local development against an API that does not exist yet, Storybook stories with realistic data, and demo environments. One definition of the backend's behaviour instead of four divergent ones.

**Per-test overrides** are how you exercise the interesting paths: a base set of happy-path handlers in setup, and `server.use(...)` inside a test to make one endpoint return a 500, a 401, an empty list, or a slow response. That makes error-state testing as cheap as happy-path testing, which is usually the difference between having error tests and not.

Two setup details matter. **Reset handlers between tests** (`afterEach(() => server.resetHandlers())`) or overrides leak and produce order-dependent failures. And **configure `onUnhandledRequest: 'error'`** so a request you did not mock fails loudly instead of hitting the real network and passing intermittently.

**Keep handlers honest.** A mock that returns a shape the API never produces gives false confidence. Deriving handlers from the same OpenAPI or Zod schema the client uses closes that gap, and contract tests against the real API close the rest.

The boundary: MSW is for tests, development and demos. End-to-end tests over critical journeys should hit a real backend, because the point of those is to verify the integration that mocking removes.

## Why it matters

Network mocking is required for any realistic component test, and doing it at the wrong layer is what makes suites brittle across refactors.

Reviewers notice: `jest.mock('./api')` scattered through a test file reads as an older approach, and MSW handlers read as current practice.

## Key points

- Intercept at the network boundary so application code is unchanged and unaware.
- Stubbing `fetch` or the API module couples tests to the request mechanism and hides wrong request shapes.
- One handler set serves tests, local development, Storybook, and demos.
- Override per test with `server.use` to make error, empty, and slow states cheap to cover.
- Reset handlers between tests, or overrides leak and cause order-dependent failures.
- Set `onUnhandledRequest: 'error'` so unmocked requests fail loudly.
- Derive handlers from the shared schema; end-to-end tests should still hit a real backend.
