---
title: Frontend Testing Strategy
summary: What to test at which level, why the pyramid was replaced by the trophy, and how to decide without dogma.
level: core
minutes: 25
order: 1
tags: [testing, strategy, architecture]

related:
  - _shared/testing-strategy
  - frontend/testing/component-testing-with-rtl
  - frontend/testing/e2e-with-playwright
  - frontend/testing/unit-testing-logic
  - frontend/testing/testing-server-components-and-actions

resources:
  - title: The Testing Trophy
    url: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
    source: Kent C. Dodds
    type: article
    minutes: 15
    primary: true
  - title: Write tests. Not too many. Mostly integration.
    url: https://kentcdodds.com/blog/write-tests
    source: Kent C. Dodds
    type: article
    minutes: 10
  - title: Testing Library guiding principles
    url: https://testing-library.com/docs/guiding-principles/
    source: Testing Library
    type: docs
    minutes: 10
---

## In one line

Confidence per unit of maintenance is the metric, and for frontend that puts the weight on integration tests rather than on a broad base of unit tests.

## What it is

The **pyramid** — many unit tests, fewer integration, few end-to-end — came from a world where unit tests were fast and everything else was slow and brittle. On the frontend it produces a specific failure: thousands of tests asserting that components render with given props, all passing, while the feature is broken because the pieces do not fit together.

The **trophy** reweights it: static analysis at the base (TypeScript and lint catch a real class of bugs for free), a modest layer of unit tests for genuine logic, the bulk in integration tests that render several components together with the network mocked, and a small number of end-to-end tests over the critical journeys.

The reason integration dominates is that most frontend bugs are integration bugs. A component in isolation rarely fails; what fails is the wiring — the wrong prop, the state that does not propagate, the request that fires twice, the error path nobody rendered.

**The guiding principle** does the deciding: *test the way a user uses the software*. Query by role and label rather than by test id, assert on visible output rather than internal state, and drive interactions through events rather than by calling handlers. A test written that way survives refactoring, which is the entire point — a test that breaks when you rename a state variable is a cost with no benefit.

**What to test at each level.** Unit: pure functions, formatters, reducers, non-trivial algorithms. Integration: a feature — the form submits, the list filters, the error shows. End-to-end: the few journeys where failure is unacceptable, run against a real backend. Static: everything, continuously, for free.

**What not to test**: implementation details, third-party libraries, trivial components with no logic, and generated code. Coverage percentage is a weak proxy — a hundred percent coverage of the happy path tells you nothing about the error states that actually break.

The honest framing for an interview: the right mix depends on the product. A design system needs more component and visual tests; a checkout flow needs more end-to-end. Naming that trade-off is a better answer than naming a ratio.

## Why it matters

Test strategy determines whether a suite gives confidence or consumes time, and a badly weighted suite is worse than a small one because it makes every refactor expensive.

"How do you decide what to test?" is a standard question, and the strong answer is about confidence per unit of maintenance rather than about a shape.

## Key points

- Optimise for confidence per unit of maintenance, not for a coverage number or a shape.
- The trophy weights integration highest because most frontend bugs are wiring bugs, not component bugs.
- Static analysis is the cheapest layer and catches a real class of defects continuously.
- Test as a user does: query by role and label, assert visible output, drive real events.
- Tests that assert implementation details break on refactor and provide no confidence in return.
- Unit for logic, integration for features, end-to-end for the few journeys that must not fail.
- The right mix depends on the product — a design system and a checkout need different weightings.
