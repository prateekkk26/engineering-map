---
title: CSRF & SameSite Cookies
summary: Why the browser attaches your cookies to someone else's request, and the two defences that actually work.
level: core
minutes: 25
order: 5
tags: [security, csrf, cookies]

related:
  - frontend/security/auth-token-storage
  - frontend/browser-platform/fetch-cors-and-credentials
  - frontend/security/the-browser-security-model

resources:
  - title: Cross-site request forgery (CSRF)
    url: https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: SameSite cookies explained
    url: https://web.dev/articles/samesite-cookies-explained
    source: web.dev
    type: article
    minutes: 25
  - title: CSRF Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
    source: OWASP
    type: docs
    minutes: 30
---

## In one line

Cookies are attached by the browser based on the destination, not the initiator, so a form on an attacker's page can perform an authenticated action on your site — and `SameSite` plus a token is how you stop it.

## What it is

The attack needs three conditions: the user is logged in with a cookie session, the action is state-changing, and the request can be triggered cross-site. An `<img src>` fires a GET; a hidden auto-submitting form fires a POST with `application/x-www-form-urlencoded` — neither is preflighted, so CORS never gets involved. The attacker cannot read the response, but they do not need to: the transfer already happened.

**`SameSite` is the primary modern defence.** `Strict` never sends the cookie on a cross-site request, which is safest and breaks the case where a user follows a link into your app and appears logged out. `Lax` — now the browser default — sends it on top-level GET navigations only, which blocks the form-POST attack while keeping inbound links working. `None` sends it always and requires `Secure`; you need it only for genuine third-party contexts like an embedded widget.

Because `Lax` is the default, plain CSRF is far less common than it was. It is not gone: same-site subdomains are not cross-site, so an XSS or takeover on `blog.example.com` can still forge requests to `app.example.com`.

**Tokens are the second layer** and the one to add for anything sensitive. The double-submit pattern sets a random value in a cookie and requires it echoed in a header — the attacker can cause the cookie to be sent but cannot read it to set the header. A server-side synchroniser token is stronger still. Frameworks with server actions generally handle this for you, which is a reason to use the framework's mutation path rather than hand-rolled endpoints.

Two rules keep the surface small. **GET must never change state** — a "delete" link is a CSRF vulnerability by construction, and a prefetching browser or link scanner will eventually fire it. And **custom headers help by accident**: requiring `Content-Type: application/json` or an `X-Requested-With` header forces a preflight, which cross-site form posts cannot satisfy.

Token-in-header auth (an `Authorization` bearer) is not CSRF-prone at all, since nothing is attached automatically — but it trades the problem for XSS exposure.

## Why it matters

Any cookie-authenticated app has this surface, and the `SameSite` defaults mean many teams have never had to think about it — which makes the subdomain and `None` cases easy to get wrong.

"How does CSRF work and why doesn't CORS stop it?" is a standard interview question, and the answer requires understanding that the request succeeds even though the response is unreadable.

## Key points

- The browser attaches cookies by destination; CORS blocks reading the response, not sending the request.
- `Lax` is the modern default and stops cross-site form POSTs while preserving inbound links; `Strict` is safer and can surprise users.
- `SameSite=None` requires `Secure` and is only for genuine third-party embedding.
- Same-site subdomains bypass `SameSite` — a compromised subdomain can still forge requests.
- Add a double-submit or synchroniser token for sensitive actions; framework server actions usually provide one.
- GET must never mutate state — prefetchers and scanners will trigger it.
- Requiring a JSON content type or a custom header forces a preflight that simple form posts cannot produce.
