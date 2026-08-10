---
title: Profiling React Performance
summary: How to find the component that is actually costing you time, using the Profiler and the browser's performance panel rather than guesswork.
level: core
minutes: 25
order: 20
tags: [react, performance, tooling]

related:
  - frontend/react/memoisation-usememo-usecallback-memo
  - frontend/react/when-components-rerender
  - frontend/performance/profiling-with-devtools

resources:
  - title: Profile a React app for performance
    url: https://kentcdodds.com/blog/profile-a-react-app-for-performance
    source: Kent C. Dodds
    type: article
    minutes: 20
    primary: true
  - title: React Developer Tools
    url: https://react.dev/learn/react-developer-tools
    source: react.dev
    type: docs
    minutes: 10
  - title: Profiler
    url: https://react.dev/reference/react/Profiler
    source: react.dev
    type: docs
    minutes: 15
  - title: Analyze runtime performance
    url: https://developer.chrome.com/docs/devtools/performance
    source: Chrome DevTools
    type: docs
    minutes: 25
---

## In one line

Record an interaction with the React Profiler, read the flame chart for what actually took time and why it rendered, and only then decide whether the fix is memoisation, restructuring, or less work.

## What it is

The React DevTools Profiler records commits. Each bar in the timeline is one commit; selecting it shows the flame chart of components rendered in it, coloured and sized by how long each took. Two settings make it far more useful: "Record why each component rendered" attributes every render to props, state, hooks, or a parent, and "Highlight updates when components render" gives you a live overlay for spotting cascades without recording at all.

The ranked chart is where to start — it sorts by self time, which is the question you actually have. A wide bar is a component doing expensive work itself; a wide bar made of many narrow children is a cascade, and the fix is upstream.

Two facts prevent misreading it. Development builds are slower and Strict Mode renders twice, so absolute numbers from a dev build are wrong — profile a production build with profiling enabled before quoting a figure. And the Profiler only sees React work; time spent in layout, paint, or a long non-React task will not appear.

Which is why the Chrome performance panel is the other half. It shows the whole frame: scripting, style, layout, paint, and the long tasks that break INP. If React's commit is 4ms and the interaction still feels slow, the cost is elsewhere — a forced reflow, an expensive selector, a synchronous storage read.

The order of investigation is fixed. Find the slow render first: one component taking 40ms blocks a frame no matter how rarely it runs, and no amount of memoising its parent helps. Then look at frequency: a cascade firing on every keystroke matters even when each render is cheap. Only after that does the fix become a choice — `useMemo` for genuinely expensive computation, `memo` plus stable props for a cascade, moving state down or passing `children` to remove the cascade entirely, a transition to deprioritise it, or virtualisation if the cost is the sheer number of nodes.

Measure after. A memoisation that does not show up as a change in the profile is a permanent cost with no benefit and should be reverted.

## Why it matters

"This page feels slow, find out why" is a standard live exercise, and it is testing method more than knowledge: candidates who open the profiler and narrow it down read completely differently from candidates who start adding `useCallback`.

In real work it is the difference between a one-line fix and a week of speculative memoisation that makes the codebase worse.

## Key points

- Profile a production build with profiling enabled; dev-build numbers are inflated and Strict Mode doubles the render count.
- Turn on "record why each component rendered" — the attribution is the part that tells you what to fix.
- Read the ranked chart by self time: wide-and-alone means expensive work, wide-and-many-children means a cascade from above.
- The React Profiler only sees React work; use the browser performance panel for layout, paint, and long tasks.
- Fix the slow render before the frequent one — a single 40ms render drops a frame regardless of how often it happens.
- Re-measure after every change and revert memoisation that does not show up in the profile.
