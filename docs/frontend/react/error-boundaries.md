---
title: Error Boundaries
summary: What a boundary catches, the four things it does not, and how to design fallbacks that leave the app usable.
level: core
minutes: 20
order: 17
tags: [react, errors, reliability]

related:
  - frontend/react/suspense-and-streaming
  - frontend/architecture/resilient-ui-error-handling
  - _shared/error-handling

resources:
  - title: Catching rendering errors with an error boundary
    url: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    source: react.dev
    type: docs
    minutes: 20
    primary: true
  - title: react-error-boundary
    url: https://github.com/bvaughn/react-error-boundary
    source: Brian Vaughn
    type: repo
  - title: Error boundaries
    url: https://legacy.reactjs.org/docs/error-boundaries.html
    source: React (legacy docs)
    type: docs
    minutes: 15
---

## In one line

An error boundary is a component that catches an exception thrown while rendering its subtree and shows a fallback instead of letting the whole tree unmount.

## What it is

Since React 16, an uncaught error during render unmounts the entire tree. That is deliberate: a half-rendered UI can show wrong data, and wrong data in a financial or medical interface is worse than no data. A boundary is how you scope that blast radius to something smaller than the whole app.

Mechanically it is still a class component — `getDerivedStateFromError` to render the fallback, `componentDidCatch` to log — because there is no hook equivalent. In practice most codebases use `react-error-boundary`, which wraps that in a usable API with a `resetErrorBoundary` callback and a `FallbackComponent` prop.

What it does not catch is the part worth memorising: errors in event handlers, in asynchronous code such as a `setTimeout` or a promise rejection, in server-side rendering, and errors thrown by the boundary itself. All four run outside the render call stack that React wraps in a try/catch. Handler and async errors are yours to catch and turn into state; a boundary only reacts to something thrown during rendering.

Placement mirrors Suspense: boundaries go where the UI can degrade independently. A route-level boundary keeps the shell and navigation alive when a page blows up. A widget-level boundary keeps a broken third-party embed or one dashboard panel from taking the dashboard with it. One boundary at the root is only a nicer white screen.

Recovery matters as much as catching. A fallback with a reset action, keyed on something that changes when the user navigates or retries, lets the subtree remount and try again — otherwise the fallback is permanent until a full reload. And the boundary is the right place to report: `componentDidCatch` receives the error and a component stack, which is what makes a Sentry trace point at a component rather than a minified frame.

In App Router codebases the framework wires this up for you: `error.tsx` is a client-side error boundary per route segment, with a `reset()` function, and `global-error.tsx` catches what escapes the root layout.

## Why it matters

Without boundaries, one undefined property in a rarely-visited widget is a blank page for every user who touches it. Interviewers ask what happens when a component throws, and the complete answer includes the four things boundaries miss — that is where the question is actually aimed.

## Key points

- An uncaught render error unmounts the whole tree by default; a boundary scopes the failure to a subtree.
- Boundaries catch errors during rendering, in lifecycle methods, and in constructors below them — nothing else.
- Event handlers, async callbacks, SSR, and the boundary's own render are not covered; handle those explicitly.
- Only class components can be boundaries, which is why `react-error-boundary` is the de facto standard wrapper.
- Place boundaries per route and per independently failing widget, not once at the root.
- Give fallbacks a reset path, and log from `componentDidCatch` with the component stack for a usable trace.
