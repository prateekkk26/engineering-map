---
title: Health Checks & Readiness
summary: Three different questions an orchestrator asks — am I alive, can I take traffic, have I started — and why conflating them causes outages.
level: core
minutes: 20
order: 4
tags: [observability, reliability, deployment]

related:
  - backend/services-in-production/graceful-shutdown-and-draining
  - backend/services-in-production/service-startup-and-configuration
  - system-design/reliability-and-operations/failure-modes-and-blast-radius

resources:
  - title: Implementing health checks
    url: https://aws.amazon.com/builders-library/implementing-health-checks/
    source: AWS Builders' Library
    type: article
    minutes: 25
    primary: true
  - title: Configure liveness, readiness and startup probes
    url: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
    source: Kubernetes
    type: docs
    minutes: 25
  - title: Health checks and graceful degradation
    url: https://sre.google/sre-book/load-balancing-datacenter/
    source: Google SRE Book
    type: book
    minutes: 30
---

## In one line

Liveness asks whether to restart you, readiness asks whether to send you traffic, and answering both with the same endpoint is how a dependency blip becomes a full outage.

## What it is

**Liveness** should be nearly trivial: is the process responsive? If it fails, the platform kills and restarts the container. The danger is including dependencies here — if liveness checks the database, a brief database outage restarts every instance simultaneously, which turns a recoverable degradation into an outage plus a cold-start storm. Restarting fixes deadlocks and wedged processes; it has never fixed a database.

**Readiness** is where dependencies belong, carefully. Failing readiness removes an instance from the load balancer without killing it, which is right when it can't serve — draining during shutdown, warming up, or a pool that's exhausted. But dependency checks here have a failure mode too: if the shared database goes down, *every* instance fails readiness, the load balancer has nothing to route to, and requests that could have been served from cache now fail. Hence AWS's advice to distinguish local health (this instance is broken) from shared-dependency health (everyone is broken), and to make the load balancer **fail open** when all targets are unhealthy.

**Startup** probes exist so slow-booting services aren't killed by liveness before they finish initialising — a common misconfiguration.

Design the endpoints accordingly. `/healthz` returns 200 if the event loop is turning. `/readyz` checks what *this instance* needs — config loaded, pool connected, not shutting down — with a short timeout and a cached result so probes can't become a load source themselves. A separate, deeper `/health/dependencies` for humans and dashboards can check everything and report per-dependency status without any probe acting on it.

Two details that bite. Probe timeouts must be shorter than the probe interval, or checks pile up. And **health checks must not require authentication** but also must not leak internals — a probe endpoint returning versions, connection strings or dependency hostnames is reconnaissance.

The deeper point is that a binary healthy/unhealthy is a poor model of a real service. Most degradation is partial — one endpoint slow, one dependency down — and that's what metrics and SLOs describe. Probes are for the orchestrator's two decisions, not for describing how the service feels.

## Why it matters

Misconfigured probes cause self-inflicted outages of a particularly frustrating kind: the platform doing exactly what it was told, at the worst moment. "What's the difference between liveness and readiness?" is a standard question, and the follow-up — "what happens if your readiness check hits the database and the database is down?" — is the one that separates answers.

## Key points

- Liveness decides restarts, readiness decides traffic; conflating them makes restarts a response to dependency failures.
- Never check external dependencies in liveness — a database blip should not restart your fleet.
- Readiness may check dependencies, but correlated failure across all instances leaves the balancer nothing to route to.
- Prefer failing open at the load balancer when every target is unhealthy.
- Startup probes stop slow boots from being killed before they finish.
- Cache probe results and set timeouts under the probe interval, so health checking isn't itself load.
- Probe endpoints stay unauthenticated but must not disclose versions, hosts or connection details.
- Health is not binary; probes serve the orchestrator, while SLOs and metrics describe real user impact.
