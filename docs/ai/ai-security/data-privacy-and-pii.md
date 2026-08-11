---
title: Data Privacy & PII
summary: Sending user data to a model provider is a processing decision with legal weight — and prompts, traces, and memory files are all places it quietly accumulates.
level: core
minutes: 20
order: 5
tags: [security, privacy, gdpr, compliance]

related:
  - frontend/security/privacy-consent-and-gdpr
  - ai/observability-and-cost/tracing-llm-applications
  - ai/agents/agent-memory-and-state

resources:
  - title: OWASP Top 10 for LLM Applications
    url: https://owasp.org/www-project-top-10-for-large-language-model-applications/
    source: OWASP
    type: docs
    minutes: 30
    primary: true
  - title: GDPR
    url: https://gdpr-info.eu/
    source: EU
    type: docs
    minutes: 40
  - title: EDPB Opinion 28/2024 on AI models and data protection
    url: https://www.edpb.europa.eu/our-work-tools/our-documents/opinion-board-art-64/opinion-282024-certain-data-protection-aspects_en
    source: European Data Protection Board
    type: docs
    minutes: 40 # unverified
---

## In one line

Every prompt containing user data is a transfer to a third-party processor, and the same data then lands in your traces, your caches, and your agent's memory unless you decide otherwise.

## What it is

For US and EU companies — the target market for these roles — the obligations are concrete. Under GDPR the model provider is a **processor** and you are the controller, which means a data processing agreement, a lawful basis, documented international transfers, and a record of processing. Providers publish enterprise terms covering zero or limited retention and no training on your data; the default consumer tiers frequently do not, and that difference is a compliance question rather than a preference.

Then the parts engineers actually control.

**What goes in the prompt.** Minimise before sending: redact or tokenise identifiers you do not need — names, emails, card numbers, health details — and send an id you can rejoin locally. Much of the time the model needs the shape of the record, not the person in it.

**Where it accumulates afterwards.** This is the underestimated part. Full prompts and completions in your traces, response caches keyed on user content, semantic caches that can serve one tenant's answer to another, agent memory files replayed into future sessions, and eval sets built from production logs — every one is a copy of user data with its own retention and access story. Trace retention in particular tends to be set once and forgotten.

**Deletion.** A deletion request must reach all of it: your database, the vector index, cached responses, memory stores, traces, and eval fixtures. An embedding is derived personal data — it can be partially inverted — so deleting the source row and leaving the vector is not deletion. Design the deletion path when you design the pipeline; retrofitting it across five stores is genuinely hard.

**Residency and tenancy.** EU customers may require EU processing, which constrains provider and region choice. And multi-tenant systems need retrieval filtered by tenant and caches partitioned by tenant — a cross-tenant retrieval hit is a breach, not a bug.

**Transparency.** Users are entitled to know their data goes to an AI provider. Say so in the privacy notice, and give an opt-out where the lawful basis requires it.

## Why it matters

For EU-facing companies this is a shipping blocker, not a nicety, and the EAA-and-GDPR-aware version of these questions comes up precisely because the target companies are US/EU remote-first. Naming the accumulation points — traces, caches, memory, eval sets — is the detail that shows you have thought past the API call, which is where most teams stop.

## Key points

- The provider is a processor under GDPR: you need a DPA, a lawful basis, and documented transfers.
- Enterprise terms with zero or limited retention and no-training guarantees are not the consumer default — verify the tier.
- Minimise before sending: redact or tokenise identifiers the model does not need, and rejoin locally.
- User data accumulates in traces, response and semantic caches, agent memory, and eval sets — each needs its own retention policy.
- Embeddings are derived personal data and can be partially inverted; deleting the source row is not deletion.
- Build the deletion path across every store when you build the pipeline; retrofitting it is far harder.
- Filter retrieval by tenant and partition caches by tenant — a cross-tenant hit is a breach.
- Data residency requirements constrain provider and region choice for EU customers.
- Disclose AI processing in the privacy notice and provide an opt-out where the lawful basis requires one.
- Never put secrets in the context: they propagate into logs, traces, caches, and compaction summaries.
