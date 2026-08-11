---
title: Testing Async & Suspense
summary: Waiting correctly for things that resolve later, and the specific patterns for Suspense, transitions and streamed UI.
level: deep
minutes: 20
order: 6
tags: [testing, async, suspense]

related:
  - frontend/testing/component-testing-with-rtl
  - frontend/react/suspense-and-streaming
  - frontend/testing/flaky-tests-and-determinism

resources:
  - title: Async Methods
    url: https://testing-library.com/docs/dom-testing-library/api-async/
    source: Testing Library
    type: docs
    minutes: 20
    primary: true
  - title: act
    url: https://react.dev/reference/react/act
    source: react.dev
    type: docs
    minutes: 15
  - title: Fake timers
    url: https://vitest.dev/api/vi.html#vi-usefaketimers
    source: Vitest
    type: docs
    minutes: 15
---

## In one line

Assert on the state you expect to arrive rather than waiting a fixed time — `findBy` and `waitFor` poll until the condition holds, which is both faster and immune to timing variation.

## What it is

The wrong pattern is a sleep. `await new Promise(r => setTimeout(r, 100))` is simultaneously too long on a fast machine and too short on a loaded CI runner — the definitive recipe for a flaky test.

The right primitives are small. **`findBy*`** queries retry until the element appears or the timeout expires, and are the correct tool for "this shows up after the request resolves". **`waitFor`** retries an arbitrary assertion for cases where a query is not enough. **`waitForElementToBeRemoved`** is the explicit way to assert a spinner went away, and reads better than a negative query race.

Three rules keep these reliable. Put **one assertion inside `waitFor`**, not a block of several — a multi-assertion callback retries all of them and reports a confusing failure. Do not put **side effects** inside `waitFor`, since the callback runs repeatedly. And prefer `findBy` to `waitFor` wrapping a `getBy`, which is the same thing with more ceremony.

**Suspense** testing is mostly boundary placement: render the component inside its boundary, assert the fallback is present, then `findBy` the real content once the promise resolves. Testing the component without its boundary produces a confusing throw rather than a useful failure.

**Transitions** introduce a deliberate intermediate state. With `useTransition`, the old content stays visible with a pending indicator, so the assertion sequence is: old content still present, pending indicator visible, then new content — rather than a straight swap.

**Fake timers** are for debounce, throttle, polling, and timeouts, where waiting for real time makes the suite slow. Advance them explicitly, and remember that `userEvent` needs to be configured with the fake-timer advance function or its internal delays will hang. Always restore real timers afterwards.

**Cleanup between tests** is where async bugs leak: an in-flight request or an unresolved promise from one test can resolve during the next and produce an update on an unmounted component. Abort in cleanup and reset mock handlers.

Finally, **`act` warnings mean something**. They indicate a state update happened outside React's knowledge — usually a genuine missing `await`, not noise to be suppressed by wrapping the whole test in `act`.

## Why it matters

Almost everything in a real UI is asynchronous, and async handling is the single largest source of flaky frontend tests — which are worse than no tests, because they train the team to re-run.

Suspense and transitions are increasingly common, and their intermediate states are exactly what a naive test misses.

## Key points

- Never sleep for a fixed duration; poll for the expected condition with `findBy` or `waitFor`.
- One assertion per `waitFor`, and no side effects inside the callback.
- `waitForElementToBeRemoved` is the clean way to assert a loading state ended.
- Test suspending components inside their boundary — fallback first, then `findBy` the content.
- Transitions keep old content visible with a pending flag; assert that sequence rather than a swap.
- Use fake timers for debounce and polling, configure `userEvent` for them, and restore afterwards.
- Abort in-flight work between tests, and treat `act` warnings as real missing awaits.
