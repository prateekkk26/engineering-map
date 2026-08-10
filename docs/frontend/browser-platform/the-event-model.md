---
title: The Event Model
summary: Capture, target and bubble; delegation; passive listeners; and why stopPropagation is usually the wrong fix.
level: core
minutes: 25
order: 3
tags: [browser, events, dom]

related:
  - frontend/browser-platform/dom-and-cssom-as-apis
  - frontend/react/refs-and-imperative-escape-hatches
  - frontend/performance/inp-and-long-tasks

resources:
  - title: Event bubbling and capture
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: addEventListener
    url: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    source: MDN
    type: docs
    minutes: 20
  - title: Improving scrolling performance with passive listeners
    url: https://developer.chrome.com/blog/passive-event-listeners
    source: Chrome
    type: article
    minutes: 15
---

## In one line

Every event travels down from the window to the target and back up again, and almost everything else — delegation, framework event systems, "why did my handler run twice" — follows from those three phases.

## What it is

An event dispatch has three phases. **Capture** descends from `window` to the target's parent. **Target** fires on the element itself. **Bubble** ascends back to `window`. `addEventListener` attaches to the bubble phase by default; pass `{capture: true}` for the descent. Some events do not bubble — `focus`, `blur`, `load` — which is why `focusin` and `focusout` exist as bubbling equivalents.

**Delegation** falls straight out of bubbling: one listener on a container handles events from any descendant, using `event.target.closest('[data-id]')` to identify what was hit. That is how you handle a thousand rows with one listener, and how it keeps working when rows are added later.

Two properties get confused constantly. `event.target` is what was actually clicked; `event.currentTarget` is the element whose listener is running. In a delegated handler they differ, and using the wrong one is a routine bug.

`preventDefault()` cancels the browser's default action — following a link, submitting a form, scrolling. `stopPropagation()` halts the journey through the tree. They are unrelated, and `stopPropagation` deserves suspicion: it silently breaks anything above that was relying on the event, which in a real app means a delegated handler, an analytics listener, or a click-outside dismissal in a component someone else owns. Prefer checking the target in the outer handler.

**Passive listeners** matter for performance. A `touchstart` or `wheel` handler can call `preventDefault()`, so the browser must wait for it before scrolling — the handler is on the critical path of every scroll. `{passive: true}` promises you will not cancel, letting scrolling proceed immediately; browsers now default to passive for these on document-level targets.

React's synthetic events sit on top: pooled cross-browser wrappers attached at the root container (since React 17), which is why `stopPropagation` on a native listener does not always reach React handlers, and why mixing the two systems needs care.

## Why it matters

Delegation, `preventDefault`, and the capture/bubble distinction come up in live coding constantly — "build a dropdown that closes when you click outside" is a delegation and propagation question wearing a UI costume.

Passive listeners are also a standard scroll-performance answer, and INP work usually starts with what handlers run per interaction.

## Key points

- Every event captures down, fires at the target, and bubbles up; listeners default to the bubble phase.
- `focus` and `blur` do not bubble — use `focusin`/`focusout` when you need delegation.
- Delegation gives one listener for a whole container and keeps working for elements added later.
- `event.target` is what was hit; `event.currentTarget` is what is handling it.
- `preventDefault` cancels the default action; `stopPropagation` breaks other people's listeners and is rarely the right fix.
- Mark scroll-related listeners passive so the browser need not wait to see whether you cancel.
- React attaches its listeners at the root container, so native and synthetic propagation do not mix cleanly.
