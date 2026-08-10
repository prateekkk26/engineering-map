---
title: The useEffect Mental Model
summary: Effects as synchronisation with an external system rather than lifecycle callbacks, and why the dependency array is a consequence, not a configuration.
level: core
minutes: 30
order: 8
tags: [react, hooks, effects]

related:
  - frontend/react/you-might-not-need-an-effect
  - frontend/react/refs-and-imperative-escape-hatches
  - frontend/react/react-mental-model

resources:
  - title: Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects
    source: react.dev
    type: docs
    minutes: 30
    primary: true
  - title: A Complete Guide to useEffect
    url: https://overreacted.io/a-complete-guide-to-useeffect/
    source: Dan Abramov
    type: article
    minutes: 45
  - title: Lifecycle of reactive effects
    url: https://react.dev/learn/lifecycle-of-reactive-effects
    source: react.dev
    type: docs
    minutes: 25
  - title: Removing effect dependencies
    url: https://react.dev/learn/removing-effect-dependencies
    source: react.dev
    type: docs
    minutes: 25
---

## In one line

An effect synchronises a component with something outside React, and its dependency array is not a trigger list — it is the set of values the synchronisation depends on.

## What it is

The class-component framing — "run this on mount, that on update, clean up on unmount" — does not survive contact with hooks. An effect describes a *relationship*: given these values, this external thing should be in this state. React's job is to keep that true, which it does by running the setup after every commit where a dependency changed, and running the cleanup before each re-run and at unmount.

So an effect does not have a lifecycle of its own. It starts synchronising when the component mounts and stops when it unmounts, and every dependency change is a stop-then-start of the same relationship. Writing the cleanup first, before the setup, is the fastest way to get this right: subscribe/unsubscribe, connect/disconnect, start/cancel.

The dependency array is derived, not chosen. Every reactive value the effect body reads — props, state, and anything computed from them — must be in it, and the linter computes that set for you. When the array feels wrong, the effect is wrong: it is doing two unrelated things and should be split, or it is reading something that should be a ref, or it should not be an effect at all.

Two ordering facts matter in practice. `useEffect` runs after paint, so it never blocks the browser from showing the frame; `useLayoutEffect` runs synchronously after DOM mutation and before paint, which is where a measurement-then-adjust must go to avoid a visible flash — at the cost of blocking the frame.

Strict Mode in development mounts, unmounts, and remounts every component, running each effect twice. This is a feature: an effect that breaks under a double run has a missing cleanup and would leak a subscription, a listener, or a duplicated request in production too.

Race conditions are the other recurring failure. An effect that fetches must handle its own obsolescence — a stale closure flag or an `AbortController` in the cleanup — or a slow first request will overwrite the result of a fast second one.

## Why it matters

Misused effects are the largest single source of bugs in React codebases: duplicated requests, infinite loops, state that lags a render behind, and subscriptions that outlive their component. The reframing from "lifecycle" to "synchronisation" is what turns those from mysteries into a checklist.

Interviewers probe this directly with "what does the dependency array do?" — where "it controls when the effect runs" is the mid-level answer and "it declares what the effect depends on, so React can re-synchronise" is the senior one.

## Key points

- An effect synchronises with an external system; setup runs after commit, cleanup runs before every re-run and at unmount.
- The dependency array is derived from what the effect body reads, not chosen to control timing — fighting the linter almost always hides a real bug.
- Write the cleanup as you write the setup: subscribe/unsubscribe, connect/disconnect, start/cancel.
- `useEffect` runs after paint; `useLayoutEffect` runs before it and is the right tool only for measurement that would otherwise flash.
- Strict Mode's double invocation in development exposes missing cleanups that would leak in production.
- Any fetching effect needs cancellation or a staleness guard, or out-of-order responses will clobber newer data.
