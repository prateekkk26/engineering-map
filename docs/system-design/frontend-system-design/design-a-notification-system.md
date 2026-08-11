---
title: Design a Notification System
summary: The bell icon, the toast stack and the push permission — transport choice, unread counts across tabs, and not asking for permission on page load.
level: core
minutes: 25
order: 9
tags: [frontend-system-design, design-problem, realtime]

related:
  - frontend/browser-platform/realtime-transports
  - frontend/browser-platform/service-workers-and-offline
  - frontend/accessibility/live-regions-and-dynamic-content
  - system-design/classic-problems/design-a-notification-service

resources:
  - title: Push API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Permission UX — Best Practices for Push
    url: https://web.dev/articles/push-notifications-permissions-ux
    source: web.dev
    type: article
    minutes: 15 # unverified
  - title: Server-Sent Events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
    source: MDN
    type: docs
    minutes: 20
  - title: Broadcast Channel API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
    source: MDN
    type: docs
    minutes: 10
---

## In one line

Three different products wear the same name — in-app toasts, a notification centre with unread state, and OS-level push — so the first move is asking which ones are in scope.

## What it is

**Separate the three.** *Toasts* are transient, client-triggered, no persistence. The *notification centre* is a paginated, server-backed list with read/unread state. *Web push* is delivered by the browser's push service to a service worker and arrives when your site isn't open. They share almost nothing except an icon.

**Transport for live delivery.** Notifications are server-to-client, low-volume, and don't need a client→server channel — so **SSE** is the right default over WebSockets, and saying that (auto-reconnect built in, plain HTTP, works with existing auth and proxies) is a better answer than reaching for WebSockets reflexively. WebSockets earn their place only if you already have one for something else. Polling with backoff is the honest fallback and is fine at low frequency. Whatever you choose: reconnect with exponential backoff plus jitter, resume from a `Last-Event-ID` cursor so nothing is lost across a drop, and pause or degrade when the tab is hidden.

**Unread count.** The server owns the count; the client keeps an optimistic local copy. Mark-as-read is optimistic with rollback on failure. The subtle part is **multiple tabs**: three open tabs shouldn't hold three sockets or show three different counts. Elect one leader tab (Web Locks or a `SharedWorker`) to hold the connection and fan out via `BroadcastChannel`; at minimum, sync the count across tabs so reading in one clears the badge in all.

**Web push.** Requires a service worker, a `PushSubscription` sent to your server, and VAPID keys. The design point interviewers care about is **permission UX**: never call `Notification.requestPermission()` on load. Ask after a user action that implies wanting them, with your own pre-prompt explaining the value, and only escalate to the browser prompt if they say yes — a denial is permanent and unrecoverable per origin. Handle click-through routing in the service worker (focus an existing tab if one is open rather than opening a new one), collapse duplicates with a `tag`, and respect quiet hours server-side.

**Rendering.** Toasts: a queue with a concurrency cap (3–5), auto-dismiss timers that **pause on hover and focus**, dedupe by key, and manual dismiss. Never auto-dismiss anything containing an error the user must act on. For the centre, paginate with a cursor and group by day.

**Accessibility.** `role="status"` (`aria-live="polite"`) for ordinary toasts, `role="alert"` for errors — and nothing else assertive, because assertive announcements interrupt whatever the user is reading. Toasts must be reachable by keyboard and must not steal focus. Anything with an action needs to be dismissible without a mouse and needs enough time; auto-dismiss under ~5 seconds fails WCAG 2.2.1 unless it's pausable.

## Why it matters

It's the prompt where transport choice actually has a defensible answer, so it's a clean opportunity to argue a tradeoff instead of listing options. The multi-tab and permission-UX parts are the two places senior candidates separate themselves, and both come from having shipped this rather than read about it.

## Key points

- Split toasts, the notification centre and web push into three designs; they share only an icon.
- SSE beats WebSockets for server-to-client notification streams — built-in reconnect, plain HTTP, existing auth.
- Resume from a `Last-Event-ID` cursor after a disconnect so notifications aren't silently dropped.
- Elect one leader tab to hold the connection and fan out with `BroadcastChannel`; unread count must be consistent across tabs.
- Never request notification permission on page load — a denial is permanent, so gate it behind an intent-revealing action and your own pre-prompt.
- Handle push clicks in the service worker by focusing an existing tab, and collapse duplicates with a `tag`.
- Cap concurrent toasts, dedupe by key, and pause auto-dismiss on hover and focus.
- Use `role="status"` for normal toasts and reserve `role="alert"` for genuine errors.
- Toasts must never steal focus, and must be dismissible from the keyboard.
