---
title: JWT & When Not to Use It
summary: What a signed token actually buys you, the revocation problem it creates, and the narrow cases where it's the right answer.
level: core
minutes: 25
order: 3
tags: [auth, jwt, tokens, security]

related:
  - backend/auth/sessions-and-cookies
  - backend/auth/api-keys-and-service-to-service-auth
  - backend/auth/oauth2-and-oidc-server-side

resources:
  - title: Stop using JWT for sessions
    url: http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/
    source: Sven Slootweg
    type: article
    minutes: 15
    primary: true
  - title: RFC 8725 — JSON Web Token Best Current Practices
    url: https://www.rfc-editor.org/rfc/rfc8725.html
    source: IETF
    type: docs
    minutes: 30
  - title: JSON Web Tokens
    url: https://jwt.io/introduction
    source: Auth0
    type: article
    minutes: 15
---

## In one line

A JWT is a signed, self-describing claim you can verify without a database lookup — and everything wrong with it follows from the fact that verification never consults anything you can change.

## What it is

Three base64url parts: a header naming the algorithm, a payload of claims, and a signature. Anyone with the key can verify the payload wasn't tampered with. **It is signed, not encrypted** — the payload is readable by anyone holding the token, so putting anything private in it is a leak by design.

The real benefit is statelessness: any service holding the public key can validate a request with no shared session store and no network hop. That genuinely matters for service-to-service calls, for a fleet of services that shouldn't all reach one session database, and as the format for short-lived OAuth access tokens issued by a provider you don't control.

The cost is **revocation**. A JWT is valid until it expires, full stop. Fire an employee, discover a stolen token, change a user's role — none of it takes effect until expiry. Every mitigation walks it back toward a session: keep the lifetime very short (5–15 minutes) and pair it with a long-lived refresh token, or maintain a denylist of revoked token IDs, which reintroduces the per-request lookup you adopted JWTs to avoid. The honest framing is that short expiry plus refresh gives you *bounded* staleness, not revocation.

Two implementation traps. **Algorithm confusion**: always pin the expected algorithm server-side, because a library that trusts the token's own `alg` header can be handed `alg: none` or tricked into verifying an RS256 token with HMAC using the public key as the secret. And **claim validation**: check `exp`, `iss` and `aud` explicitly — a valid signature only proves the token is genuine, not that it was issued for your service or is still current.

**The decision rule.** First-party web app with a browser and a login form: use a server-side session. Access tokens from an identity provider, or authenticating between services: JWTs, short-lived, with claims validated properly. Storing a JWT in `localStorage` so the frontend can read the user's name is the anti-pattern that combines the worst of both — no revocation, plus XSS exfiltration.

## Why it matters

JWT-versus-session is asked constantly, and it is a trade-off question dressed as a technology question. The strong answer names revocation as the axis and gives a case for each; the weak one repeats that JWTs "scale better", which is a claim about a session lookup most products can trivially afford.

## Key points

- A JWT is signed, not encrypted — never put anything confidential in the payload.
- Statelessness is the entire benefit: verification needs a key, not a database.
- You cannot revoke a JWT; short expiry plus refresh tokens bounds the damage instead of preventing it.
- A denylist restores revocation and simultaneously removes the reason you chose JWTs.
- Pin the verification algorithm server-side; trusting the token's `alg` header is a known bypass.
- Validate `exp`, `iss`, and `aud` — a good signature says the token is real, not that it's for you.
- Browser session with a login form → cookie session. Cross-service or IdP-issued → JWT.
