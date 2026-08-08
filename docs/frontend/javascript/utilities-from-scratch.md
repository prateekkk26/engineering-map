---
title: Utilities From Scratch
summary: The handful of implementations that show up in every live-coding screen, and what each one is really testing.
level: core
minutes: 30
order: 16
tags: [interview, async, language]

related:
  - frontend/javascript/execution-model-and-closures
  - frontend/javascript/this-and-binding
  - frontend/javascript/promises-deep-dive
  - system-design/frontend-system-design/machine-coding-classics

resources:
  - title: JavaScript coding interview questions
    url: https://www.greatfrontend.com/questions/js
    source: GreatFrontEnd
    type: course
    primary: true
  - title: Debouncing and throttling explained through examples
    url: https://css-tricks.com/debouncing-throttling-explained-examples/
    source: CSS-Tricks
    type: article
    minutes: 15
  - title: Promises/A+ specification
    url: https://promisesaplus.com/
    source: Promises/A+
    type: docs
    minutes: 20
---

## In one line

A short list of utilities — `debounce`, `throttle`, `memoize`, `bind`, `Promise.all`, deep clone, `curry`, event emitter — covers most 45-minute JavaScript screens, and each one is a proxy for a concept.

## What it is

The technical screen at these companies is live coding in a shared editor: roughly 45 minutes, one or two problems, usually a utility or a small UI behaviour rather than an algorithm. The set of utilities in rotation is small and stable, and each is chosen because it can't be written without understanding something specific.

**`debounce`** tests closures and timer handling. The naive version is five lines; the follow-ups are where it's scored — a `cancel` method, a `leading`/`trailing` option, preserving `this` and arguments, and returning the last result. **`throttle`** is the sibling, and being able to state the difference crisply (debounce waits for quiet, throttle guarantees a rate) matters more than either implementation.

**`memoize`** tests closures plus cache-key design. The interesting question is never the `Map` — it's how you key on arbitrary arguments, and whether you notice that `JSON.stringify` as a key is wrong for objects with different insertion order and impossible for functions. `WeakMap` for single-object arguments is the answer that stands out.

**`bind`** tests `this` precedence directly. A correct implementation handles partial application, and the `new` case — a bound function used as a constructor ignores the bound `this`. Almost nobody handles that unprompted; mentioning it is free signal.

**`Promise.all`** tests the promise model: resolve order must follow input order, not completion order; the count of settled promises is what decides completion; a single rejection settles the outer promise immediately; and an empty array resolves immediately. `allSettled` and `race` are natural follow-ups. Building a minimal promise from scratch is the harder variant and is genuinely worth doing once against the Promises/A+ spec.

**Deep clone** tests recursion plus edge cases: cycles (needs a `WeakMap` of seen objects), `Date`, `Map`, `Set`, and knowing that `structuredClone` exists and what it can't handle. Saying "in production I'd use `structuredClone`, but here's the implementation" is the right framing.

**Event emitter** (`on`/`off`/`emit`/`once`) tests data-structure choice and the subtle bug: removing a listener during `emit` while iterating the same array. Copying the listener array before iterating is the fix.

The meta-skill matters as much as the code. Clarify requirements before typing, state the approach out loud, write it, then volunteer the edge cases and the test you'd add. Interviewers score communication and edge-case awareness explicitly — a working solution delivered in silence scores below a slightly rougher one that was reasoned through aloud.

## Why it matters

This is the round that gates everything after it, and it is the most preparable part of the entire loop — the question set barely changes. Practising these until they're automatic frees your attention during the interview for the part that's actually being assessed: how you think and how you communicate.

Each one also doubles as a check on the rest of this subsection. If `debounce` is awkward, closures need another pass; if `bind` is awkward, so does `this`.

## Key points

- Debounce waits for a quiet period before firing; throttle guarantees a maximum rate. Being able to state the difference in one sentence is scored before either implementation is.
- Every one of these utilities must forward `this` and all arguments to the wrapped function, which is why they are written with `function` rather than arrow syntax.
- `memoize` is a cache-key problem, not a cache problem — `JSON.stringify` fails on key order and functions, and `WeakMap` is the right structure for single-object arguments.
- A correct `bind` handles partial application and the `new` case, where the bound `this` is ignored in favour of the newly constructed object.
- `Promise.all` must preserve input order in its results, track a settled count rather than relying on the last resolution, reject on the first failure, and resolve immediately for an empty array.
- Deep clone needs a `WeakMap` of visited objects to survive cycles; name `structuredClone` as the production answer before writing the manual one.
- An event emitter must copy its listener array before iterating in `emit`, or removing a listener from within a handler corrupts the iteration.
- Clarify requirements, narrate the approach, then volunteer edge cases — communication is explicitly scored, and silence costs more than an imperfect first attempt.
