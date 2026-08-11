---
title: Environments, config & secrets
summary: Configuration belongs in the environment, secrets belong in a secret manager, and the same artifact should run in all of them.
level: core
minutes: 20
order: 3
tags: [delivery, security, configuration]

related:
  - practices/ci-cd-and-delivery/designing-a-pipeline
  - practices/ci-cd-and-delivery/deploying-safely-in-practice
  - frontend/security/client-side-data-exposure

resources:
  - title: The Twelve-Factor App — Config
    url: https://12factor.net/config
    source: Adam Wiggins
    type: docs
    minutes: 8
    primary: true
  - title: The Twelve-Factor App — Dev/prod parity
    url: https://12factor.net/dev-prod-parity
    source: Adam Wiggins
    type: docs
    minutes: 6
  - title: OWASP Secrets Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
    source: OWASP
    type: docs
    minutes: 25
---

## In one line

Anything that varies between environments is config and comes from the environment at runtime; anything that would be damaging if leaked is a secret and never touches the repository.

## What it is

The twelve-factor rule is a good test: **could you open-source the repository right now without leaking anything?** If not, credentials are in the code. Config — database URLs, feature endpoints, API keys, log levels — is injected as environment variables or fetched from a config service at boot. Not `config/production.ts` checked into git, which doesn't scale past a handful of environments and inevitably ends up holding a secret.

**Environments** typically run local → preview (per-PR ephemeral) → staging → production, though plenty of good teams collapse the middle. What matters is *parity*: the closer staging is to production in dependencies, data shape and topology, the more a green staging run means. Perfect parity is unaffordable, so name the deltas explicitly — smaller data, mocked third parties, one instance instead of twelve — because those deltas are exactly where staging-passes-production-fails bugs live. Per-PR preview environments have largely displaced a shared staging box for frontend work, since they remove the queue for the one environment everyone needs.

**Secrets** live in a manager — cloud KMS/Secrets Manager, Vault, or the platform's own store — with access scoped per service and per environment, and rotation possible without a code change. Practical rules: separate credentials per environment so a staging leak can't touch production data; short-lived credentials over static ones (OIDC federation from CI to your cloud beats a long-lived access key in a repo secret); scan for committed secrets in pre-commit and in CI; and treat any leaked secret as compromised and rotate it, because git history is forever and rewriting it doesn't help once it's been cloned.

The frontend-specific trap deserves its own sentence: **anything bundled into client JavaScript is public**, `NEXT_PUBLIC_`-prefixed or not. A key that must stay secret has to sit behind a server route or an edge function. This is one of the most common real-world leaks and a very common interview probe.

## Why it matters

Config and secret handling shows up in practical rounds ("how would you deploy this?") and in security-flavoured questions. It also produces some of the most expensive real incidents — a production key committed to a public repo is a rotation scramble at best and a breach at worst.

## Key points

- Config comes from the environment at runtime; the artifact is identical across environments.
- The test for secrets in code: could this repository be made public right now?
- Name the deltas between staging and production explicitly — they predict the bugs staging will miss.
- Per-PR preview environments remove contention for a single shared staging box.
- Use distinct credentials per environment so a staging compromise can't reach production.
- Prefer short-lived federated credentials (OIDC from CI) over long-lived static keys.
- Anything shipped in client JavaScript is public regardless of naming — secrets must live server-side.
- A leaked secret is compromised the moment it's pushed; rotate rather than rewriting history.
