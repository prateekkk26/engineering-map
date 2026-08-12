---
title: Authentication vs Authorization
summary: Two questions that get conflated — who is calling, and what they may do — and why the second one is where breaches actually happen.
level: core
minutes: 20
order: 1
tags: [auth, security]

related:
  - backend/auth/authorization-models-and-multi-tenancy
  - frontend/security/server-action-and-rsc-authorisation
  - backend/backend-security/injection-and-untrusted-input

resources:
  - title: Authorization Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 20
    primary: true
  - title: A01:2021 — Broken Access Control
    url: https://owasp.org/Top10/A01_2021-Broken_Access_Control/
    source: OWASP
    type: article
    minutes: 15
  - title: Authentication Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 25
---

## In one line

Authentication establishes who is calling; authorization decides whether that identity may perform this specific action on this specific object — and the second check is the one people forget to write.

## What it is

Authentication happens once per session and is largely a solved, delegable problem: a password or an identity provider, a token or a cookie, and a middleware that turns a request into a `user`. Almost every team should buy or delegate this rather than build it.

Authorization happens on **every request, for every object**, and it cannot be delegated because it encodes your domain. It has two layers people routinely collapse into one. **Can this user perform this kind of action at all** — is an editor allowed to publish? That's a role check, and it lives naturally in middleware. **Can this user perform it on this particular row** — is this *their* document? That's an object-level check, and it can only be made where the object is loaded.

Missing the second layer is **IDOR** (insecure direct object reference), and it is consistently the most common serious vulnerability in real applications: `GET /invoices/1042` returns someone else's invoice because the handler authenticated the caller and then looked up the invoice by ID alone. The fix is structural, not vigilant — scope every query by the caller's tenant or owner (`WHERE id = $1 AND org_id = $2`), so the unauthorised row is not merely rejected but never selected. Route-level middleware cannot do this; it doesn't know which row you're about to fetch.

Two adjacent distinctions worth being crisp about. `401` means "I don't know who you are" and `403` means "I do, and no" — clients branch on this to decide whether to refresh a token or show an error. And **authorization is not just for reads**: list endpoints must filter, not just detail endpoints, or the resource leaks through a search result instead of a direct fetch.

In a Next.js codebase this gets its own trap: authorization must be enforced in the server action or route handler itself, because a hidden button and a client-side redirect are UI, not security.

## Why it matters

Broken access control is the number one item on the OWASP Top 10, and unlike XSS it is not something a framework prevents for you. In interviews it appears as an innocuous follow-up — "how do you make sure a user only sees their own orders?" — where the strong answer is scoping the query, not adding an `if` after the fetch.

## Key points

- Authentication is one check per session; authorization is a check per action *and* per object.
- Object-level authorization can't live in route middleware, because middleware doesn't know which record you'll load.
- Scope queries by owner or tenant so unauthorised rows are never selected — a post-fetch `if` is one refactor away from being deleted.
- IDOR is the default failure of any handler that trusts an ID from the URL.
- List and search endpoints leak just as effectively as detail endpoints; filter them at the query.
- `401` is "who are you", `403` is "not allowed" — the distinction drives client retry and refresh behaviour.
- Hiding a button is UX; the server still has to refuse the request.
