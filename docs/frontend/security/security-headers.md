---
title: Security Headers
summary: The response headers worth setting, what each actually prevents, and the ones that are now obsolete.
level: core
minutes: 20
order: 8
tags: [security, headers, http]

related:
  - frontend/security/content-security-policy
  - frontend/security/clickjacking-and-framing
  - frontend/nextjs/deployment-runtimes-and-hosting

resources:
  - title: HTTP headers for security
    url: https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides
    source: MDN
    type: docs
    minutes: 30
    primary: true
  - title: Mozilla Observatory
    url: https://developer.mozilla.org/en-US/observatory
    source: Mozilla
    type: docs
    minutes: 15
  - title: Strict-Transport-Security
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security
    source: MDN
    type: docs
    minutes: 15
---

## In one line

A handful of response headers close whole classes of attack for the cost of a config change, and knowing which ones still matter is most of the skill.

## What it is

The set worth setting, and what each buys:

**`Strict-Transport-Security`** forces HTTPS for the whole domain for a stated duration, defeating downgrade attacks and the first-request-over-HTTP window. `max-age=63072000; includeSubDomains; preload` is the standard value — note that `preload` is close to irreversible, so be certain every subdomain can serve HTTPS before submitting.

**`Content-Security-Policy`** is the largest one and has its own topic; `frame-ancestors` within it is the clickjacking control.

**`X-Content-Type-Options: nosniff`** stops the browser second-guessing your `Content-Type`, which is what turns an uploaded "image" containing HTML into an XSS vector.

**`Referrer-Policy: strict-origin-when-cross-origin`** — now the browser default — stops full URLs, which often contain ids or tokens, leaking to third parties in the `Referer` header.

**`Permissions-Policy`** disables features you do not use: `camera=(), microphone=(), geolocation=()`. Its main value is limiting what an injected script or embedded third party can ask for.

**The cross-origin isolation trio** — `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, and `Cross-Origin-Resource-Policy` — mitigate Spectre-class attacks and are the precondition for `SharedArrayBuffer`. COEP in particular breaks third-party embeds that lack the right headers, so it needs a rollout plan.

Two headers are obsolete and should be removed: **`X-XSS-Protection`**, whose auditor was removed from browsers and could itself introduce bugs, and **`Expect-CT`**, which certificate transparency made unnecessary. Setting them signals a copied checklist rather than understanding.

Delivery matters as much as the values. Set them at the edge — CDN or reverse proxy — so coverage does not depend on every route remembering, and verify with a scanner against production rather than assuming the config applied. And check that error pages, redirects, and static assets carry them too, since those are the paths that quietly miss.

## Why it matters

This is the highest ratio of protection to effort in web security, and header configuration is a standard item in enterprise security reviews and procurement questionnaires.

In interviews it is a fast competence check: naming the current set and knowing which two are dead separates current knowledge from a 2016 blog post.

## Key points

- HSTS with a long `max-age` and `includeSubDomains`; treat `preload` as effectively permanent.
- `nosniff` prevents content-type guessing turning an upload into executable HTML.
- `Referrer-Policy: strict-origin-when-cross-origin` keeps URL-embedded identifiers out of third-party logs.
- `Permissions-Policy` denies unused capabilities, limiting what injected or embedded code can request.
- COOP, COEP, and CORP give cross-origin isolation and gate `SharedArrayBuffer`; COEP needs a rollout plan.
- Remove `X-XSS-Protection` and `Expect-CT` — both are obsolete.
- Set headers at the edge and verify against production, including error pages and redirects.
