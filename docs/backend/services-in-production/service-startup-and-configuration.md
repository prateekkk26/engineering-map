---
title: Service Startup & Configuration
summary: Validating config at boot so a missing variable fails the deploy instead of the first request that needs it.
level: core
minutes: 20
order: 2
tags: [deployment, configuration, reliability]

related:
  - practices/ci-cd-and-delivery/environments-config-and-secrets
  - backend/backend-security/secrets-and-key-management
  - backend/observability/health-checks-and-readiness

resources:
  - title: The Twelve-Factor App — Config
    url: https://12factor.net/config
    source: Adam Wiggins
    type: article
    minutes: 10
    primary: true
  - title: Feature flags
    url: https://martinfowler.com/articles/feature-toggles.html
    source: Martin Fowler
    type: article
    minutes: 30
  - title: OpenTelemetry — resource semantic conventions
    url: https://opentelemetry.io/docs/specs/semconv/resource/
    source: OpenTelemetry
    type: docs
    minutes: 15
---

## In one line

Parse and validate the entire configuration into a typed object at startup, and refuse to start if anything is missing — because the alternative is discovering it at 3am from a `undefined is not a function`.

## What it is

Config comes from the environment, not from files in the image: same artefact promoted from staging to production, differing only in what's injected. The failure this prevents is a build that "works in staging" because staging is where it was compiled.

The practice worth adopting is a **config module that runs once at boot**: read every variable, coerce types (everything arrives as a string — `PORT`, `MAX_RETRIES`, `ENABLE_X` all need parsing), apply defaults, validate with a schema, and export a frozen typed object. Nothing else in the codebase reads `process.env`. Two payoffs: a missing or malformed variable **crashes the deploy immediately** with a message naming the variable, instead of failing on the first request that touches that code path days later; and the config becomes discoverable — one file lists everything the service needs.

Distinguish three things that get lumped together. **Config** is environment-specific and stable: URLs, pool sizes, timeouts. **Secrets** are config you must not log, and want fetched from a secret manager rather than baked into environment variables where every child process inherits them. **Feature flags** are runtime-changeable behaviour and belong in a flag service, not in env vars — flipping a flag shouldn't require a deploy, which is the entire point of having one.

**Startup order matters** more than people expect. Connect to dependencies, run whatever warm-up you need, *then* start listening — or, better, listen immediately but fail the readiness probe until warm, so the orchestrator doesn't route traffic to an instance that isn't ready. Decide explicitly which dependencies are fatal at boot: a missing database is worth refusing to start for; a missing optional analytics provider is not, and crashing on it turns a vendor outage into yours.

Two small things with outsized value: log the effective configuration at boot with secrets redacted, so an incident begins with certainty about what the process actually loaded; and stamp the build's version and commit SHA into config and into your logs and traces, so "which version is running" is never a question.

## Why it matters

Config errors are one of the most common causes of failed deploys and, worse, of deploys that succeed and then break a rarely-used path. Boot-time validation converts that entire class into a fast, obvious failure — and describing it is a compact way to show you think about operability, which is exactly what the deep-dive round probes.

## Key points

- One artefact, environment-injected config — a build that differs per environment isn't the thing you tested.
- Validate all config at boot into a typed frozen object; nothing else in the code reads `process.env`.
- Fail fast and loudly on missing config, naming the variable; late discovery is the expensive failure.
- Environment variables arrive as strings — coercion belongs in the schema, not scattered at call sites.
- Secrets are not config: fetch them from a manager, keep them out of logs and child-process environments.
- Feature flags live in a flag service, because their whole value is changing without a deploy.
- Decide which dependencies are fatal at startup; crashing on an optional vendor imports their outage.
- Log the redacted effective config plus version and commit SHA at boot.
