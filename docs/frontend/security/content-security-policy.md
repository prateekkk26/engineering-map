---
title: Content Security Policy
summary: A header that tells the browser what your page is allowed to load and execute, and how to deploy one without breaking the site.
level: core
minutes: 25
order: 3
tags: [security, csp, headers]

related:
  - frontend/security/xss-and-output-encoding
  - frontend/security/security-headers
  - frontend/security/third-party-scripts-and-tag-managers

resources:
  - title: Content Security Policy (CSP)
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
    source: MDN
    type: docs
    minutes: 35
    primary: true
  - title: Strict CSP
    url: https://web.dev/articles/strict-csp
    source: web.dev
    type: article
    minutes: 25
  - title: CSP Evaluator
    url: https://csp-evaluator.withgoogle.com/
    source: Google
    type: docs
    minutes: 10
---

## In one line

CSP is an allowlist declaring which sources a page may load scripts, styles, images and frames from — a second line of defence that turns a successful injection into a blocked request.

## What it is

The header lists directives, each naming a resource type and its permitted sources: `script-src`, `style-src`, `img-src`, `connect-src`, `frame-src`, `frame-ancestors`. `default-src` covers what you did not specify.

The single most important thing about a CSP is whether it contains `unsafe-inline` in `script-src`. If it does, injected inline script still executes and the policy provides almost nothing against XSS. Host allowlists are also weaker than they look: one CDN in your list that hosts an outdated Angular or a JSONP endpoint is a bypass.

**Strict CSP** is the modern recommendation and it avoids both problems. Generate a per-request **nonce**, put it on your own script tags, and write `script-src 'nonce-{random}' 'strict-dynamic'`. `strict-dynamic` propagates trust to scripts loaded by an already-trusted script, which is what makes it work with bundlers and tag managers without listing every host. The nonce must be cryptographically random and regenerated per response — a static nonce is decoration.

Deployment is where CSPs die. Ship `Content-Security-Policy-Report-Only` with a `report-to` endpoint first, watch real traffic for a week or two, fix what legitimately breaks, and only then enforce. Enforcing a hand-written policy directly is how you take down a checkout flow.

Two directives are worth setting even if you do nothing else. `frame-ancestors` replaces `X-Frame-Options` and is the real clickjacking defence. `object-src 'none'` closes a legacy plugin surface for free. `base-uri 'none'` prevents base-tag injection that redirects every relative URL.

The framework interaction matters in Next.js: a nonce must be generated per request, which requires a dynamically rendered response — a fully static page cannot carry one. That is why nonce generation typically lives in `proxy.ts` (renamed from `middleware.ts` in Next 16), and why adding a nonce has rendering consequences worth knowing before you commit.

## Why it matters

CSP is the defence-in-depth layer that decides whether an XSS bug is an incident or a console error, and a strict one is increasingly a requirement in security reviews and enterprise procurement.

Interviewers ask about it because a superficially present but `unsafe-inline`-containing policy is extremely common — spotting that is the signal.

## Key points

- `unsafe-inline` in `script-src` defeats most of the point; host allowlists are bypassable through one permissive CDN.
- Strict CSP uses a per-request nonce plus `strict-dynamic`, which works with bundlers without enumerating hosts.
- The nonce must be cryptographically random and regenerated on every response.
- Roll out in report-only mode with a reporting endpoint before enforcing.
- `frame-ancestors` is the real clickjacking control; add `object-src 'none'` and `base-uri 'none'`.
- In Next.js a nonce forces dynamic rendering — generate it in `proxy.ts` and accept the trade.
