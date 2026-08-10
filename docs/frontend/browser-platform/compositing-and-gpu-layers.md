---
title: Compositing & GPU Layers
summary: Why transform and opacity are cheap to animate, what promotes an element to its own layer, and how will-change becomes a memory leak.
level: core
minutes: 20
order: 5
tags: [browser, rendering, performance, animation]

related:
  - frontend/browser-platform/layout-thrashing-and-forced-reflow
  - frontend/css/animation-and-compositor-performance
  - frontend/performance/rendering-performance

resources:
  - title: Stick to compositor-only properties and manage layer count
    url: https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count
    source: web.dev
    type: article
    minutes: 20
    primary: true
  - title: will-change
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
    source: MDN
    type: docs
    minutes: 15
  - title: Animations Guide
    url: https://developer.chrome.com/docs/devtools/rendering/performance
    source: Chrome DevTools
    type: docs
    minutes: 20
---

## In one line

The page is painted onto layers that the compositor can move and blend on the GPU, so animating `transform` or `opacity` skips layout and paint entirely — while everything else runs the whole pipeline every frame.

## What it is

After paint, the browser has a set of bitmaps. The **compositor** arranges them into the final image, and it can do that on the GPU, on its own thread, without JavaScript or layout involved. Anything expressible as moving, scaling, rotating, or fading an existing bitmap is nearly free.

That produces the standard hierarchy. Animating `transform` or `opacity` is compositor-only: no layout, no paint. Animating `background-color` or `box-shadow` requires repaint but not layout. Animating `width`, `height`, `top`, `left`, `margin`, or `padding` triggers layout, then paint, then composite — on every frame, for every affected element. This is why `left: 100px → 200px` stutters where `transform: translateX(100px)` does not.

Elements get their own layer for specific reasons: a 3D transform, an animating transform or opacity, `will-change`, `position: fixed`, video and canvas elements, and elements composited above one that already is. You can see the result in DevTools' Layers panel.

`will-change` is the explicit hint: it tells the browser to promote an element *before* the animation starts, avoiding a first-frame stutter while the layer is created. It is also the most misused property in this area. Each layer costs GPU memory — width × height × 4 bytes — so `will-change: transform` applied to every card in a list can allocate hundreds of megabytes and make everything slower. Apply it just before the animation, remove it after, and never in a blanket rule.

Two related notes. The compositor thread is why a CSS animation keeps running smoothly while the main thread is blocked, which is a real argument for CSS over JavaScript animation. And `content-visibility: auto` is the newer lever for skipping rendering work entirely for off-screen content, which helps long pages more than layer tuning does.

## Why it matters

"Animate this smoothly" is a routine requirement, and the transform-versus-left distinction is the single most reliable frontend performance fact — it comes up in interviews as often as any React question.

The `will-change` memory trap is the follow-up that separates people who have read the tip from people who have profiled the consequences.

## Key points

- The compositor moves and blends already-painted layers on the GPU, off the main thread.
- `transform` and `opacity` are compositor-only; geometric properties run layout and paint every frame.
- Layers are created by 3D transforms, animating compositor properties, `will-change`, fixed positioning, video, and canvas.
- `will-change` avoids first-frame promotion cost but allocates GPU memory per layer — apply it narrowly and remove it after.
- Compositor animations keep running when the main thread is blocked, which is a genuine argument for CSS animation.
- Use DevTools' Layers and Rendering panels to see promotion and paint flashing rather than guessing.
