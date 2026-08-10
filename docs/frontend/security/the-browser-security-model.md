---
title: The Browser Security Model
summary: Origins, the same-origin policy, and the boundaries everything else in frontend security is built on.
level: core
minutes: 25
order: 1
tags: [security, browser, fundamentals]

related:
  - frontend/browser-platform/fetch-cors-and-credentials
  - frontend/security/xss-and-output-encoding
  - _shared/security-fundamentals

resources:
  - title: Same-origin policy
    url: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: Web security
    url: https://developer.mozilla.org/en-US/docs/Web/Security
    source: MDN
    type: docs
    minutes: 30
  - title: Cross-Origin Resource Policy
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Resource-Policy
    source: MDN
    type: docs
    minutes: 15
---

## In one line

The origin — scheme, host, port — is the browser's unit of trust, and the same-origin policy is the rule that one origin's code cannot read another origin's data.

## What it is

An origin is the triple: `https://app.example.com:443`. Change any part and it is a different origin. `http` and `https` on the same host are different origins; `app.example.com` and `api.example.com` are different origins. Everything else in browser security is defined relative to that boundary.

The **same-origin policy** governs *reading*. A page may freely send requests to other origins, embed their images, load their scripts, and submit forms to them — what it may not do is read the responses, inspect a cross-origin iframe's DOM, or read another origin's cookies and storage. That asymmetry is precisely why CSRF exists as a category: the request goes through, the attacker just cannot see the answer.

Two things are usually confused with the origin and are not. **The site** (registrable domain plus scheme) is a broader unit used by `SameSite` cookies, so `app.example.com` and `evil.example.com` are the same site but different origins. And **the document's origin can be inherited** — `about:blank` and `srcdoc` iframes take the parent's origin, which is why an unsanitised `srcdoc` is same-origin script execution.

**CORS** is the server's mechanism for relaxing the read restriction, and **postMessage** is the sanctioned channel for cross-origin communication between windows — where `event.origin` must be checked on receipt and a specific `targetOrigin` given on send. Passing `"*"` is how message-based auth flows leak tokens.

The newer isolation headers exist because Spectre made "you cannot read it" weaker than it sounds. `Cross-Origin-Resource-Policy` lets a resource refuse to be embedded cross-origin, `Cross-Origin-Opener-Policy` severs the window reference an opener would otherwise keep, and the two together enable cross-origin isolation — the precondition for `SharedArrayBuffer`.

The model's limits are worth stating plainly: it protects origins from each other, not the user from a compromised origin. Any script running on your origin has everything your origin has.

## Why it matters

XSS, CSRF, CORS, cookie flags, clickjacking, and postMessage bugs are all consequences of this model. Learning them individually is memorisation; learning the model makes them derivable.

"Explain the same-origin policy" is also among the most-asked security questions in frontend interviews.

## Key points

- An origin is scheme + host + port; any difference makes it a separate origin.
- The policy restricts *reading* responses, not sending requests — which is exactly why CSRF works.
- Site is broader than origin and is what `SameSite` cookies use, so subdomains are same-site but cross-origin.
- `about:blank` and `srcdoc` frames inherit the parent origin, making unsanitised `srcdoc` equivalent to inline script.
- `postMessage` needs a specific `targetOrigin` on send and an `event.origin` check on receipt; `"*"` leaks.
- COOP, COEP, and CORP tighten isolation post-Spectre and gate `SharedArrayBuffer`.
- The model does not protect you from your own compromised origin — that is what XSS defences are for.
