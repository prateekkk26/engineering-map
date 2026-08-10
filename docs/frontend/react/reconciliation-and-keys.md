---
title: Reconciliation & Keys
summary: How React decides which element in the new tree corresponds to which in the old one, and why the key you pick decides whether state survives.
level: core
minutes: 25
order: 3
tags: [react, rendering, state]

related:
  - frontend/react/react-mental-model
  - frontend/react/lists-and-virtualisation
  - frontend/react/when-components-rerender

resources:
  - title: Preserving and resetting state
    url: https://react.dev/learn/preserving-and-resetting-state
    source: react.dev
    type: docs
    minutes: 25
    primary: true
  - title: Rendering lists
    url: https://react.dev/learn/rendering-lists
    source: react.dev
    type: docs
    minutes: 20
  - title: Reconciliation
    url: https://legacy.reactjs.org/docs/reconciliation.html
    source: React (legacy docs)
    type: docs
    minutes: 15
  - title: Understanding React's key prop
    url: https://kentcdodds.com/blog/understanding-reacts-key-prop
    source: Kent C. Dodds
    type: article
    minutes: 10
---

## In one line

React matches old and new elements by position and type, and a key overrides position — so the key is what decides whether a component keeps its state or gets a fresh one.

## What it is

A general tree diff is O(n³). React gets to linear time by making two assumptions and living with them: elements of different types produce different trees, and the developer can mark which children are stable across renders with a key.

The first assumption means type changes are destructive. If a `<div>` becomes a `<span>`, or `<ProfileA>` becomes `<ProfileB>` in the same slot, React unmounts the old subtree — destroying its DOM nodes, its state, and running its cleanup — and mounts the new one. There is no attempt to salvage anything.

If the type matches, React keeps the instance and updates it: it patches changed attributes on host elements, and re-renders composite ones with the new props. State stays. This is why state is tied to *position in the tree*, not to the variable you assigned the component to.

For children, the default match is by index. Same position, same type, same instance. That default is wrong the moment a list can reorder, insert, or delete anywhere except the end, because index 2 before and index 2 after are different items. `key` replaces the index in that comparison: React matches by key first, and reuses the instance the key points at wherever it moved to.

Which makes `key={index}` the specific bug everyone hits. It is not a random key, it is exactly the default React already uses, so it silences the warning while fixing nothing: delete the first row and every subsequent row keeps the state of the row that used to be above it — a checked checkbox, a focused input, a half-typed edit.

The same mechanism runs in reverse as a tool. Changing a key deliberately is the shortest way to reset a component: `<Form key={userId} />` throws away all the form's internal state when the user changes, and it is the idiomatic alternative to an effect that clears state when a prop changes.

## Why it matters

Key bugs are the classic "the data is right but the UI is wrong" report — a list that renders correct text but wrong checkbox states — and they survive code review because the code looks fine. Being able to explain *why* index keys break, in terms of instance matching rather than "React needs unique keys", is a standard senior-versus-mid signal.

## Key points

- React diffs by position and type; a different type at the same position unmounts the old subtree entirely rather than trying to reuse it.
- State belongs to a position in the tree, not to a component variable — same slot and same type means the same instance and the same state.
- `key` overrides positional matching, letting an instance follow its item as the list reorders.
- `key={index}` is identical to no key at all and is only safe for lists that never reorder, insert, or delete except at the end.
- Keys need to be unique among siblings, not globally, and must be derived from the data's identity rather than generated at render time.
- Changing a key on purpose is the cleanest way to reset a subtree's state, and it beats an effect that resets state when a prop changes.
