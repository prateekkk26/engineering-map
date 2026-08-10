---
title: Clickjacking & Framing
summary: Getting a user to click something they cannot see, and the header that stops your site being framed.
level: core
minutes: 15
order: 7
tags: [security, clickjacking, headers]

related:
  - frontend/security/content-security-policy
  - frontend/security/security-headers
  - frontend/browser-platform/shadow-dom-and-web-components

resources:
  - title: Clickjacking Defense Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html
    source: OWASP
    type: docs
    minutes: 20
    primary: true
  - title: CSP frame-ancestors
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
    source: MDN
    type: docs
    minutes: 15
  - title: X-Frame-Options
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options
    source: MDN
    type: docs
    minutes: 15
---

## In one line

An attacker loads your page in a transparent iframe over their own UI, so the user's click on a harmless-looking button lands on your "confirm" — and `frame-ancestors` is the fix.

## What it is

The technique is simple. Your page is framed at opacity zero, positioned so a sensitive control sits exactly under something the attacker's page invites the user to click. The user is genuinely authenticated and genuinely clicked; the browser has no way to know the click was misdirected. Variants extend it: **cursorjacking** displaces the visible pointer, **likejacking** targets social widgets, and drag-based versions can move data out of a framed page.

The defence is a response header telling the browser who may frame you. `Content-Security-Policy: frame-ancestors 'none'` refuses all framing; `frame-ancestors 'self' https://partner.example.com` allows a specific embedder. This is the modern control and it supports multiple origins, unlike its predecessor.

`X-Frame-Options: DENY` or `SAMEORIGIN` is the legacy equivalent. Send it too for old browsers, but note it cannot express an allowlist — `ALLOW-FROM` was never widely supported — and `frame-ancestors` takes precedence where both are present.

The important part is coverage: the header must be on **every** response that renders UI, not just the login page. A single un-headered route with a destructive action is the whole vulnerability, and defaults in a framework or CDN often miss API-adjacent or legacy routes.

**JavaScript frame-busting is not a defence.** The classic `if (top !== self) top.location = self.location` is defeated by the iframe `sandbox` attribute, which blocks top-level navigation while still rendering your page. Treat any frame-busting script as legacy.

Two things reduce the impact even when framing is permitted for a legitimate partner. `SameSite=Strict` or `Lax` cookies mean a framed page may not be authenticated at all, since a cross-site framed request is not a top-level navigation. And requiring a deliberate confirmation step — typing a word, re-entering a password — for destructive actions makes a single stolen click insufficient.

## Why it matters

Any authenticated app with a one-click destructive or financial action is exposed, and the fix is one header — which makes its absence an easy and embarrassing audit finding.

Interviewers ask it as a quick check of whether you know security headers beyond CSP's script directives.

## Key points

- The attack misdirects a real click from a real user; the browser cannot distinguish it.
- `frame-ancestors` in CSP is the modern control and supports an allowlist of permitted embedders.
- Send `X-Frame-Options` as a legacy fallback, but `frame-ancestors` wins where both exist.
- The header must be on every UI-rendering response — one uncovered route is the vulnerability.
- JavaScript frame-busting is defeated by the iframe `sandbox` attribute and is not a defence.
- `SameSite` cookies and an explicit confirmation step reduce the impact of a stolen click.
