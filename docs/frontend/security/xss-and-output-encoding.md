---
title: XSS & Output Encoding
summary: The three kinds of cross-site scripting, why context decides the escaping, and what a framework does and does not protect.
level: core
minutes: 25
order: 2
tags: [security, xss, browser]

related:
  - frontend/security/content-security-policy
  - frontend/ai-interfaces/rendering-model-output-safely
  - frontend/security/the-browser-security-model

resources:
  - title: Cross-site scripting (XSS)
    url: https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS
    source: MDN
    type: docs
    minutes: 25
    primary: true
  - title: XSS Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
    source: OWASP
    type: docs
    minutes: 35
  - title: Trusted Types
    url: https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
    source: MDN
    type: docs
    minutes: 25
---

## In one line

XSS is attacker-controlled data being interpreted as code, and the fix is always the same shape: encode for the context the data lands in, or don't put it there at all.

## What it is

Three variants by delivery. **Stored** XSS is persisted — a comment, a profile field, a filename — and fires for everyone who views it, which makes it the most damaging. **Reflected** XSS comes from the request and bounces back in the response, delivered by a crafted link. **DOM-based** XSS never involves the server: client-side code takes something from the URL, `postMessage`, or storage and feeds it to a sink.

**Context decides the encoding**, and this is the part that gets missed. HTML body content needs entity encoding. An attribute value needs entity encoding *and* quoting, or `onerror=` can be appended. A URL context must reject `javascript:` regardless of encoding. Inside a `<script>` block you need JavaScript string escaping, and inside CSS you need CSS escaping. One general-purpose "escape" function applied everywhere leaves holes.

React escapes interpolated values in JSX, which removes most of the classic surface — and then hands you the exits. `dangerouslySetInnerHTML` is the obvious one. Less obvious: an `href` built from user input can be a `javascript:` URL, a spread of user-controlled props can inject event handlers, and `ref` plus direct DOM manipulation is outside React's protection entirely. Server-side template injection and `eval`-adjacent APIs sit outside it too.

The sinks worth knowing by name: `innerHTML`, `outerHTML`, `document.write`, `eval`, `new Function`, `setTimeout` with a string, `element.setAttribute` on event handlers, and `location`/`href` assignment. The sources: `location.*`, `document.referrer`, `postMessage` data, `localStorage`, and anything from an API.

Modern defences are layered. **Trusted Types** makes dangerous sinks reject plain strings at the platform level, turning DOM XSS into a build- and runtime-visible error — the strongest available fix. **CSP** without `unsafe-inline` blocks injected scripts from executing. **Sanitisation** with DOMPurify handles the case where HTML genuinely must be rendered. And `HttpOnly` cookies limit the damage by keeping session tokens out of script's reach.

## Why it matters

XSS remains the most common serious frontend vulnerability, and any script on your origin can read the DOM, exfiltrate data, and act as the user — including calling your API with their session.

It is also the security question most likely to be asked in a frontend interview, usually as "how does React protect you, and where doesn't it?"

## Key points

- Stored, reflected, and DOM-based differ by delivery, not by fix; DOM-based never touches the server.
- Encoding is context-specific — HTML body, attribute, URL, script, and CSS each need different treatment.
- React escapes JSX interpolation but not `dangerouslySetInnerHTML`, `href` values, spread props, or direct DOM access.
- Learn the sink list and the source list; DOM XSS is a flow from one to the other.
- Trusted Types blocks dangerous sinks at the platform level and is the strongest structural defence.
- CSP without `unsafe-inline` stops injected script from running; DOMPurify handles must-render HTML.
- `HttpOnly` cookies keep the session out of reach when XSS happens anyway.
