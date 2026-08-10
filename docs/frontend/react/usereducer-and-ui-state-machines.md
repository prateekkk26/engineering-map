---
title: useReducer & UI State Machines
summary: When to trade several useState calls for one reducer, and when to go further and model the UI as explicit states and transitions.
level: core
minutes: 25
order: 13
tags: [react, state, patterns]

related:
  - frontend/react/state-updates-and-batching
  - frontend/state-and-data/ui-state-machines
  - frontend/react/context-and-its-limits

resources:
  - title: Extracting state logic into a reducer
    url: https://react.dev/learn/extracting-state-logic-into-a-reducer
    source: react.dev
    type: docs
    minutes: 25
    primary: true
  - title: useReducer
    url: https://react.dev/reference/react/useReducer
    source: react.dev
    type: docs
    minutes: 20
  - title: The State Reducer Pattern with React Hooks
    url: https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks
    source: Kent C. Dodds
    type: article
    minutes: 15
  - title: XState — state machines and statecharts
    url: https://stately.ai/docs/xstate
    source: Stately
    type: docs
    minutes: 30
---

## In one line

A reducer moves state transitions out of event handlers into one pure function of state and action, and a state machine goes further by making the illegal combinations unrepresentable.

## What it is

Several `useState` calls are fine while they are independent. They stop being fine when a single interaction has to update three of them together, when the update depends on the current value of the others, or when the same transition is triggered from four different handlers. At that point the logic is spread across the component and there is no single place to read what "submit" does.

`useReducer` collapses it: state plus an action goes in, the next state comes out, and handlers become `dispatch({type: 'submitted'})`. The reducer is a pure function, so it is trivially testable without rendering anything, and every transition lives in one switch statement you can read top to bottom. Dispatch is stable for the component's lifetime, which also makes it cheap to pass down or put in context.

The deeper problem it does not solve is impossible states. `isLoading`, `isError`, `data`, and `isSuccess` as four booleans is sixteen combinations, of which about four are real — and the bug reports come from the other twelve: a spinner on top of an error, stale data next to a success message.

Modelling status as one value — `'idle' | 'loading' | 'success' | 'error'` — with the data attached to the state that owns it removes those combinations by construction. That is already a state machine in the loose sense. The strict version adds the second half: transitions are defined per state, so a `'retry'` action while `'loading'` simply does nothing, instead of firing a second request.

That is worth reaching for when the interaction is genuinely stateful — multi-step forms, uploads with cancel and retry, drag interactions, anything with optimistic updates and rollback. A dedicated library like XState buys you visualisation, guards, and hierarchical states; a discriminated union plus a reducer covers most cases with no dependency.

TypeScript pulls its weight here. A discriminated union on `status` means the compiler stops you reading `data` in the error branch — the modelling and the type checking are the same act.

## Why it matters

"Four booleans" is the single most common source of impossible UI states in real codebases, and recognising it is a design-round signal: interviewers asking you to design an autocomplete or an uploader are watching for whether you model state or accumulate flags.

Reducers are also the pragmatic answer to complex state in a component that does not warrant a store, and knowing the boundary — reducer here, external store there — is what the question is usually after.

## Key points

- Reach for a reducer when transitions touch several pieces of state at once or are fired from many places.
- A reducer is a pure function of state and action, testable without rendering and readable as a single list of transitions.
- `dispatch` is referentially stable, so passing it through props or context does not invalidate memoised children.
- Independent booleans multiply into impossible states; a single status union with data attached to the relevant state removes them.
- A state machine additionally defines which transitions are legal per state, so a stray action is ignored rather than mishandled.
- Discriminated unions make the model and the type-level guarantee the same thing — the compiler enforces the machine.
