---
title: Credentials, MFA & Account Recovery
summary: Password hashing that's still correct in 2026, the second factors worth offering, and why recovery is the weakest link in every auth system.
level: core
minutes: 25
order: 7
tags: [auth, security, passwords]

related:
  - backend/auth/sessions-and-cookies
  - backend/api-design/rate-limits-and-quotas
  - backend/backend-security/pii-encryption-and-data-protection

resources:
  - title: Password Storage Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 20
    primary: true
  - title: NIST SP 800-63B — Digital Identity Guidelines
    url: https://pages.nist.gov/800-63-3/sp800-63b.html
    source: NIST
    type: docs
    minutes: 60
  - title: Passkeys
    url: https://web.dev/articles/passkey-registration
    source: web.dev
    type: article
    minutes: 20
---

## In one line

Hash passwords with a memory-hard algorithm, offer a phishing-resistant second factor, and remember that an attacker will attack the reset flow rather than the login form.

## What it is

**Hashing.** Use Argon2id, or bcrypt if the ecosystem forces it, or scrypt — all three are deliberately slow and memory-hard, which is what makes GPU cracking expensive. Never a general-purpose hash: SHA-256 is fast, and fast is the failure. The salt is per-user and handled by the algorithm; a pepper (a secret key stored outside the database) is a cheap extra layer. Tune the cost parameters to your hardware, record the parameters alongside each hash so you can upgrade them, and rehash on next successful login when you raise the cost.

**Policy**, per current NIST guidance, is the opposite of the old folklore: require length (8 minimum, encourage far more), allow every character including spaces and emoji, **don't** impose composition rules, and **don't** expire passwords on a schedule — forced rotation produces `Summer2026!` and nothing else. Do check candidates against a breached-password list, because credential stuffing with real leaked pairs is the actual attack.

**MFA**, in ascending order of strength. SMS is better than nothing and vulnerable to SIM swapping. TOTP is a good default: a shared secret, six digits, and a rate limit so the code can't be brute-forced. **Passkeys/WebAuthn** are the meaningful upgrade — the credential is bound to the origin, so it is phishing-resistant in a way no code-entry factor can be, and for a new product they are worth offering as a primary factor rather than a bolt-on.

**Recovery is where auth systems actually break.** A reset token must be random, single-use, short-lived (15–60 minutes), stored hashed, and invalidated when used or when a new one is issued. The response to "forgot password" must be identical whether or not the account exists, or the endpoint becomes a user-enumeration oracle — and the same applies to login errors and signup. On a successful reset, invalidate every existing session, and notify the user by email that it happened. Recovery codes for MFA need the same care as passwords, because that is the path around your strongest factor.

Everything above assumes the login, reset and MFA endpoints are rate-limited per account *and* per IP; without that, none of the rest matters.

## Why it matters

Most teams delegate this to an identity provider, and that's usually right — but the interview question is whether you know what you're delegating. "How do you store passwords?" is a screening question, and the follow-ups (enumeration, reset token lifetime, session invalidation) separate a real answer from a memorised one.

## Key points

- Argon2id, bcrypt or scrypt only — a fast hash is a cracking accelerator, salt or no salt.
- Store the cost parameters with each hash so you can raise them and rehash on next login.
- Length beats composition rules, and scheduled expiry makes passwords worse, not better.
- Screen against known-breached passwords; credential stuffing uses real pairs, not guesses.
- Passkeys are phishing-resistant because the credential is bound to the origin; TOTP and SMS are not.
- Reset tokens: random, hashed at rest, single-use, short-lived, and invalidated on issue of a new one.
- Identical responses for existing and non-existing accounts, or the reset endpoint enumerates your users.
- A successful password reset must kill every active session and notify the account owner.
