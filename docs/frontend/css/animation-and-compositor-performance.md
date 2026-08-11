---
title: Animation & Compositor Performance
summary: Which properties animate cheaply, the modern CSS that replaced JavaScript animation, and respecting reduced motion.
level: core
minutes: 20
order: 7
tags: [css, animation, performance]

related:
  - frontend/browser-platform/compositing-and-gpu-layers
  - frontend/performance/rendering-performance
  - frontend/browser-platform/view-transitions-and-soft-navigation

resources:
  - title: CSS animations
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Animations and performance
    url: https://web.dev/articles/animations-guide
    source: web.dev
    type: article
    minutes: 25
  - title: prefers-reduced-motion
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
    source: MDN
    type: docs
    minutes: 10
---

## In one line

Animate `transform` and `opacity` and the compositor handles it off the main thread; animate anything geometric and every frame runs layout and paint.

## What it is

The pipeline decides the cost. `transform` and `opacity` are compositor-only — the browser already has the painted layer and just moves or fades it, on its own thread, so the animation keeps running smoothly even while JavaScript is busy. `background-color` and `box-shadow` require repaint. `width`, `height`, `top`, `left`, `margin` require layout *and* paint, for every affected element, every frame. That is the whole performance story, and it is why `left: 0 → 100px` stutters where `translateX(100px)` does not.

Several things that used to need JavaScript are now CSS. **`@starting-style`** animates an element's entry — the long-standing gap where you had to add a class on the next frame. **`transition-behavior: allow-discrete`** animates properties like `display`, making exit animations possible without keeping the element mounted. **Scroll-driven animations** (`animation-timeline: scroll()` / `view()`) tie progress to scroll position and run off the main thread, replacing a whole category of scroll listeners. **View transitions** animate between states or pages on the compositor. Support varies, so feature-detect and treat them as enhancement.

The **Web Animations API** remains the right tool for imperative control — `element.animate()` gives play, pause, reverse, and a promise on finish, with the same compositor benefits, and is preferable to a class-toggling dance when the animation is driven by logic.

**`will-change`** deserves care: it promotes an element to its own layer ahead of time, avoiding a first-frame stutter, and each layer costs GPU memory proportional to its area. Apply it just before the animation and remove it after; a blanket rule on a list is how a page allocates hundreds of megabytes.

Finally, **`prefers-reduced-motion` is not optional**. Vestibular disorders make large motion genuinely unpleasant, and the media query is the accessibility contract. Reduce or remove transforms and parallax rather than disabling all feedback — a cross-fade in place of a slide keeps the affordance without the motion.

## Why it matters

Janky animation is one of the most immediately perceptible quality signals in a UI, and the transform-versus-layout distinction is the single most reliable performance fact in frontend.

Reduced-motion handling is also an accessibility marker interviewers listen for — offering polish and knowing when to withhold it.

## Key points

- `transform` and `opacity` animate on the compositor, off the main thread; geometric properties run layout and paint per frame.
- Compositor animations keep running smoothly even when the main thread is blocked.
- `@starting-style` and `transition-behavior: allow-discrete` bring entry and exit animation into plain CSS.
- Scroll-driven animations replace scroll listeners and run off the main thread.
- Use the Web Animations API when the animation needs imperative control.
- `will-change` avoids first-frame promotion cost but allocates GPU memory — apply narrowly and remove after.
- Honour `prefers-reduced-motion`, substituting a fade rather than removing feedback entirely.
