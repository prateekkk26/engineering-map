---
title: Third-Party Scripts & Tag Managers
summary: Every external script runs with your origin's full privileges, and a tag manager hands that power to whoever can log in.
level: core
minutes: 20
order: 13
tags: [security, third-party, performance]

related:
  - frontend/security/content-security-policy
  - frontend/security/dependency-supply-chain
  - frontend/performance/loading-strategy

resources:
  - title: Subresource Integrity
    url: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
    source: MDN
    type: docs
    minutes: 20
    primary: true
  - title: Third-party JavaScript performance
    url: https://web.dev/articles/third-party-javascript
    source: web.dev
    type: article
    minutes: 25
  - title: OWASP attacks index
    url: https://owasp.org/www-community/attacks/
    source: OWASP
    type: docs
    minutes: 20
---

## In one line

A `<script src>` from another origin runs with all the privileges of your own code — it can read the DOM, any cookie your JavaScript can see, and every keystroke in your forms.

## What it is

There is no sandbox for a classic script tag. Analytics, chat widgets, A/B testing, ad tech and support tools all execute as first-party code on your origin. That is the mechanism behind **web skimming** — Magecart-style attacks where a compromised third-party script quietly reads payment fields — and it is why a vendor's breach becomes your breach.

**Tag managers multiply the problem.** They exist so non-engineers can inject arbitrary JavaScript into production without a deploy or a code review. That is the feature. It also means the security boundary of your site is now the tag manager's login, and container access is usually broader and less audited than repository access.

Controls, in rough order of effectiveness:

**CSP** with an explicit `script-src` allowlist limits which origins can load at all, and `connect-src` limits where data can be sent — often the more valuable half, since it constrains exfiltration even after a script is compromised.

**Subresource Integrity** pins a hash so a modified file fails to execute. It works only for versioned, immutable URLs; a vendor's auto-updating endpoint cannot be pinned, and that inability is itself a signal about the vendor.

**Isolation** is the strongest structural answer: run the third party in a sandboxed iframe or a web worker (Partytown does the latter) so it never touches your DOM. More work, and not every vendor tolerates it.

**Inventory and governance** are the unglamorous parts that actually reduce risk: know every tag, who owns it, what it is for, and delete the ones nobody can justify. Most sites carry several scripts nobody remembers adding.

The performance dimension runs alongside. Third-party code frequently outweighs the application, blocks the main thread, and degrades INP — and it is the one part of your performance budget you do not control. Load non-critical tags after interaction, and treat any vendor insisting on a synchronous head script as a red flag on both counts.

## Why it matters

Payment-page skimming has been one of the most damaging real-world web attack classes of the last decade, and every one of those incidents ran through a legitimately included third-party script.

It is also a common interview scenario — "marketing wants to add a tag, what do you do?" — where the good answer covers CSP, SRI, review, and the performance budget.

## Key points

- A third-party script has full first-party privileges — DOM, script-readable cookies, and form input.
- Tag managers move the security boundary to a login that is usually less controlled than your repository.
- `script-src` limits what loads; `connect-src` limits exfiltration and is often the more useful restriction.
- SRI pins a hash but only works on immutable URLs — an unpinnable auto-updating script is a risk signal.
- Sandboxed iframes or a worker isolate third parties from the DOM.
- Maintain an inventory with named owners and delete unjustified tags.
- Third-party code is an uncontrolled slice of your performance budget; defer it and refuse synchronous head scripts.
