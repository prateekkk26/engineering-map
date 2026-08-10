---
title: Rendering Model Output Safely
summary: Treating generated text as untrusted input — markdown, HTML, links, and code blocks that a model was talked into producing.
level: core
minutes: 25
order: 4
tags: [ai, security, xss]

related:
  - frontend/security/xss-and-output-encoding
  - frontend/security/content-security-policy
  - frontend/ai-interfaces/tool-calls-and-agent-state-in-the-ui

resources:
  - title: DOMPurify
    url: https://github.com/cure53/DOMPurify
    source: cure53
    type: repo
    primary: true
  - title: Cross-site scripting (XSS)
    url: https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS
    source: MDN
    type: docs
    minutes: 25
  - title: Content Security Policy
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
    source: MDN
    type: docs
    minutes: 30
---

## In one line

Model output is untrusted input — it can be steered by whatever went into the context, including a web page the model read — so it must be sanitised on exactly the same terms as user-generated content.

## What it is

The threat is indirect. A user is unlikely to talk a model into emitting an XSS payload against themselves, but a model that summarises a web page, a PDF, an email, or a retrieved document is processing content an attacker may control. **Prompt injection turns that content into instructions**, and one thing an attacker can ask for is markup.

So the rules are the ordinary output-encoding rules, applied without exception:

**Render markdown, do not render HTML.** Use a renderer with raw HTML disabled — in `react-markdown` that is the default, and enabling `rehype-raw` is the mistake. If HTML genuinely must render, sanitise with DOMPurify first, on an allowlist.

**Never `dangerouslySetInnerHTML` with model output.** This is the single line that turns a summarisation feature into stored XSS.

**Treat links as hostile.** Model-generated `href`s can be `javascript:` URLs, or plausible-looking phishing destinations. Allowlist the scheme (`https:` and `mailto:` in most products), add `rel="noopener noreferrer"`, and consider showing the destination rather than only the anchor text — the text and the target need not agree.

**Images are exfiltration.** A markdown image pointing at an attacker's server sends a request the moment it renders, and the URL can carry data from the conversation. Either block remote images from model output, or proxy them.

**Code blocks are display, not execution.** Syntax-highlight them; never `eval`. If the product runs generated code, that belongs in a sandboxed iframe or a server-side sandbox with no ambient credentials, not in the page.

Then the layer that catches what you missed: a **Content Security Policy** without `unsafe-inline`, which turns a successful injection into a blocked console error. Also set `sandbox` on any iframe rendering generated content, and be careful with tables and long unbroken strings, which are a layout-breaking nuisance rather than a security hole.

## Why it matters

Every AI product renders model output, and most of them render markdown from content the model read somewhere else — which is a stored-XSS surface with an unusual entry point. It is a genuinely new class of frontend vulnerability and interviewers at these companies ask about it.

The answer that lands is not "sanitise the output" — it is naming *why* the output is untrusted.

## Key points

- Model output is attacker-influenceable whenever the model reads external content; treat it exactly like user-generated content.
- Render markdown with raw HTML disabled; if HTML is required, sanitise with DOMPurify on an allowlist.
- Never pass model output to `dangerouslySetInnerHTML`.
- Allowlist link schemes, add `rel="noopener noreferrer"`, and surface the real destination.
- Remote images in generated markdown are an exfiltration channel — block or proxy them.
- Code blocks display only; execution belongs in a sandbox with no credentials.
- A CSP without `unsafe-inline` is the backstop that turns a missed case into a blocked error.
