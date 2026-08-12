---
title: Security Fundamentals
summary: The handful of ideas — trust boundaries, least privilege, defence in depth — that every specific vulnerability is an instance of.
level: core
minutes: 25
tags: [security, threat-modelling, architecture]

surfaced_in:
  - frontend/security
  - backend/backend-security
  - ai/ai-security

related:
  - frontend/security/the-browser-security-model
  - backend/backend-security/injection-and-untrusted-input
  - ai/ai-security/prompt-injection
  - backend/auth/authentication-vs-authorization

resources:
  - title: OWASP Top 10
    url: https://owasp.org/Top10/
    source: OWASP
    type: docs
    minutes: 40
    primary: true
  - title: Threat Modeling
    url: https://owasp.org/www-community/Threat_Modeling
    source: OWASP
    type: article
    minutes: 15
  - title: OWASP Cheat Sheet Series
    url: https://cheatsheetseries.owasp.org/
    source: OWASP
    type: docs
    minutes: 15
---

## In one line

Almost every vulnerability is data crossing a trust boundary without being checked, or a component holding more power than it needed — and the fundamentals are the small set of habits that catch both.

## What it is

Start with the **trust boundary**: the line where data or control passes from something you control to something you don't. A browser form, an API request, a webhook, a file upload, a third-party script, a model's output. Security work is mostly finding those lines and deciding what is true on each side. The first principle is that **you cannot trust anything that crosses one** — not the client-side validation you wrote, not the hidden field, not the `Origin` header, not the JSON your own frontend sent. Anything the client can see, the client can change.

The second principle is **least privilege**: every component gets the narrowest permission that lets it do its job, for the shortest time. The database user the API runs as should not be able to drop tables. The token in the browser should be scoped to one user's data. The agent with tool access should not have a tool that can email arbitrary addresses. Least privilege doesn't stop a compromise; it decides how bad one is, which is why it is the principle that pays off when everything else fails.

The third is **defence in depth**: assume each control will eventually fail, and make sure another one is behind it. Output encoding stops XSS; a Content Security Policy is what saves you when a single encoding is missed. Parameterised queries stop injection; a read-only database role limits what a missed one can do. The senior instinct is not "is this control sufficient?" but "what happens when it fails?"

Two more things belong in the fundamentals. **Fail closed** — when authorization can't be determined, deny; when a check errors, don't fall through to the permissive branch. And **don't invent crypto or auth**: use the vetted library, the standard protocol, the platform primitive. Almost every homemade token scheme, password hash, or signature check has a flaw that a published one doesn't.

Threat modelling is how these get applied deliberately rather than by reflex. It is four questions, asked over a diagram: what are we building, what can go wrong, what are we going to do about it, did we do a good job? Even ten minutes of it, out loud, catches the class of problem that no amount of careful line-by-line coding will — the missing authorization check on the endpoint nobody remembered was public.

## Why it matters

Security questions in these loops are rarely "what is XSS" — they're "you're building this feature, what would worry you?", and that is a threat-modelling question. Reasoning from boundaries and privilege lets you answer for a technology you've never used, including the AI-shaped surfaces where the specific attacks are new but the shape is the same one: untrusted input, over-privileged executor.

## Key points

- Find the trust boundaries first; almost every vulnerability class is unvalidated data crossing one.
- Anything the client controls is attacker-controlled, including headers, hidden fields, and your own frontend's requests.
- Least privilege doesn't prevent compromise, it bounds the blast radius — which is why it's worth the friction.
- Defence in depth assumes each control fails; the question is always what's behind it.
- Fail closed: an error in an authorization check must deny, never fall through.
- Use vetted implementations of auth and crypto; bespoke versions fail in ways you won't find by testing.
- Validate on the server even when the client already did — client validation is UX, not a control.
- Threat modelling is four questions over a diagram, and ten minutes of it beats a checklist.
