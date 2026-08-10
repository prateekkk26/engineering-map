---
title: Client-Side Data Exposure
summary: The data that ends up in the browser without anyone deciding to put it there — payloads, bundles, source maps and caches.
level: core
minutes: 20
order: 12
tags: [security, privacy, data]

related:
  - frontend/security/server-action-and-rsc-authorisation
  - frontend/nextjs/environment-config-and-secrets
  - frontend/browser-platform/browser-storage

resources:
  - title: Sensitive data exposure
    url: https://owasp.org/www-project-top-ten/
    source: OWASP
    type: docs
    minutes: 25
    primary: true
  - title: Source maps
    url: https://developer.chrome.com/docs/devtools/javascript/source-maps
    source: Chrome DevTools
    type: docs
    minutes: 20
  - title: taint
    url: https://react.dev/reference/rsc/server-components
    source: react.dev
    type: docs
    minutes: 25
---

## In one line

If it reached the browser, the user has it — and so does anyone who can read their screen, their disk, or their network tab.

## What it is

The recurring mistake is filtering in the UI rather than at the source. An API returns the full user object and the component renders three fields; the other thirty are in the network response, the React props, and the page source. The same happens with a list endpoint that returns internal flags, cost prices, moderation notes, or other users' email addresses — all invisible on screen and all trivially readable.

**Filter server-side.** The endpoint should return exactly what the screen needs. In an RSC codebase the equivalent rule is at the client boundary: whatever a server component passes to a client component is serialised into the payload.

**Bundles are readable.** Minification is not obfuscation. Anything in client code — API keys with a `NEXT_PUBLIC_` prefix, internal endpoint URLs, feature-flag names, admin-only route paths, comments — is public. Attackers routinely grep bundles for keys and for hints about internal APIs.

**Source maps** are the accelerant: uploaded publicly, they reconstruct your original source, comments included. Either restrict them to authenticated access or upload them directly to your error tracker rather than serving them from the origin.

**Caches** are the quiet one. A response containing personal data cached by a CDN and served to another user is a breach, not a bug — `Cache-Control: private, no-store` on authenticated responses, and care with `Vary`. Browser and service worker caches persist on shared machines too.

Then the places data leaks sideways: **URLs**, which land in history, referrer headers, server logs and analytics, so never put tokens or personal data in a query string; **error messages and stack traces**, which should be generic in production with the detail correlated by an id; and **third-party scripts**, which can read the DOM and often collect form fields by default — session recording tools need explicit masking of sensitive inputs.

A practical review habit: open the network tab and the page source on your most sensitive screen and read what is actually there. It is usually more than the design shows.

## Why it matters

Most real data exposure is not an exploit — it is over-fetching plus client-side filtering, and it turns up in penetration tests and bug bounty reports constantly.

It is also a GDPR issue rather than only a security one: shipping personal data the page does not need is processing you cannot justify.

## Key points

- Filter fields server-side; UI-level filtering leaves everything in the response and the props.
- Minified bundles are readable — keys, internal URLs, and route hints in client code are public.
- Source maps reconstruct your source; restrict them or upload them straight to the error tracker.
- Never cache authenticated responses in a shared cache; use `private, no-store` and check `Vary`.
- Keep tokens and personal data out of URLs — they leak via history, referrers, and logs.
- Return generic errors in production and correlate detail by id.
- Audit third-party scripts and mask sensitive fields in session recording.
