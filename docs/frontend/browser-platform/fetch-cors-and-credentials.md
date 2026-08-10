---
title: Fetch, CORS & Credentials
summary: Why the browser blocks a response it already received, what makes a request preflighted, and how credentials change the rules.
level: core
minutes: 25
order: 12
tags: [http, cors, security, fetch]

related:
  - frontend/security/cors-misconfigurations
  - frontend/security/csrf-and-samesite-cookies
  - frontend/browser-platform/http-caching

resources:
  - title: Cross-Origin Resource Sharing (CORS)
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
    source: MDN
    type: docs
    minutes: 35
    primary: true
  - title: Using the Fetch API
    url: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    source: MDN
    type: docs
    minutes: 25
  - title: Same-origin policy
    url: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
    source: MDN
    type: docs
    minutes: 20
---

## In one line

The same-origin policy stops one site reading another's responses, and CORS is the server's way of granting an exception — which is why a CORS error is always fixed on the server, never in the client.

## What it is

An origin is scheme plus host plus port. By default a page may *send* cross-origin requests but not *read* the responses — that restriction is what stops a malicious page reading your webmail using your cookies.

So a CORS failure is not the request being blocked. The request usually happened, the server processed it, and the browser refused to hand you the response because the headers did not permit it. This is why adding headers to your fetch call never helps: the permission has to come from the responding server as `Access-Control-Allow-Origin`.

**Simple requests** go straight out: `GET`, `HEAD`, or `POST` with a content type of `text/plain`, `application/x-www-form-urlencoded`, or `multipart/form-data`, and no unusual headers. Note what is missing — `application/json` is not on that list, which is why nearly every real API call is preflighted.

**Preflight** is an automatic `OPTIONS` request asking permission before the real one, triggered by a non-simple method, a custom header such as `Authorization` or `X-Request-Id`, or a JSON content type. The server answers with the allowed origins, methods, and headers. `Access-Control-Max-Age` lets the browser cache that answer, which matters because otherwise every request costs two round trips.

**Credentials** change everything. Cookies are not sent cross-origin unless you set `credentials: 'include'`, and when you do, the server must reply with `Access-Control-Allow-Credentials: true` and a *specific* origin — the wildcard is forbidden with credentials, deliberately. `SameSite` on the cookie applies on top, so a `Lax` cookie still will not go cross-site.

Two fetch behaviours that surprise people: `fetch` does not reject on 4xx or 5xx, so you must check `res.ok` yourself; and it does not time out by default, which is what `AbortSignal.timeout()` is for.

`no-cors` mode is not a workaround. It returns an opaque response you cannot read — useful only for fire-and-forget or cache population.

## Why it matters

Every frontend developer hits CORS, and the ones who understand it fix it in minutes while the others try client-side workarounds for an afternoon. "Explain CORS" is close to a universal interview question.

The credentials rules are also the foundation for CSRF discussions, which is where the security follow-up goes.

## Key points

- Same-origin restricts *reading* responses, not sending requests — a CORS error means the response was withheld from you.
- CORS is granted by the responding server; nothing you add to the client fixes it.
- `application/json` bodies, custom headers, and non-simple methods all trigger a preflight `OPTIONS`.
- `Access-Control-Max-Age` caches preflight results and removes a round trip per request.
- Credentialed requests require `credentials: 'include'`, an explicit allowed origin, and `Allow-Credentials: true` — no wildcards.
- `fetch` resolves on 4xx and 5xx, so check `res.ok`; add `AbortSignal.timeout()` because there is no default timeout.
- `no-cors` yields an unreadable opaque response and is not a workaround.
