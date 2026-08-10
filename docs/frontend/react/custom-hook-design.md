---
title: Custom Hook Design
summary: What belongs in a custom hook, what to return, and why most bad hooks are bad because they hide too much or too little.
level: core
minutes: 20
order: 14
tags: [react, hooks, api-design]

related:
  - frontend/react/hooks-rules-and-why
  - frontend/architecture/component-api-design
  - frontend/testing/testing-hooks-and-state

resources:
  - title: Reusing logic with custom hooks
    url: https://react.dev/learn/reusing-logic-with-custom-hooks
    source: react.dev
    type: docs
    minutes: 30
    primary: true
  - title: Component Composition is great btw
    url: https://tkdodo.eu/blog/component-composition-is-great-btw
    source: TkDodo
    type: article
    minutes: 15
  - title: usehooks-ts — a library of well-scoped custom hooks
    url: https://usehooks-ts.com/
    source: usehooks-ts
    type: docs
    minutes: 15
---

## In one line

A custom hook is a function that shares stateful logic — not state itself — between components, and its quality is decided almost entirely by what it returns and how honestly it names what it does.

## What it is

A hook is any function starting with `use` that calls other hooks. There is no mechanism behind it: extracting a hook is a plain refactor, and the `use` prefix exists so the linter and the reader know the rules of hooks apply.

The most important consequence is that hooks share *logic*, not *state*. Two components calling `useToggle()` get two independent pieces of state. Shared state needs lifting, context, or a store — this catches people out and produces the "why isn't the other component updating?" bug.

Good hooks have a clear subject. `useDebouncedValue`, `useOnScreen`, `useMediaQuery`, `useLocalStorage` each own one concern and could be tested in isolation. `useDashboard`, which fetches four things, owns three pieces of state, and returns eleven fields, is a component's body that has moved house — it is not reusable, just relocated. Extract for reuse or for a genuinely separable concern, not to make a file shorter.

The return shape is an API decision. A tuple reads well for exactly two values whose names the caller chooses (`const [open, setOpen] = useToggle()`); an object is better beyond that, because the call site becomes self-documenting and adding a field is not a breaking change. Keep the returned functions stable with `useCallback` when they are likely to end up in dependency arrays, and return a discriminated union for async status rather than parallel booleans.

Two further rules keep hooks composable. Take options as an object so parameters can be added later without a positional break. And never conditionally call a hook inside your hook — an early return before a `useState` corrupts the hook order of every component that uses it.

Composition is the alternative worth checking first. Passing children, or a render prop, often solves a problem that a hook would solve less clearly — a hook cannot render anything, so if the shared thing includes markup, it is a component.

## Why it matters

Take-homes are read for how logic is organised, and a well-named hook with a clean return shape is the fastest signal that a candidate thinks in interfaces. The opposite — one giant `useEverything` — reads as extraction for its own sake.

It also matters at scale: hooks are the main unit of reuse in a React codebase, and a hook with a bad API gets copied, not fixed.

## Key points

- Custom hooks share logic, not state — every caller gets its own independent state.
- One concern per hook; a hook that returns a dozen unrelated fields is a relocated component body, not a reusable unit.
- Return a tuple for two values, an object beyond that, and a status union rather than parallel loading and error booleans.
- Keep returned callbacks referentially stable so callers can safely put them in dependency arrays.
- Accept an options object, not positional parameters, so the signature can grow.
- Hooks obey the rules of hooks internally too: no conditional calls, no early returns before a hook.
- If the reusable thing includes markup, it is a component or a composition pattern, not a hook.
