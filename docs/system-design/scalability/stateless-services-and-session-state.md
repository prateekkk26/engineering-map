---
title: Stateless Services & Session State
summary: Getting state out of the process so any instance can serve any request — and where that state goes instead.
level: core
minutes: 20
order: 2
tags: [scalability, architecture, sessions]

related:
  - system-design/scalability/vertical-vs-horizontal-scaling
  - system-design/building-blocks/dns-and-load-balancing
  - frontend/security/auth-token-storage

resources:
  - title: The Twelve-Factor App — Processes
    url: https://12factor.net/processes
    source: Adam Wiggins
    type: docs
    minutes: 10
    primary: true
  - title: Session Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
    source: OWASP
    type: docs
    minutes: 25
  - title: JSON Web Tokens — Introduction
    url: https://jwt.io/introduction
    source: jwt.io
    type: docs
    minutes: 15
---

## In one line

A stateless service keeps nothing in process memory that a later request depends on, so instances become interchangeable and can be added, removed or killed at will.

## What it is

Statelessness is what makes horizontal scaling work. If request two must reach the same instance as request one, you can't load balance freely, autoscaling breaks, a deploy logs everyone out, and one instance failing takes its users' sessions with it.

**Where the state goes.**

*Session data* → a shared store, normally Redis, keyed by an opaque session ID in a cookie. Or a signed token (JWT) carrying the claims, so there's no lookup at all.

*The tradeoff between those two.* Server-side sessions are revocable instantly and can hold as much as you like; they cost a network round trip per request and a store to operate. JWTs are stateless and fast to verify, but **you cannot revoke one before it expires** — the standard mitigations are short-lived access tokens with refresh tokens, plus a denylist, which quietly reintroduces the shared store. For a normal web product, server-side sessions in Redis are the better default; JWTs earn their place across service or origin boundaries where a shared session store isn't practical.

*Uploads in progress, temp files* → object storage or a shared volume, not local disk.

*In-memory caches* → fine, as long as they're an optimisation, not a source of truth. Accept that each instance has its own, so hit rates drop as you scale out and invalidation is per-instance. If that matters, move to a shared cache.

*WebSocket connections* are inherently stateful — the connection lives on one instance. The pattern is to keep the *connection* local and the *routing* shared: a pub/sub layer or a presence registry so any instance can deliver a message to a user connected elsewhere.

**Sticky sessions** paper over all of this by pinning a user to an instance. They work, and they cost you even load distribution, clean deploys and instance-failure tolerance. Treat wanting them as a signal that something belongs in a shared store.

**Config and secrets** come from the environment, not from files baked per instance — same principle: instances are interchangeable and disposable.

## Why it matters

"Scale the API horizontally" is a sentence every candidate says; the follow-up — "where does the session live, and what happens to a user whose instance is being replaced during a deploy?" — is what separates having said it from having done it. It's also the precondition for autoscaling, blue-green deploys and spot instances, all of which assume a process can be killed at any moment.

## Key points

- Stateless means no in-process state a later request depends on; instances become interchangeable.
- Session state belongs in a shared store or in a signed token, never in process memory.
- Server-side sessions are revocable instantly; JWTs are not, until they expire.
- Short-lived access tokens plus refresh tokens are the standard JWT mitigation — and a denylist re-adds the shared store.
- Local in-memory caches are fine as optimisations; hit rate falls and invalidation gets awkward as you scale out.
- WebSockets pin a connection to an instance — keep routing shared via pub/sub or a presence registry.
- Sticky sessions are a smell: they trade even load, clean deploys and failure tolerance for convenience.
