---
title: API Keys & Service-to-Service Auth
summary: Authenticating callers that aren't people — how to store a key, scope it, rotate it, and what replaces keys between your own services.
level: core
minutes: 20
order: 6
tags: [auth, api, secrets]

related:
  - backend/backend-security/secrets-and-key-management
  - backend/auth/jwt-and-when-not-to-use-it
  - backend/api-design/rate-limits-and-quotas

resources:
  - title: Secrets Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 25
  - title: API keys
    url: https://docs.stripe.com/keys
    source: Stripe
    type: docs
    minutes: 10
    primary: true
  - title: OAuth 2.0 Client Credentials grant
    url: https://www.rfc-editor.org/rfc/rfc6749#section-4.4
    source: IETF
    type: docs
    minutes: 15
---

## In one line

An API key is a password for a program, so it gets the same treatment as one — hashed at rest, scoped, rotatable, and never in a URL.

## What it is

A key has a **prefix and a secret**: `sk_live_` plus random bytes. The prefix is doing real work — it tells a human which environment they're holding, and it lets secret scanners (GitHub's, your own CI) recognise a leak in a commit. Store only a **hash** of the secret half, so a database dump doesn't hand over every customer's key. Keep the first few characters in plaintext as a display hint, because users need to identify a key in a list without you being able to show it again.

Scope keys narrowly: per environment, per integration, ideally per permission set, and never one key that can do everything. Support **multiple live keys per account**, because that is the only way rotation works without downtime — issue the new one, migrate callers, watch last-used timestamps, then revoke. A key you can't rotate without an outage will not be rotated after a leak.

Keys travel in the `Authorization` header, never in a query string, where they end up in access logs, browser history, and referrer headers. Log the key's **ID**, never the key. Track `last_used_at` and the calling IP — that's what makes "is this key still needed?" and "when did the attacker start?" answerable questions.

**Between your own services**, keys are the weakest option, because a static shared secret sits in configuration everywhere and rotates never. Better, in ascending order: short-lived tokens from the client-credentials grant; workload identity issued by your platform (a cloud IAM role, a Kubernetes service account token) so no secret is stored at all; or **mTLS**, where each service has a certificate and identity is the connection itself. The direction of travel is the same in all three: from long-lived shared secrets toward short-lived, automatically-issued credentials.

One thing keys are genuinely good for that sessions aren't: **attribution**. A key identifies an integration, so rate limits, quotas, audit logs and billing all have something stable to key on.

## Why it matters

Every AI product ships an API and calls three others, so key handling is daily work — and leaked keys are one of the most common real incidents, usually via a committed `.env` or a key in a URL. In interviews it shows up as "how would you let customers call this programmatically", where scoping, hashing and rotation are the expected answers.

## Key points

- Store a hash of the key, not the key; keep a prefix in plaintext for display and leak scanning.
- Prefixes that identify environment and vendor let automated scanners catch a leak before an attacker does.
- Rotation requires supporting two valid keys at once, plus last-used telemetry to know when the old one is dead.
- Keys go in headers — a key in a query string is in every access log along the path.
- Scope per environment and per permission set; one all-powerful key is a single point of compromise.
- For service-to-service, prefer short-lived tokens, workload identity, or mTLS over a static shared secret.
- Keys give you a stable identity for rate limiting, quotas, billing and audit that a user session can't.
