---
title: Injection & Untrusted Input
summary: Every injection is the same bug — data crossing into a command — and the same fix, which is never building the command by concatenation.
level: core
minutes: 25
order: 1
tags: [security, injection, sql]

related:
  - backend/api-design/request-validation-and-parsing
  - frontend/security/injection-beyond-xss
  - ai/ai-security/prompt-injection

resources:
  - title: SQL injection
    url: https://portswigger.net/web-security/sql-injection
    source: PortSwigger
    type: article
    minutes: 30
    primary: true
  - title: Injection Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 20
  - title: A03:2021 — Injection
    url: https://owasp.org/Top10/A03_2021-Injection/
    source: OWASP
    type: article
    minutes: 15
---

## In one line

Injection happens when user data is interpolated into something that gets *interpreted* — SQL, a shell, a path, a template, a prompt — and the fix is always to keep data and instructions in separate channels.

## What it is

**SQL injection** is the archetype. `WHERE email = '${email}'` lets an input containing a quote change the query's structure. **Parameterised queries** fix it completely, not by escaping but by sending the SQL and the values over separate protocol paths, so the value can never be parsed as syntax. Every driver and ORM supports it; the residual risk is the places ORMs let you drop to raw SQL and the places that *can't* be parameterised — table and column names, and `ORDER BY` direction, which must come from an allowlist instead.

The same shape recurs everywhere. **Command injection**: `exec("convert " + filename)` gives a shell to anyone who sends `; rm -rf`. Use `execFile`/`spawn` with an argument array, which never involves a shell. **Path traversal**: joining user input into a filesystem path lets `../../etc/passwd` out of your directory — resolve the path and verify it's still under the intended root. **NoSQL injection**: a JSON body where a string was expected can smuggle an operator object like `{ "$ne": null }`, which is why schema validation must check types, not just presence. **SSTI** in server-side templates, **LDAP**, **XPath**, **header injection** via a newline in a user-supplied value — all the same bug.

**Prompt injection** is the newest member of the family and the one with no clean fix. An LLM has one channel for instructions and data, so text retrieved from a document or a web page can carry instructions the model follows. Unlike SQL, there is no parameterisation, so the mitigations are architectural: treat model output as untrusted, require confirmation for consequential tool calls, and constrain what tools can do — which is why authorization on the tool side matters more than filtering on the input side.

Two habits that limit the damage when something slips through. **Least privilege on the database**: an application role that can't `DROP` or read other schemas bounds what an injection achieves. And **defence in depth** — validation, parameterisation, least privilege, and monitoring — because each layer catches what the last one missed.

## Why it matters

Injection has been in the OWASP Top 10 since it existed, and it still ships regularly through the seams — raw SQL escapes from an ORM, a shell call for image processing, an unchecked path. Interviewers ask for the mechanism, not the name: "why does a parameterised query fix this when escaping doesn't?" is the question, and the answer is that data never enters the parser.

## Key points

- Every injection is data crossing into an interpreter; the fix is separate channels, not cleverer escaping.
- Parameterised queries send SQL and values separately, so input can't become syntax.
- Identifiers and sort directions can't be parameterised — allowlist them.
- Use `execFile`/`spawn` with an argument array; string-built shell commands are command injection waiting.
- Resolve and verify file paths against an intended root to stop traversal.
- NoSQL injection arrives as an unexpected object, so validation must assert types, not just presence.
- Prompt injection has no parameterisation — constrain the tools and treat model output as untrusted.
- Least-privilege database roles bound the blast radius of an injection you didn't catch.
