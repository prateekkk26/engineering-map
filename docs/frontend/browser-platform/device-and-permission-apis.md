---
title: Device & Permission APIs
summary: Camera, geolocation, clipboard, notifications and the rest — the permission model they share, and how to ask without being denied.
level: deep
minutes: 20
order: 19
tags: [browser, permissions, apis, privacy]

related:
  - frontend/security/privacy-consent-and-gdpr
  - frontend/browser-platform/feature-detection-and-progressive-enhancement
  - frontend/accessibility/visual-accessibility

resources:
  - title: Permissions API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API
    source: MDN
    type: docs
    minutes: 20
    primary: true
  - title: MediaDevices.getUserMedia()
    url: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    source: MDN
    type: docs
    minutes: 25
  - title: Clipboard API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
    source: MDN
    type: docs
    minutes: 15
---

## In one line

Powerful APIs are gated by a permission the user grants once and rarely revisits, so the design question is not how to call them but when to ask — a denial is usually permanent.

## What it is

The gated set includes camera and microphone (`getUserMedia`), geolocation, notifications, clipboard read, persistent storage, screen capture, Bluetooth, USB, MIDI, and idle detection. They share a model: HTTPS required, a user gesture required for most, and a browser-controlled prompt you cannot style, move, or retry.

That last point drives everything. A user who clicks "Block" is not asked again by that browser, and re-enabling means digging through site settings — which almost nobody does. So a prompt fired on page load, before any context, converts a curious visitor into a permanently blocked one. The correct pattern is to ask in response to an action that obviously needs it, ideally after a short in-app explanation of why: press "Start call", then the prompt appears and its purpose is self-evident. Some browsers now suppress prompts entirely when they arrive without a gesture.

The **Permissions API** lets you query current state — `granted`, `denied`, or `prompt` — without triggering a request, so you can render honest UI: a disabled button with an explanation for `denied`, rather than a control that silently does nothing.

Individual notes worth having. Clipboard *write* is generally allowed from a user gesture; clipboard *read* is gated and much more restricted. Geolocation has a low-accuracy mode that is cheaper and often sufficient. Notifications are the most abused prompt on the web and the reason browsers added blanket suppression settings. `navigator.mediaDevices.enumerateDevices()` hides labels until permission is granted, which is a fingerprinting defence.

Every one of these must be feature-detected — support varies widely, especially between Chromium and Safari — and every one needs a designed fallback, because a denial is a normal state, not an error.

## Why it matters

Any product with video, location, or notifications hits this, and the difference between a well-designed permission flow and a badly designed one shows directly in grant rates — a product metric, not a technical one.

It also demonstrates user-facing judgement in interviews: explaining *why* you ask late rather than early is a product answer as much as a technical one.

## Key points

- Gated APIs require HTTPS, usually a user gesture, and a prompt you cannot style or reliably re-trigger.
- A denial is effectively permanent, so asking without context converts curious users into blocked ones.
- Ask in response to an action that makes the reason obvious, after explaining it in your own UI.
- The Permissions API reports state without prompting, which lets you render honest disabled states.
- Clipboard read is far more restricted than clipboard write; device labels are hidden until permission is granted.
- Feature-detect everything and design the denied path as a normal state.
