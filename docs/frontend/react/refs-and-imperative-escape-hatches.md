---
title: Refs & Imperative Escape Hatches
summary: When to hold a value that is not state, how to reach a DOM node safely, and why an imperative handle is usually the wrong first answer.
level: core
minutes: 20
order: 10
tags: [react, hooks, dom]

related:
  - frontend/react/useeffect-mental-model
  - frontend/react/portals-and-rendering-outside-the-tree
  - frontend/accessibility/keyboard-navigation-and-focus-management

resources:
  - title: Referencing values with refs
    url: https://react.dev/learn/referencing-values-with-refs
    source: react.dev
    type: docs
    minutes: 15
    primary: true
  - title: Manipulating the DOM with refs
    url: https://react.dev/learn/manipulating-the-dom-with-refs
    source: react.dev
    type: docs
    minutes: 20
  - title: useImperativeHandle
    url: https://react.dev/reference/react/useImperativeHandle
    source: react.dev
    type: docs
    minutes: 15
  - title: Avoiding useEffect with callback refs
    url: https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs
    source: TkDodo
    type: article
    minutes: 10
---

## In one line

A ref is a mutable box whose contents React neither tracks nor re-renders on, which makes it right for DOM nodes, timers, and "remembered" values, and wrong for anything the UI displays.

## What it is

`useRef(initial)` returns a stable object with a `current` property. Writing to `current` does not schedule a render, and reading it during render is not tracked. The value survives re-renders because the object is the same object every time.

That gives two distinct uses. First, an instance variable: a timeout id to clear, an `AbortController` to cancel, the previous value of a prop, a flag saying "the user has interacted". Second, a handle on a DOM node: pass `ref` to a host element and React sets `current` to the node after commit and back to `null` on unmount.

The line against state is sharp. If a change should be visible on screen, it is state. If a change should not cause a render, it is a ref. Storing display data in a ref produces the classic bug of a UI that updates only when something else happens to re-render it.

Timing follows from the commit phase: `ref.current` is null during the first render and populated by the time effects run. So DOM reads belong in an effect, not in the render body — and if you need a measurement before paint, in `useLayoutEffect`.

**Callback refs** are the underused variant. Passing a function instead of an object gets it called with the node on attach and `null` on detach, which handles nodes that appear conditionally or in lists — cases where a single ref object silently holds the wrong one. It also often replaces an effect entirely: measure or subscribe in the callback and clean up when it is called with `null`.

In React 19 `ref` is an ordinary prop on function components and `forwardRef` is no longer needed. `useImperativeHandle` still exists for exposing a narrow API — `focus()`, `scrollIntoView()`, `play()` — from a component that owns a node internally. Treat it as a last resort: an imperative handle is a second, unidirectional channel into a component, and most of what people expose through it should have been a prop.

## Why it matters

Focus management, scroll restoration, media playback, canvas, drag interactions, and integrating any non-React library all bottom out in refs. In practical rounds "focus the input after the modal opens" or "scroll the new message into view" comes up constantly, and the difference between a ref used well and `document.querySelector` in an effect is visible immediately.

## Key points

- A ref is mutable, untracked, and stable across renders; changing `current` never triggers a render.
- If it affects what is rendered, it is state; if it must not trigger a render, it is a ref.
- `ref.current` is null during the first render and set before effects run, so DOM access belongs in an effect or a callback ref.
- Callback refs handle conditional and list nodes correctly, and frequently remove an effect altogether.
- React 19 passes `ref` as a normal prop — `forwardRef` is legacy in new code.
- `useImperativeHandle` should expose the smallest possible API and only for genuinely imperative actions like focus, scroll, or play.
