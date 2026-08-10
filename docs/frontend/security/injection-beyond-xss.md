---
title: Injection Beyond XSS
summary: Open redirects, prototype pollution, template and CSV injection, and the other places untrusted input becomes behaviour.
level: deep
minutes: 20
order: 4
tags: [security, injection]

related:
  - frontend/security/xss-and-output-encoding
  - frontend/javascript/prototypes-and-classes
  - frontend/security/dependency-supply-chain

resources:
  - title: Prototype pollution
    url: https://portswigger.net/web-security/prototype-pollution
    source: PortSwigger
    type: docs
    minutes: 30
    primary: true
  - title: Unvalidated Redirects and Forwards Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
    source: OWASP
    type: docs
    minutes: 20
  - title: Object.freeze()
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
    source: MDN
    type: docs
    minutes: 10
---

## In one line

XSS is the famous one, but the same failure — untrusted input reaching an interpreter — shows up in redirects, object merges, spreadsheet exports, and URL parsing.

## What it is

**Open redirect.** A `?next=` or `?returnTo=` parameter used verbatim in a redirect lets an attacker send users from your trusted domain to theirs — the basis of a convincing phishing link and, worse, a way to leak OAuth tokens when the redirect happens after auth. Never redirect to a raw parameter. Allowlist paths, or validate that the target is same-origin by parsing it against your origin rather than string-matching a prefix, which `https://yoursite.com.evil.com` defeats.

**Prototype pollution** is the JavaScript-specific one. A recursive merge or a `set(obj, path, value)` helper that accepts `__proto__`, `constructor`, or `prototype` as a key writes onto `Object.prototype`, and every object in the runtime inherits the property. That turns into privilege escalation when some code later checks `if (user.isAdmin)` on an object that never had the field. Guard the three magic keys, use `Object.create(null)` or a `Map` for dictionaries built from input, and prefer `structuredClone` over hand-rolled deep merges.

**CSV injection** catches teams that would never miss XSS. A cell beginning `=`, `+`, `-`, or `@` is treated as a formula by Excel and Sheets, and a formula can exfiltrate data or trigger a command prompt. Prefix such cells with an apostrophe or quote them on export.

**Template injection** applies to any client-side templating that evaluates expressions on input. If users can supply the template rather than the data, they can usually reach the runtime.

**URL parsing mismatches** are a quiet source of bypasses: your validator, the browser, and your backend can disagree about what `https://a@b/c` means. Use the platform's `URL` parser rather than a regex, and compare the parsed origin.

Then the general rule that covers all of them: **validate on a schema at the boundary and allowlist**. Blocklists fail because attackers have more encodings than you have patterns.

## Why it matters

These are the vulnerabilities that survive a codebase where everyone knows about XSS. Prototype pollution in particular is JavaScript-specific and appears in real advisories against popular utility libraries every year.

Open redirect is also the most common finding in bug bounty reports against frontends, and it is trivially preventable.

## Key points

- Never redirect to a raw parameter — allowlist targets, and validate same-origin by parsing rather than prefix-matching.
- Recursive merges must reject `__proto__`, `constructor`, and `prototype`, or a single request can pollute every object.
- Use `Object.create(null)` or `Map` for input-derived dictionaries, and prefer `structuredClone` to hand-rolled merges.
- Escape leading `=`, `+`, `-`, and `@` in exported CSV cells or spreadsheets will execute them.
- Never let users supply templates, only the data that fills them.
- Parse URLs with the `URL` API and compare parsed origins; regex validation disagrees with the browser.
- Validate against a schema at the boundary and allowlist — blocklists lose to encoding tricks.
