---
title: Machine Coding Classics
summary: The dozen components that get asked live in a shared editor, and what the interviewer is actually scoring in each.
level: core
minutes: 30
order: 3
tags: [frontend-system-design, interview, coding]

related:
  - frontend/react/custom-hook-design
  - frontend/architecture/component-api-design
  - frontend/accessibility/building-accessible-components
  - system-design/low-level-design/designing-a-class-api

resources:
  - title: GreatFrontEnd — User Interface Coding Questions
    url: https://www.greatfrontend.com/questions/user-interface
    source: GreatFrontEnd
    type: article
    minutes: 30
    primary: true
  - title: WAI-ARIA Authoring Practices — Patterns
    url: https://www.w3.org/WAI/ARIA/apg/patterns/
    source: W3C
    type: docs
    minutes: 40
  - title: 30 Seconds of Code — JavaScript Snippets
    url: https://www.30secondsofcode.org/js/p/1
    source: 30 Seconds of Code
    type: repo
    minutes: 20
---

## In one line

A short list of components keeps getting asked because each one hides exactly one hard part — find the hard part and build around it.

## What it is

The 45-minute live-coding round is a component in a shared editor, not an algorithm. The same prompts recur, and each is a proxy for one skill:

| Prompt | The hard part being tested |
|---|---|
| Autocomplete / typeahead | Debounce, cancellation, out-of-order responses, keyboard nav |
| Modal / dialog | Focus trap, restore focus, portal, escape and scroll lock |
| Tabs / accordion | Roving tabindex, ARIA wiring, controlled vs uncontrolled |
| Infinite scroll list | IntersectionObserver, dedupe, cursor state |
| Star rating / toggle group | Keyboard semantics on a non-native control |
| Todo list with filters | Derived state, URL as state, not storing what you can compute |
| Nested comment thread | Recursive rendering, keys, collapse state |
| Data table with sort | Stable sort, memoisation, column config as data |
| Countdown / stopwatch | Timer drift, cleanup on unmount, `Date.now` over tick counting |
| Image carousel | Preloading neighbours, wraparound, pause on hover/focus |
| Tic-tac-toe / game grid | State shape, derived winner, immutable updates |
| Poll / progress widget | Interval cleanup, abort on unmount, backoff |

**How to run the 45 minutes.** Two or three clarifying questions first — controlled or uncontrolled? does it need keyboard support? is data local or fetched? Then the smallest working version end to end. Then improve out loud: accessibility, then edge cases, then performance. A finished simple version beats an unfinished sophisticated one every time.

**What earns points beyond "it works".** Cleanup in every effect. `AbortController` on every fetch. Keyboard operation on anything clickable. A sensible component API — children over config objects, a controlled/uncontrolled story, no boolean explosion. Naming that reads. And saying what you'd test.

**What loses points.** Reaching for a library. Storing derived state. `useEffect` where an event handler belongs. Silent catch blocks. `index` as a key on a reorderable list. Building the whole thing before running it once.

## Why it matters

This is the round with the highest volume in these loops — ~45 minutes in CoderPad on a real component, per PRD §1.1 — and it's the one where preparation transfers directly. The prompts are a closed set; having built each once means you spend the round on the interesting decisions instead of on getting a dropdown to open.

## Key points

- The prompt list is effectively closed; build each one once and the round becomes about decisions, not mechanics.
- Ask two or three clarifying questions before typing — controlled vs uncontrolled is almost always one of them.
- Ship the smallest working version first, then improve out loud; unfinished sophistication scores worse than finished simplicity.
- Every effect gets cleanup and every fetch gets an `AbortController` — this is the most reliably noticed detail.
- Keyboard support and ARIA on custom controls is a senior signal in a round where most candidates skip it.
- Never store what you can derive; derived state is the most common correctness bug under time pressure.
- Don't use `index` as a key on any list that can reorder or delete.
- Narrate the tests you would write even if you have no time to write them.
