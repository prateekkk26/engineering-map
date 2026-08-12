---
title: Secrets & Key Management
summary: Where credentials live, how they get to the process, and what you do in the hour after one leaks.
level: core
minutes: 20
order: 3
tags: [security, secrets, operations]

related:
  - backend/auth/api-keys-and-service-to-service-auth
  - backend/services-in-production/service-startup-and-configuration
  - frontend/security/dependency-supply-chain

resources:
  - title: Secrets Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 25
  - title: AWS KMS concepts
    url: https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html
    source: AWS
    type: docs
    minutes: 25
    primary: true
  - title: About secret scanning
    url: https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning
    source: GitHub
    type: docs
    minutes: 15
---

## In one line

Treat every secret as something that will eventually leak, and optimise for short lifetimes and fast rotation rather than for perfect containment.

## What it is

The hierarchy, worst to best. **In the repository** — still the most common breach vector, and note that deleting a committed secret doesn't help: it's in the history, and it must be rotated, not removed. **In environment variables**, the 12-factor default: acceptable, with real caveats — every child process inherits them, crash dumps and error reporters capture them, and a stack trace from an HTTP client can print the whole environment. **In a secret manager** (Vault, AWS Secrets Manager, cloud KMS-backed stores), fetched at boot or on demand, with access audited and rotation automated. **No secret at all**, using workload identity: the platform issues a short-lived credential to the running service, and there is nothing to leak — the direction everything is moving.

**Rotation** only works if the system supports two valid credentials at once. Otherwise rotation means downtime, so it doesn't happen, so a leaked key stays live for years. Design for overlap from the start: two active keys, migrate consumers, retire the old one, and track last-used so you know when it's safe.

**Encryption keys** deserve their own handling. Use a KMS rather than a key in config, and prefer **envelope encryption**: the KMS holds a master key that encrypts per-record data keys, so rotating the master doesn't mean re-encrypting your database. Keep keys separate per environment — a staging key that can decrypt production data makes staging a production system with weaker access control.

**Detection**, because prevention fails. Turn on secret scanning and push protection in the repository, run a pre-commit hook, and scan build logs and error payloads — CI logs are a routine leak path.

Then the part interviewers actually probe: **the response**. Revoke first, then rotate, then investigate — in that order, because every minute of hesitation is a minute the credential works. Then audit what it accessed while valid, and only afterwards work out how it got out. A team that rotates first and does forensics second recovers; one that investigates first is still deciding while data leaves.

## Why it matters

Leaked credentials are among the most common causes of real breaches, and AI products hold especially valuable ones — a provider key with no spending cap is a direct financial loss, not just a data risk. "A key just leaked, what do you do?" is a question about priorities and preparation, and the answer reveals whether rotation is a designed capability or a fire drill.

## Key points

- A secret committed to git is compromised permanently — rotate it, because history is forever.
- Environment variables are acceptable but leak through child processes, crash dumps and error reporters.
- Secret managers add audit trails and automated rotation; workload identity removes the secret entirely.
- Rotation requires supporting two valid credentials simultaneously, or it never happens.
- Use envelope encryption so rotating a master key doesn't mean re-encrypting every row.
- Never share keys across environments; a staging key with production access makes staging production.
- Enable secret scanning and push protection, and scan CI logs, which leak routinely.
- On a leak: revoke, rotate, then investigate — in that order.
