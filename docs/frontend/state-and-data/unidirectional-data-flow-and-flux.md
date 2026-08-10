---
title: Unidirectional Data Flow & Flux
summary: Why the one-way loop won, what Flux was actually solving, and how the idea survives in every modern store.
level: core
minutes: 20
order: 4
tags: [state, architecture, patterns]

related:
  - frontend/state-and-data/client-state-libraries
  - frontend/react/usereducer-and-ui-state-machines
  - frontend/react/react-mental-model

resources:
  - title: Flux — In Depth Overview
    url: https://facebookarchive.github.io/flux/docs/in-depth-overview/
    source: Facebook (archived)
    type: docs
    minutes: 20
    primary: true
  - title: Redux — Three Principles
    url: https://redux.js.org/understanding/thinking-in-redux/three-principles
    source: Redux
    type: docs
    minutes: 15
  - title: Why Redux Toolkit is How To Use Redux Today
    url: https://redux.js.org/introduction/why-rtk-is-redux-today
    source: Redux
    type: article
    minutes: 15
---

## In one line

State flows down, events flow up, and the only way to change state is to dispatch an intent that a single function turns into the next state — which is what makes a UI's behaviour reconstructible from a log.

## What it is

Flux was a response to a specific pain: two-way binding, where a view could write directly to a model and a model could write to another model. In a small app that is convenient. In a large one, nobody can answer "what changed this value?" without reading everything, because the answer is potentially anything.

The one-way loop replaces that. An interaction dispatches an **action** — a description of what happened, not an instruction. A **reducer** or store handler computes the next state from the current state and that action. The new state flows down and the view re-renders. No component reaches sideways into another's state, and no view mutates the store directly.

Two properties fall out, and they are the actual payoff. **Traceability**: every change has a named cause, so a bug becomes "which action produced this?" rather than a search. And **replayability**: given the initial state and the action log, you can reproduce any state exactly — which is what makes time-travel debugging, action logging in bug reports, and deterministic tests possible.

The name is largely historical now. Redux compressed Flux's multiple stores into one; Zustand, Jotai, and Valtio dropped much of the ceremony; `useReducer` is the pattern in a single component. What survived everywhere is the constraint: state is not mutated by whoever happens to hold a reference, it is replaced by a pure function in response to a described event.

Worth being precise on one point: unidirectional flow is a *constraint*, not an architecture. It buys traceability at the cost of indirection, and for a form with three fields that trade is a loss. The judgement is knowing when the number of writers to a piece of state is high enough that "who changed this?" has become a real question.

## Why it matters

Every mainstream state library is a variation on this loop, so understanding the constraint means you can pick one up in an afternoon rather than learning a new vocabulary.

It also comes up as a design question — "how would you make this state change traceable?" — where naming actions, a single reducer, and a replayable log is a complete answer, whatever library you name.

## Key points

- Flux existed to kill two-way binding, where any model could write to any other and causality was unrecoverable.
- Actions describe what happened; reducers decide what that means for state. Views never write to state directly.
- Traceability and replayability are the payoff — time-travel debugging and deterministic tests are consequences, not features.
- Redux collapsed Flux's many stores into one; modern libraries kept the loop and dropped the ceremony.
- `useReducer` is the same pattern scoped to one component.
- The constraint costs indirection, so apply it where the number of writers makes causality genuinely unclear.
