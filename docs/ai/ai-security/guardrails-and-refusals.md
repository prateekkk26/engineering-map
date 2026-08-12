---
title: Guardrails & Refusals
summary: Filters around the model that block what it should not accept or emit — useful as defence in depth, damaging when they are your only control or tuned too tight.
level: deep
minutes: 15
order: 6
tags: [security, quality, product, safety]

related:
  - ai/ai-security/prompt-injection
  - ai/ai-security/handling-model-output-safely
  - ai/observability-and-cost/monitoring-quality-in-production

resources:
  - title: OWASP Top 10 for LLM Applications
    url: https://owasp.org/www-project-top-10-for-large-language-model-applications/
    source: OWASP
    type: docs
    minutes: 30
    primary: true
  - title: Reduce hallucinations
    url: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
    source: Anthropic
    type: docs
    minutes: 15
  - title: NeMo Guardrails
    url: https://github.com/NVIDIA/NeMo-Guardrails
    source: NVIDIA
    type: repo
    minutes: 25
---

## In one line

Guardrails are checks on the way in and the way out — topic scoping, PII detection, content classification, schema validation — and they belong alongside architectural controls, never instead of them.

## What it is

**Input guardrails** run before the model: is this in scope for the product, does it contain PII that should be redacted, does it look like an injection or jailbreak attempt, is this user over their limit. **Output guardrails** run after: does it conform to the schema, does it leak PII or a secret, does it contain a forbidden claim, are the citations real, is it on-topic.

Implementations range from cheap to expensive. Deterministic checks — regex for card numbers, schema validation, blocklists, citation verification — are fast, predictable, and should carry as much of the load as possible. Classifier models are more capable and add latency and cost. An LLM judge as a gate is the most flexible and slowest, and is itself subject to injection.

Three design points decide whether guardrails help or hurt.

**They are probabilistic.** A guardrail that catches most attempts is a speed bump, not a boundary. It is defence in depth on top of scoped credentials, server-side authorisation, and sandboxing — never a substitute. A system whose only protection is an input classifier is one novel phrasing away from failure.

**Over-refusal is a real product failure.** A tight filter that blocks legitimate requests is often more damaging than the rare bad output it prevents — a medical product that refuses to discuss symptoms, or a security tool that refuses to discuss vulnerabilities, is broken for its actual users. False-positive rate deserves the same measurement as false-negative rate, and refusal rate belongs in your production monitoring, because a model update can shift it with no change from you.

**Refusal is a UX surface.** A blocked request should say what happened, why, and what the user can do instead. A generic "I can't help with that" produces support tickets and mistrust. Where the block is a scope decision rather than a safety one, route to the thing that can help.

Finally, models have their own safety behaviour, and it can change under you. A provider update may make the model more cautious, which shows up as rising refusals rather than as errors — one more reason to pin versions and monitor the rate.

## Why it matters

"How do you stop it saying something harmful?" is asked of every consumer-facing AI product, and the complete answer includes both layers plus the over-refusal trade. Being able to name over-refusal as a failure mode is what distinguishes a product-minded engineer from one who treats safety as maximising blocks — and in domains like health, security, and finance it is the difference between a usable product and an unusable one.

## Key points

- Guardrails run on input (scope, PII, injection, limits) and output (schema, leakage, forbidden content, citation validity).
- Prefer deterministic checks where possible; classifiers and LLM judges add capability at real latency and cost.
- Guardrails are probabilistic and belong on top of scoped credentials, server-side authorisation, and sandboxing — never instead.
- An LLM used as a gate is itself injectable, so it is not a trust boundary.
- Over-refusal is a genuine product failure, and in specialised domains it is often the larger risk.
- Measure false positives as rigorously as false negatives, and monitor refusal rate in production.
- Provider model updates can shift refusal behaviour with no change on your side — pin versions and watch the rate.
- Refusal messages should explain what happened and offer a path forward, not emit a generic decline.
- Route out-of-scope requests to something useful rather than treating scope as a safety block.
- Include jailbreak and injection attempts in the eval suite so guardrail effectiveness is measured, not assumed.
