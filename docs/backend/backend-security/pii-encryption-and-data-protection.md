---
title: PII, Encryption & Data Protection
summary: Knowing which fields are personal data, what encryption actually protects against, and the GDPR obligations that land on the backend.
level: core
minutes: 25
order: 4
tags: [security, privacy, gdpr, encryption]

related:
  - frontend/security/privacy-consent-and-gdpr
  - data/schema-design-and-migrations/soft-deletes-and-audit-history
  - backend/observability/structured-logging
  - ai/ai-security/data-privacy-and-pii

resources:
  - title: GDPR — full text
    url: https://gdpr-info.eu/
    source: GDPR-info
    type: docs
    minutes: 60
  - title: Cryptographic Storage Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 25
    primary: true
  - title: Article 25 — Data protection by design and by default
    url: https://gdpr-info.eu/art-25-gdpr/
    source: GDPR-info
    type: docs
    minutes: 10
---

## In one line

Encryption at rest protects against a stolen disk and almost nothing else, so protecting personal data is mostly about knowing where it is, minimising it, and being able to delete it.

## What it is

Start with **what counts**. Under GDPR, personal data is anything relating to an identifiable person — not just name and email but IP addresses, device IDs, user IDs in logs, and free-text fields where users paste whatever they like. Special categories (health, biometrics, political views) carry stricter rules. For an AI product this matters acutely: prompts and conversation transcripts routinely contain personal data, and they get sent to a third-party provider, which is a processing relationship needing a legal basis and a data processing agreement.

**Encryption, honestly.** *At rest* (disk or database-level) defends against physical theft and a stolen storage snapshot; it does nothing against an application-layer compromise, because your service decrypts transparently. *In transit* (TLS everywhere, including between internal services) is table stakes. **Application-level encryption** of specific fields is the one that meaningfully limits a database breach, since the ciphertext is useless without a key the database doesn't hold — at the cost that you can no longer search or index those columns without a scheme like blind indexing. Encrypt the fields that warrant it, not the whole schema.

Often better than encrypting is **not holding the data**: don't store what you don't need, truncate what you can, hash identifiers used only for matching, and tokenise payment data so the sensitive value lives with a provider whose job that is. Data you don't have cannot leak, cannot be subpoenaed, and doesn't need deleting.

**The rights that become engineering work.** Access and portability need an export path across every store. **Erasure** is the hard one: deleting a user means their rows, their backups' eventual expiry, their entries in analytics and logs, and their data in third-party processors — which is why soft deletes and log retention are a compliance question, not just a design preference. **Retention** must be defined per data type and actually enforced by a job. And **breach notification** within 72 hours means you need to know what was accessed, which is an audit-logging requirement decided long before the incident.

## Why it matters

The target companies are US and EU, so GDPR is not optional and its requirements land on backend design — schema, logs, retention, deletion. In interviews it appears as "how would you handle a delete-my-account request?", which is a compact test of whether you've thought about every place data ends up.

## Key points

- Personal data includes IPs, device IDs and free-text fields, not just the obvious identity columns.
- Prompts and transcripts are personal data, and sending them to a model provider is a processing relationship.
- Encryption at rest stops disk theft; it does not stop an application compromise.
- Field-level application encryption is the control that survives a database breach, and it costs you indexing.
- Not collecting, truncating, hashing or tokenising beats protecting data you didn't need.
- Erasure must reach backups, analytics, logs and processors — soft deletes make this harder, not easier.
- Retention needs a per-type policy enforced by a job, not a note in a document.
- 72-hour breach notification presupposes audit logs good enough to say what was accessed.
