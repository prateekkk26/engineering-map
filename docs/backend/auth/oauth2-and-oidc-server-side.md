---
title: OAuth 2 & OIDC, Server Side
summary: The authorization-code flow as the server actually implements it — redirects, PKCE, state, token exchange — and what OIDC adds on top.
level: core
minutes: 30
order: 4
tags: [auth, oauth, oidc, security]

related:
  - frontend/security/oauth-and-oidc-in-the-browser
  - backend/auth/jwt-and-when-not-to-use-it
  - backend/auth/api-keys-and-service-to-service-auth

resources:
  - title: OAuth 2.0 Security Best Current Practice
    url: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics
    source: IETF
    type: docs
    minutes: 45
  - title: OpenID Connect Core 1.0
    url: https://openid.net/specs/openid-connect-core-1_0.html
    source: OpenID Foundation
    type: docs
    minutes: 60
  - title: The OAuth 2.0 Authorization Framework
    url: https://www.rfc-editor.org/rfc/rfc6749
    source: IETF
    type: docs
    minutes: 60
    primary: true
---

## In one line

OAuth 2 is a delegated *authorization* protocol — it gets your service a token to call an API on a user's behalf — and OIDC is the thin identity layer bolted on top that actually answers "who is this person".

## What it is

The flow that matters is **authorization code with PKCE**, and it is worth being able to narrate end to end. Your server redirects the user to the provider with a `client_id`, `redirect_uri`, `scope`, a random `state`, and a `code_challenge`. The user authenticates there — your service never sees their password. The provider redirects back with a short-lived `code`. Your **server** exchanges that code, plus the client secret and the `code_verifier`, for an access token at the token endpoint, over a back channel the browser never sees.

Every parameter in that sentence is defending against something. **`state`** is a CSRF token for the redirect: without it, an attacker can complete the flow and get their account linked to your user's session. **PKCE** binds the code to the client that started the flow, so an intercepted code is useless — originally for mobile apps, now recommended for every client type including confidential server-side ones. **The exact `redirect_uri`** must be pre-registered and matched exactly; open redirects here hand codes to attackers. The **implicit flow is dead** — tokens in URL fragments leak through history, referrers and logs — and OAuth 2.1 removes it.

**OIDC** adds an `id_token`: a JWT of identity claims (`sub`, `email`, `iss`, `aud`, `nonce`) plus a discovery document and a JWKS endpoint for keys. The rule people break is using an *access token* as proof of identity. An access token is a bearer credential for an API; it says nothing verifiable about who the user is, and treating it as login is how "sign in with X" implementations get broken. Validate the `id_token`'s signature against the provider's JWKS, and check `iss`, `aud`, `exp` and `nonce`.

After a successful login, **issue your own session**. The provider's tokens are for calling the provider's APIs; your app's authentication should be a session cookie you control, so you can revoke it. Store refresh tokens encrypted, rotate them, and treat reuse of a rotated refresh token as a compromise signal.

## Why it matters

Every product does "sign in with Google" and every AI product ends up calling third-party APIs on a user's behalf, so this flow is standard senior surface area. Interviewers probe `state` and PKCE specifically, because knowing what each parameter defends against separates someone who has integrated OAuth from someone who has copied an example.

## Key points

- Authorization code with PKCE is the only flow to use; implicit and password grants are removed in OAuth 2.1.
- The code-for-token exchange happens server-to-server, so the browser never handles the client secret.
- `state` prevents CSRF on the callback; PKCE prevents a stolen code from being redeemed.
- `redirect_uri` must be exact-matched and pre-registered — loose matching is an account-takeover vector.
- OAuth answers "may this app act for the user"; only OIDC's `id_token` answers "who is the user".
- Never treat an access token as proof of identity; validate the `id_token` against the provider's JWKS.
- Convert a successful login into your own revocable session, and store or rotate refresh tokens as secrets.
