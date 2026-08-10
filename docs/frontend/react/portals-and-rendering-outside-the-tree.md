---
title: Portals & Rendering Outside the Tree
summary: Rendering a child into a different DOM node while keeping it in the React tree, and the accessibility work a portal does not do for you.
level: core
minutes: 20
order: 18
tags: [react, dom, accessibility]

related:
  - frontend/react/refs-and-imperative-escape-hatches
  - frontend/accessibility/keyboard-navigation-and-focus-management
  - frontend/css/containing-blocks-stacking-and-formatting-contexts

resources:
  - title: createPortal
    url: https://react.dev/reference/react-dom/createPortal
    source: react.dev
    type: docs
    minutes: 20
    primary: true
  - title: Dialog (Modal) pattern
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
    source: W3C ARIA Authoring Practices
    type: docs
    minutes: 20
  - title: Radix UI Portal
    url: https://www.radix-ui.com/primitives/docs/utilities/portal
    source: Radix UI
    type: docs
    minutes: 10
  - title: The dialog element
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
    source: MDN
    type: docs
    minutes: 15
---

## In one line

`createPortal` renders children into a DOM node somewhere else in the document while keeping them exactly where they are in the React tree — so context and event bubbling still follow the React parent, not the DOM one.

## What it is

The problem is CSS, not React. A modal, dropdown, tooltip, or toast rendered inside a container with `overflow: hidden`, a `transform`, a `filter`, or a competing `z-index` gets clipped or stacked wrong, because those properties create containing blocks and stacking contexts that a child cannot escape. Portalling the element to `document.body` puts it outside all of them.

What makes it more than `appendChild` is that the portalled subtree stays part of the React tree. It reads the same context providers, its state lives in the same place, and — the part that surprises people — events bubble to its React parent, not its DOM parent. A click inside a portalled menu propagates to the component that rendered it, which is exactly what you want and exactly what a naive click-outside handler gets wrong.

Portals do not make anything accessible. A modal needs focus moved into it on open, focus trapped while it is open, focus returned to the trigger on close, `Escape` to dismiss, the right role and label, and the rest of the page marked inert so a screen reader does not wander into it. None of that comes with the portal, and all of it is what the ARIA dialog pattern specifies.

Which is why the native `<dialog>` element and `showModal()` are worth reaching for: the top layer removes the z-index problem entirely, and focus trapping, `Escape`, and inerting the background come for free. It has its own quirks around styling the backdrop and closing behaviour, but the accessibility baseline is far better than a hand-rolled div.

Two practical constraints. The container node must exist before the portal renders, which in SSR means rendering nothing on the server pass or creating the node in an effect — a portal into a node that does not exist yet throws during hydration. And a portal renders into the document, so if the component unmounts without cleanup the node stays; React handles this for you, but manual `appendChild` in an effect does not.

## Why it matters

Every design system has a layer built on portals, and "build a modal" or "build a tooltip" is a standard practical-round task. The portal is the easy part — interviewers are watching for whether you know that focus management and dismissal are yours to implement.

## Key points

- Portals exist to escape `overflow`, `transform`, and stacking-context clipping, which are CSS constraints React cannot render around.
- The portalled subtree stays in the React tree: same context, same state, and events bubble to the React parent, not the DOM parent.
- Click-outside logic must account for that bubbling, or a click inside a portalled menu will close it.
- Accessibility is not included — focus move, focus trap, focus restore, `Escape`, labelling, and inerting the background are all manual.
- Native `<dialog>` with `showModal()` gives the top layer and most of that behaviour for free and is the better default for modals.
- The target node must exist before render, which needs care during SSR and hydration.
