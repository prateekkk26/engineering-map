---
title: Testing Hooks & State
summary: When a hook deserves its own test, how to render one in isolation, and why most hook tests should be component tests.
level: core
minutes: 20
order: 4
tags: [testing, react, hooks]

related:
  - frontend/react/custom-hook-design
  - frontend/testing/component-testing-with-rtl
  - frontend/react/usereducer-and-ui-state-machines

resources:
  - title: renderHook
    url: https://testing-library.com/docs/react-testing-library/api/#renderhook
    source: Testing Library
    type: docs
    minutes: 15
    primary: true
  - title: Testing custom hooks
    url: https://kentcdodds.com/blog/how-to-test-custom-react-hooks
    source: Kent C. Dodds
    type: article
    minutes: 15
  - title: act
    url: https://react.dev/reference/react/act
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

Test a hook through a component that uses it by default, and reach for `renderHook` only when the hook is a standalone published unit with behaviour worth specifying directly.

## What it is

A hook exists to serve components, so a test that exercises it through one is testing the thing that ships. It also covers the integration — that the state updates actually re-render — which a direct hook test does not.

`renderHook` earns its place in two situations: a hook published from a shared library, where the hook itself is the public API; and a hook with enough branches (retry logic, a state machine, debouncing) that driving every path through a component would obscure the test.

Its API is small: `result.current` holds the latest return value, `rerender` re-runs with new props to test dependency changes, and `unmount` triggers cleanup so you can assert that listeners and timers were removed. State updates must be wrapped in `act` — or, more usually, performed through an async helper that wraps for you.

The recurring mistake is **destructuring `result.current`**. Capturing the value into a local means holding a stale snapshot; after an update, the local still points at the old render's value while `result.current` has moved on. Always read through `result.current` at assertion time.

**Timers and async** need the usual treatment: fake timers for debounce and interval logic, advanced deliberately, and `waitFor` to assert on an eventual value rather than an arbitrary sleep.

**A hook that needs context** — a query client, a router, a theme — takes a `wrapper` option, and it is worth building one shared wrapper rather than reconstructing providers per test.

Two judgement calls. **Reducers are better tested directly** than through `renderHook`: a reducer is a pure function, so assert state transitions without React involved and use the component test for the wiring. And **a hook that is hard to test** usually has too many responsibilities — the difficulty is information, not an obstacle.

Finally, **assert cleanup**. Unmount and check that the interval cleared, the listener detached, the request aborted. Missing cleanup is one of the most common real defects in hooks and one of the easiest to catch here.

## Why it matters

Custom hooks hold much of an application's logic, and the question of how to test them comes up in every codebase — usually answered by over-testing hooks in isolation and under-testing the integration.

It is also a common interview question, where the strongest answer is that most hook tests should be component tests.

## Key points

- Default to testing a hook through a component; that covers the re-render behaviour too.
- Use `renderHook` for published hooks and for genuinely branchy logic.
- Read `result.current` at assertion time — destructuring captures a stale snapshot.
- `rerender` tests dependency changes; `unmount` lets you assert cleanup ran.
- Use fake timers for debounce and interval logic rather than real waits.
- Provide context with a shared `wrapper` helper.
- Test reducers directly as pure functions; a hard-to-test hook is usually doing too much.
