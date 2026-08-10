---
title: State Updates & Batching
summary: Why state looks stale inside the function that set it, when updates are batched, and when to reach for the updater form.
level: core
minutes: 20
order: 7
tags: [react, state, rendering]

related:
  - frontend/react/react-mental-model
  - frontend/react/usereducer-and-ui-state-machines
  - frontend/react/when-components-rerender

resources:
  - title: Queueing a series of state updates
    url: https://react.dev/learn/queueing-a-series-of-state-updates
    source: react.dev
    type: docs
    minutes: 20
    primary: true
  - title: State as a snapshot
    url: https://react.dev/learn/state-as-a-snapshot
    source: react.dev
    type: docs
    minutes: 15
  - title: Automatic batching for fewer renders in React 18
    url: https://github.com/reactwg/react-18/discussions/21
    source: React 18 Working Group
    type: article
    minutes: 15
  - title: useState
    url: https://react.dev/reference/react/useState
    source: react.dev
    type: docs
    minutes: 20
---

## In one line

A state variable is a snapshot fixed for the duration of a render, and setters queue updates that React applies in a batch before the next render — so reading the value right after setting it gives you the old one, by design.

## What it is

`setCount(count + 1)` does not assign to `count`. `count` is a `const` captured by this render's closure, and it will hold the same value until the component runs again. The setter enqueues an update and schedules a re-render; the new value only exists in the next call of the function.

This is why calling `setCount(count + 1)` three times in one handler increments by one. All three read the same snapshot — say `0` — and all three enqueue "set to 1". The updater form `setCount(c => c + 1)` enqueues a function instead, and React applies them in order against the running result, giving 3. The rule of thumb: pass a value when the next state is independent of the current one, pass an updater when it derives from it.

Batching is the other half. React collects the updates fired during one event and performs a single re-render at the end, rather than one per setter. Since React 18 this is automatic everywhere — event handlers, promises, `setTimeout`, native event callbacks — where React 17 only batched inside its own event handlers, which is why `await`-then-`setState` used to render twice.

Two escape hatches exist. `flushSync` forces a synchronous re-render and commit, for the rare case where you must read layout after an update in the same tick; it costs you the batching and should be treated as a last resort. And a setter called with a value equal to the current one lets React bail out — though it may still re-render the component once before deciding to stop, so it is not a substitute for not setting state.

Objects and arrays follow from the same model: React compares with `Object.is`, so mutating and passing the same reference changes nothing on screen. Replace, don't mutate.

## Why it matters

"Why is my state one step behind?" is the single most common React question, and the answer is the model, not a workaround. Reaching for a ref to hold the "real" value, or an effect to log it after, are the two classic wrong turns — both appear in take-homes and both are cheap to fix once you can say why.

The batching change is also standard React 18 migration trivia: an interviewer asking what changed in 18 expects automatic batching alongside concurrent rendering.

## Key points

- State read during a render is a snapshot for that render; setters do not mutate it and never make the new value visible synchronously.
- `setX(x + 1)` called three times in a handler increments once; `setX(c => c + 1)` increments three times.
- Use the updater form whenever the next value derives from the previous one, especially inside async callbacks that captured an old snapshot.
- React 18 batches updates from every source, not just React event handlers, which removed a class of double renders.
- `flushSync` opts out of batching for synchronous DOM reads and should be rare — it costs the batch and forces a commit.
- Updates are compared with `Object.is`, so a mutated object with the same reference will not produce a visible update.
