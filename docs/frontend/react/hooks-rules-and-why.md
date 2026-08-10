---
title: The Rules of Hooks & Why They Exist
summary: Why hooks depend on call order, what that implies for conditionals and loops, and what actually breaks when the order changes.
level: core
minutes: 20
order: 6
tags: [react, hooks, fundamentals]

related:
  - frontend/react/custom-hook-design
  - frontend/react/fiber-architecture
  - frontend/react/state-updates-and-batching

resources:
  - title: Why Do React Hooks Rely on Call Order?
    url: https://overreacted.io/why-do-hooks-rely-on-call-order/
    source: Dan Abramov
    type: article
    minutes: 25
    primary: true
  - title: Rules of Hooks
    url: https://react.dev/reference/rules/rules-of-hooks
    source: react.dev
    type: docs
    minutes: 10
  - title: Invalid hook call warning
    url: https://react.dev/warnings/invalid-hook-call-warning
    source: react.dev
    type: docs
    minutes: 10
---

## In one line

Hooks have no names, so React identifies them by the order they are called in — which is why they must be called unconditionally, at the top level, from React functions only.

## What it is

A component can call `useState` five times. React has to know which stored value belongs to which call, and the call site gives it nothing to key on — no name, no identifier, just a function invocation. So React uses the only stable thing available: position. First `useState` in this render maps to the first slot on this component's fiber, second to the second, and so on.

Concretely, each fiber holds a linked list of hook records. On mount, each hook call appends a record. On update, a cursor walks that list in step with the calls. Everything works as long as the sequence of calls is identical every render.

Put a hook behind an `if` and the sequence changes. The cursor is now off by one: a `useState` reads the state that belonged to a `useEffect`, dependency arrays get compared against the wrong values, and the failure is silent state corruption rather than a clean error. React detects the count mismatch and throws "rendered fewer hooks than expected", but the class of bug is worse than the message suggests.

Hence the rules. Call hooks at the top level — not in conditions, loops, or nested functions, and not after an early return. Call them only from components or other hooks, so React knows which fiber is currently rendering: hooks read a module-level "currently rendering fiber" that is only set during a component render, and calling one outside that window is what produces the invalid-hook-call error.

The same error has a second, more common cause that has nothing to do with your code: two copies of React in the bundle, usually from a linked package or a mismatched peer dependency. The dispatcher is module state, so the copy your component imports is not the copy that is rendering.

The escape hatch for conditional behaviour is composition, not a conditional hook. Call the hook unconditionally and pass it a null-ish argument, or split the branch into two components and choose between them in the parent — the second is why a `key`-swapped component is the idiomatic way to reset state.

## Why it matters

The lint rule catches the obvious cases, so what interviews probe is whether you know the mechanism: "why can't hooks be conditional?" answered with "because the docs say so" reads very differently from an answer about an index into a per-fiber list.

The knowledge is also load-bearing when you write custom hooks, where an early return inside a shared hook silently imposes the same corruption on every component that uses it.

## Key points

- Hooks are identified by call index into a per-fiber list, because the call site provides no other identity.
- Conditionals, loops, and early returns before a hook shift that index and mis-associate state — corruption first, an error message second.
- Hooks work only during a component render, when React has set the current fiber; calling one in an event handler or a plain function throws.
- "Invalid hook call" is as often two copies of React in the bundle as it is a misplaced hook.
- Conditional behaviour comes from calling the hook unconditionally with different arguments, or from splitting the branch into separate components.
- `eslint-plugin-react-hooks` enforces both rules statically, and the exhaustive-deps warning it emits is nearly always right.
