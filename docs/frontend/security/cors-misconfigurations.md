---
title: CORS Misconfigurations
summary: The permissive settings that turn a relaxation of the same-origin policy into a data breach.
level: core
minutes: 20
order: 6
tags: [security, cors, api]

related:
  - frontend/browser-platform/fetch-cors-and-credentials
  - frontend/security/the-browser-security-model
  - frontend/security/security-headers

resources:
  - title: Cross-Origin Resource Sharing (CORS)
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
    source: MDN
    type: docs
    minutes: 35
    primary: true
  - title: CORS misconfiguration
    url: https://portswigger.net/web-security/cors
    source: PortSwigger
    type: docs
    minutes: 30
  - title: Access-Control-Allow-Origin
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin
    source: MDN
    type: docs
    minutes: 15
---

## In one line

CORS is the server saying "this origin may read my responses", so a careless implementation hands attacker-controlled sites the ability to read authenticated data.

## What it is

The dangerous pattern is short enough to spot in review: reflecting the request's `Origin` header into `Access-Control-Allow-Origin` while also setting `Access-Control-Allow-Credentials: true`. That combination means *any* origin can make credentialed requests to your API and read the responses — a full read of the user's data from any page they visit. The spec forbids `*` with credentials for exactly this reason, and reflection is the workaround people reach for when the wildcard is rejected.

The near-miss variants are just as common. A regex like `/example\.com$/` matches `notexample.com` and `evil-example.com`. Prefix matching on `https://app.example.com` matches `https://app.example.com.evil.com`. Trusting `null` — which is what sandboxed iframes and some redirects send — is trusting any attacker who can produce a null origin.

The correct implementation is an explicit allowlist of full origin strings compared for exact equality, with `Vary: Origin` set so caches do not serve one origin's permissive response to another. That `Vary` header is a real bug source: without it, a CDN can cache the ACAO for origin A and return it to origin B.

Two adjacent misconceptions worth clearing. **CORS is not authorisation.** It controls which origins may read a response in a browser; it does nothing about server-to-server requests, curl, or a mobile app. Access control still has to be enforced on the endpoint. And **CORS does not protect against CSRF** — it governs reading, not sending.

Finally, be conservative with `Access-Control-Expose-Headers`, which decides what response headers client script can see, and with wide `Allow-Headers` lists that let arbitrary headers through preflight. Internal APIs deserve particular care: a permissive CORS policy on an internal service reachable from a browser is a route from a phished employee's tab into the internal network.

## Why it matters

A reflected-origin-with-credentials misconfiguration is a critical, easily exploited data-exposure bug, and it appears regularly in real audits because it is the fastest way to make a CORS error go away.

Interviewers ask "what's wrong with reflecting the origin?" precisely because the reflex fix is the vulnerability.

## Key points

- Reflecting the request origin while allowing credentials lets any site read authenticated responses.
- Regex and prefix matching on origins are routinely bypassable — compare full origin strings for equality.
- Never trust a `null` origin; sandboxed frames and some redirects can produce it.
- Set `Vary: Origin` or a cache will serve one origin's allowance to another.
- CORS is not authorisation and does not stop CSRF — it only governs cross-origin reads in a browser.
- Keep `Expose-Headers` and `Allow-Headers` narrow, and treat internal APIs as a higher-risk case.
