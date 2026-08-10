---
title: The React Mental Model
summary: React as a function from state to a description of UI, and why every other React question falls out of that one idea.
level: core
minutes: 25
order: 1
tags: [react, fundamentals, rendering]

related:
  - frontend/react/elements-components-and-jsx
  - frontend/react/when-components-rerender
  - frontend/state-and-data/unidirectional-data-flow-and-flux

resources:
  - title: React as a UI Runtime
    url: https://overreacted.io/react-as-a-ui-runtime/
    source: Dan Abramov
    type: article
    minutes: 45
    primary: true
  - title: Thinking in React
    url: https://react.dev/learn/thinking-in-react
    source: react.dev
    type: docs
    minutes: 20
  - title: Render and commit
    url: https://react.dev/learn/render-and-commit
    source: react.dev
    type: docs
    minutes: 10
  - title: Keeping components pure
    url: https://react.dev/learn/keeping-components-pure
    source: react.dev
    type: docs
    minutes: 15
---

## In one line

React is a function from state to a description of the UI, plus a runtime that works out the smallest set of DOM operations needed to make the screen match that description.

## What it is

You do not tell React what to change. You write components that, given the current props and state, return a description of what the UI should look like *right now*. React calls those functions, compares the result with what it rendered last time, and applies the difference to the DOM. Your code says what; React decides how.

That description is a tree of plain objects — elements — not DOM nodes. Creating one is cheap, which is what makes "re-render the whole subtree and diff it" a reasonable default rather than an obvious waste.

Rendering happens in two phases. In the **render phase** React calls your components and builds the new tree. This phase must be pure: no DOM writes, no network calls, no mutating anything outside the function, because React may call a component twice, throw the result away, or abandon the work partway through. In the **commit phase** React applies the diff to the DOM and runs effects. Only the commit touches the outside world.

State is what makes the function produce a different answer. Calling a setter does not mutate a variable and patch the screen — it schedules another run of the same function with new inputs. This is why a value read during render is a snapshot for that render, and why the "stale value" confusion disappears once you stop thinking of state as a mutable box.

The last piece is direction: data flows down through props, and changes flow up through callbacks. There is one path for a value to reach a component, which is what makes a React bug findable — you can walk up the tree from the wrong pixel to the state that produced it.

## Why it matters

Almost every intermediate React question — why an effect ran twice, why a component did not update, why a memo did nothing — is answered by "React calls your function and diffs the result." Candidates who have this model reason from it live; candidates who don't reach for `useEffect` and hope.

In an interview it also shows up directly: "walk me through what happens when I call `setState`" is a standard opener, and the good answer is a paragraph about render and commit, not a sentence about the DOM.

## Key points

- A component is a function from props and state to an element tree — a description, not the DOM itself, and not a set of instructions for changing it.
- The render phase must be pure, because React can call a component more than once, discard the result, or interrupt it; the commit phase is the only place side effects belong.
- Calling a state setter schedules a re-render, it does not mutate a variable — so the value you read during a render is a fixed snapshot for that render.
- Re-rendering a component is not the same as updating the DOM. Most renders produce a diff with nothing in it.
- Data flows down as props and back up as callbacks, which is what makes the source of a wrong value walkable by hand.
- Strict Mode double-invokes components in development on purpose: it surfaces impurity you would otherwise ship.
