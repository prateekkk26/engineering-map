---
title: Sessions & Cookies
summary: The boring, correct default for browser auth — an opaque session ID in a hardened cookie — and the four attributes that make it safe.
level: core
minutes: 25
order: 2
tags: [auth, sessions, cookies, security]

related:
  - backend/auth/jwt-and-when-not-to-use-it
  - frontend/security/csrf-and-samesite-cookies
  - frontend/security/auth-token-storage

resources:
  - title: Session Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 30
    primary: true
  - title: Set-Cookie
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
    source: MDN
    type: docs
    minutes: 15
  - title: RFC 6265bis — Cookies
    url: https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis
    source: IETF
    type: docs
    minutes: 40
---

## In one line

A server-side session is a random opaque ID in a cookie pointing at state you control, which is why you can revoke it instantly — the one thing a self-contained token can't do.

## What it is

The mechanism is old and still correct. On login, generate a cryptographically random identifier (128 bits or more, from a CSPRNG — never a counter, a UUIDv1, or anything derived from the user), store the session record server-side keyed by it, and set it as a cookie. Every subsequent request carries the cookie, you look up the record, and you have a user plus whatever else you chose to keep there.

Four cookie attributes do the security work. **`HttpOnly`** keeps JavaScript from reading it, so an XSS bug can still act as the user but can't exfiltrate a durable credential. **`Secure`** stops it travelling over plaintext HTTP. **`SameSite=Lax`** (the sensible default) means the cookie isn't sent on cross-site `POST`s, which kills most CSRF; `Strict` breaks inbound links, and `None` requires `Secure` and reintroduces the need for CSRF tokens. **`Path`/`Domain`** should be as narrow as possible — a cookie scoped to `.example.com` is readable by every subdomain, including the one running a third-party app.

Lifecycle is where implementations get sloppy. **Regenerate the session ID on every privilege change** — login, and password change especially — or session fixation lets an attacker plant a known ID and inherit the authenticated session. Enforce both an **idle timeout** and an **absolute lifetime**, because a session that refreshes forever is a permanent credential. Logout must **delete the server-side record**, not just clear the cookie; clearing the cookie on a stolen session accomplishes nothing.

The property that makes this worth the lookup is **revocation**. Deleting a row logs a user out everywhere, immediately: after a breach, on a password change, when an admin disables an account. You can also list active sessions with device and IP, which users expect. The cost is a store lookup per request — cheap in Redis, and cheap enough in Postgres for most products.

For a Next.js app this is the default worth defending: a session cookie read in a server component or middleware, with the record in your own database.

## Why it matters

"Sessions or JWTs?" is one of the most common backend design questions in a full-stack loop, and the expected senior answer starts from revocation and cookie attributes rather than from scalability folklore. Every attribute here also maps to a specific real attack — CSRF, XSS exfiltration, fixation — which is exactly what the follow-up probes.

## Key points

- A session ID must be high-entropy and random; anything guessable or derived is a takeover.
- `HttpOnly` + `Secure` + `SameSite=Lax` is the baseline, and each one blocks a different attack.
- `SameSite=Lax` handles most CSRF, but any cross-site `POST` flow puts CSRF tokens back on the table.
- Regenerate the session ID at login and on privilege change to defeat fixation.
- Enforce idle *and* absolute timeouts — a perpetually-refreshing session is a permanent credential.
- Logout deletes the server record; clearing the cookie alone does nothing to a stolen ID.
- Server-side sessions buy instant, global revocation, which is the decisive advantage over self-contained tokens.
