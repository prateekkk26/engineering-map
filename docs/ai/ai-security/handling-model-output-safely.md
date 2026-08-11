---
title: Handling Model Output Safely
summary: Model output is untrusted input to everything downstream — render it, execute it, or query with it as carelessly as you would a string from a stranger and you have the same bugs.
level: core
minutes: 20
order: 3
tags: [security, llm, xss, frontend]

related:
  - frontend/ai-interfaces/rendering-model-output-safely
  - frontend/security/xss-and-output-encoding
  - ai/ai-security/prompt-injection

resources:
  - title: OWASP Top 10 for LLM Applications
    url: https://owasp.org/www-project-top-10-for-large-language-model-applications/
    source: OWASP
    type: docs
    minutes: 30
    primary: true
  - title: Cross Site Scripting Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
    source: OWASP
    type: docs
    minutes: 25
  - title: DOMPurify
    url: https://github.com/cure53/DOMPurify
    source: cure53
    type: repo
    minutes: 15
---

## In one line

Treat everything the model produces as attacker-controlled — because with indirect injection it may literally be — and apply the same sanitisation, escaping, and validation you would to user input.

## What it is

The mental slip is treating model output as coming from your own system. It does not: it is a function of a context that may contain a fetched web page, a customer's document, or a hostile email. Insecure output handling is a standard entry in the OWASP LLM list for exactly this reason.

The concrete channels:

**Rendering.** Chat products render markdown, and markdown permits raw HTML. Rendering model output through an HTML-permitting pipeline without sanitisation is XSS with extra steps — and the payload can be planted by a third party, not the user. Sanitise with a real sanitiser, disable raw HTML in the markdown renderer, and restrict URL schemes so `javascript:` and `data:` links cannot appear. Note that remote images are also an exfiltration channel, not only an XSS one.

**Code execution.** Generated code is untrusted code. Running it means a sandbox with no credentials, restricted network, resource limits, and a timeout — the same posture you would use for a user-submitted script, because that is effectively what it is.

**Queries and commands.** Generated SQL goes through the same parameterisation and a read-only, least-privilege connection. Generated shell commands need an allowlist, not a blocklist. Generated file paths need canonicalisation and a containment check against a fixed root, or you have path traversal.

**Downstream API calls.** Validate against a schema, then validate semantically: does this id belong to this tenant, is this amount within range, is this recipient permitted. A structured-output guarantee gives you shape, never authority.

**Authorisation, which is the one people get wrong.** A model deciding a user may do something is not an authorisation decision. Permission checks run in code, against the authenticated user, before the action — regardless of what the model concluded.

Two more. **Data leakage**: the model may echo back parts of its context, so anything secret in the prompt can appear in the output, which is an argument for keeping secrets out of the context entirely. And **rendering scope**: if model output is stored and later shown to another user, an injection becomes persistent and cross-user.

## Why it matters

This is where AI security meets ordinary web security, and it is directly in scope for frontend and full-stack roles — an AI-company take-home that renders markdown from a model is a live XSS question. It also connects the two halves of the threat model: injection is only interesting because of what the output is allowed to do, and this topic is that second half.

## Key points

- Model output is untrusted input; with indirect injection its content may be chosen by an attacker.
- Rendering markdown that permits raw HTML is XSS — sanitise, disable raw HTML, and restrict URL schemes.
- Remote images in rendered output are both an XSS surface and an exfiltration channel.
- Generated code runs in a sandbox with no credentials, restricted network, resource limits, and timeouts.
- Parameterise generated SQL and run it on a least-privilege, read-only connection.
- Allowlist generated shell commands; canonicalise and containment-check generated file paths.
- Validate tool arguments semantically as well as structurally — schema conformance is not tenancy or range checking.
- Authorisation happens in code against the authenticated user; a model's conclusion is never a permission grant.
- Keep secrets out of the context, since the model can echo its own context back.
- Stored model output shown to other users turns a one-off injection into a persistent cross-user attack.
