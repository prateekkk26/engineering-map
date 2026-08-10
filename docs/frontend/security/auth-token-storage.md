---
title: Auth Token Storage
summary: Where a session lives in the browser, why localStorage is the wrong answer, and how refresh works without leaking.
level: core
minutes: 25
order: 9
tags: [security, auth, cookies]

related:
  - frontend/nextjs/authentication-in-nextjs
  - frontend/security/csrf-and-samesite-cookies
  - frontend/browser-platform/browser-storage

resources:
  - title: Using HTTP cookies
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Session Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
    source: OWASP
    type: docs
    minutes: 30
  - title: JSON Web Token Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
    source: OWASP
    type: docs
    minutes: 25
---

## In one line

Put the session in an httpOnly, Secure, SameSite cookie — anything readable by JavaScript is one XSS away from being stolen, and "we'll just prevent XSS" is not a plan.

## What it is

The trade-off is usually framed as XSS versus CSRF, and that framing is misleading. `localStorage` exposes the token to **any** script on the origin — your code, a dependency, an analytics tag, an injected payload — and exfiltration is a single line. Cookie CSRF, by contrast, is well understood and fully mitigated by `SameSite` plus a token. One risk has a complete defence; the other does not. That asymmetry is why httpOnly cookies win.

The flags are the whole mechanism. `HttpOnly` removes it from `document.cookie`. `Secure` restricts it to HTTPS. `SameSite=Lax` or `Strict` blocks cross-site attachment. `Path` and `Domain` should be as narrow as the app allows — a cookie scoped to the parent domain is readable by every subdomain, including a compromised one. `__Host-` as a name prefix enforces `Secure`, no `Domain`, and `Path=/`, which is a cheap guarantee.

**Session identifiers beat self-contained tokens** for browser sessions. An opaque id can be revoked instantly server-side; a JWT is valid until it expires, so logout is advisory and a stolen token stays useful. If you do use JWTs, keep them short-lived and pair them with a refresh token and a revocation list.

**Refresh** is where designs go wrong. The refresh token should be httpOnly, `SameSite=Strict`, and scoped to the refresh endpoint's path only, so it is never sent with ordinary requests. Rotate it on every use and treat reuse of a rotated token as theft: revoke the family. Never keep a refresh token where script can read it.

Two application-level rules. **In-memory storage** is the least-bad option when a cookie genuinely will not work — a token in a closure dies on refresh, which is inconvenient but not persistent. And regardless of storage, **rotate the session id on privilege change** — login, elevation, password change — or you have session fixation.

Where multiple tabs are involved, the `BroadcastChannel` API keeps logout consistent across them; without it, one tab stays "logged in" after another signs out, which is a real correctness and support problem.

## Why it matters

"Where do you store the JWT?" is close to a guaranteed frontend interview question, and `localStorage` — still the most common answer — is the wrong one for a specific, explainable reason.

It is also a high-consequence decision: a stolen session is full account takeover, and the storage choice determines how easily one is stolen.

## Key points

- `localStorage` is script-readable, so any XSS or malicious dependency exfiltrates the session in one line.
- CSRF has a complete defence (`SameSite` plus a token); XSS-driven token theft does not — hence httpOnly cookies.
- Set `HttpOnly`, `Secure`, `SameSite`, narrow `Path`/`Domain`, and use the `__Host-` prefix where possible.
- Opaque session ids can be revoked instantly; JWTs stay valid until expiry, making logout advisory.
- Refresh tokens are httpOnly, `SameSite=Strict`, path-scoped, rotated on use, with reuse treated as theft.
- Use in-memory storage if a cookie is impossible — it dies on refresh rather than persisting.
- Rotate the session id on login and privilege change, and sync logout across tabs with `BroadcastChannel`.
