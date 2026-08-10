---
title: OAuth & OIDC in the Browser
summary: Authorization code with PKCE, why the implicit flow is dead, and what a frontend is actually responsible for.
level: deep
minutes: 25
order: 10
tags: [security, auth, oauth]

related:
  - frontend/security/auth-token-storage
  - frontend/nextjs/authentication-in-nextjs
  - frontend/security/injection-beyond-xss

resources:
  - title: OAuth 2.0 for Browser-Based Applications
    url: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps
    source: IETF
    type: docs
    minutes: 40
    primary: true
  - title: OpenID Connect
    url: https://openid.net/developers/how-connect-works/
    source: OpenID Foundation
    type: docs
    minutes: 25
  - title: PKCE
    url: https://oauth.net/2/pkce/
    source: oauth.net
    type: docs
    minutes: 15
---

## In one line

OAuth is delegated authorisation and OIDC is the identity layer on top of it, and for a browser app the only current answer is authorization code flow with PKCE — ideally with the tokens kept on your server.

## What it is

Separate the two first, because conflating them causes real bugs. **OAuth 2.0** issues an access token that lets your app call an API as the user. **OIDC** adds an ID token — a JWT asserting who the user is. An access token is not proof of identity; using one to decide "the user is logged in" is a confused-deputy vulnerability.

**The implicit flow is dead.** It returned tokens in the URL fragment, where they land in history, referrers, and logs. Current guidance is authorization code with PKCE for every public client.

**PKCE** closes the interception gap for clients that cannot hold a secret. Generate a random `code_verifier`, send its SHA-256 hash as the `code_challenge` on the authorization request, and present the original verifier when exchanging the code. An attacker who intercepts the code cannot exchange it without the verifier.

The frontend's actual responsibilities are narrow and each has a failure mode. Generate and store `state` and check it on return — that is the CSRF defence for the callback. Generate the PKCE pair with `crypto.getRandomValues`, not `Math.random`. **Validate the redirect target** against an allowlist, because a redirect parameter that is not validated is how tokens get sent to an attacker. And validate the ID token properly if you consume it: signature, `iss`, `aud`, `exp`, and `nonce`.

The stronger architecture, and the one to propose in a design discussion, is the **backend-for-frontend**: the token exchange happens server-side, tokens never reach the browser, and the browser holds an ordinary httpOnly session cookie. That removes the token-storage problem entirely and is what the current IETF guidance recommends for browser apps.

Two practical notes. Third-party cookie deprecation has broken silent renewal via hidden iframes, so refresh must go through your own origin. And in practice, use a library or provider — Auth.js, Clerk, WorkOS, Auth0 — rather than implementing the flow; the specification has many ways to be subtly wrong and no product value in getting it right yourself.

## Why it matters

Every product has social or enterprise sign-in, and the details — PKCE, `state`, redirect validation — are where implementations go wrong in ways that produce account takeover.

Knowing that implicit is deprecated and BFF is the current recommendation is a currency check interviewers use.

## Key points

- OAuth authorises API access; OIDC asserts identity. An access token is not an authentication statement.
- The implicit flow is deprecated — authorization code with PKCE is the only current browser flow.
- PKCE binds the code to the client via a hashed verifier, defeating code interception.
- `state` protects the callback against CSRF; generate it and the PKCE verifier with `crypto.getRandomValues`.
- Validate redirect targets against an allowlist — an open redirect here leaks tokens.
- Validate ID tokens fully: signature, issuer, audience, expiry, and nonce.
- The BFF pattern keeps tokens server-side behind an httpOnly cookie and is the current recommendation.
