---
title: Graceful Shutdown & Draining
summary: What a process must do between SIGTERM and exit so a deploy doesn't drop requests, lose jobs, or corrupt half-finished work.
level: core
minutes: 20
order: 6
tags: [deployment, reliability, node]

related:
  - backend/observability/health-checks-and-readiness
  - system-design/reliability-and-operations/rollouts-and-safe-deploys
  - backend/async-work/queues-and-workers

resources:
  - title: Pod lifecycle — termination
    url: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination
    source: Kubernetes
    type: docs
    minutes: 20
    primary: true
  - title: Signal events
    url: https://nodejs.org/api/process.html#signal-events
    source: Node.js
    type: docs
    minutes: 10
  - title: Kubernetes best practices — terminating with grace
    url: https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-terminating-with-grace
    source: Google Cloud
    type: article
    minutes: 15
---

## In one line

`SIGTERM` is a request, not a kill, and the seconds it buys are for finishing in-flight work and telling the load balancer to stop sending more.

## What it is

Every deploy, scale-down and node replacement sends `SIGTERM` and then, after a grace period, `SIGKILL`. Without a handler, Node's default is to exit immediately — dropping every in-flight request as a connection reset the user sees as a failed save.

The correct sequence, in order, and the order is the whole point:

1. **Fail the readiness probe first.** Load balancers take seconds to notice an instance is going away, and requests routed during that window would be rejected by a server that already stopped listening. Failing readiness while still serving is what makes the handover seamless.
2. **Stop accepting new work** — `server.close()` (which finishes existing requests but accepts no new connections) and pause the queue consumer so it leases nothing further.
3. **Finish in-flight work**, with a deadline. Requests get to complete; the currently-leased job gets to finish or is explicitly released back to the queue so another worker takes it immediately rather than waiting out the visibility timeout.
4. **Flush** logs, metrics, and traces. Buffered telemetry is exactly what you want when investigating a bad deploy, and it's what's lost most often.
5. **Close** database pools and other connections, then exit 0.
6. **Force-exit on a timer** shorter than the platform's grace period — if draining hasn't finished in, say, 15 seconds against a 30-second grace, exit anyway. Otherwise `SIGKILL` arrives mid-write.

Two details people miss. The grace period is configured by the platform, not by you, so the handler's budget must be derived from it — and in Kubernetes, `terminationGracePeriodSeconds` must exceed your drain time or the sequence is pointless. And **long-lived connections need their own treatment**: WebSocket and SSE clients should be told to reconnect (a close frame or a final event) rather than dropped silently, so they back off instead of stampeding.

The prerequisite that makes all of this safe is that work is **idempotent and restartable**. Graceful shutdown reduces disruption; it never guarantees completion, because the process can also die without any signal at all.

## Why it matters

"What happens to in-flight requests during a deploy?" is a standard reliability question, and the readiness-first ordering is the part that distinguishes a real answer. It's also the difference between deploying during the day and only at night, which is a team-level outcome rather than a technical one.

## Key points

- `SIGTERM` starts a countdown to `SIGKILL`; without a handler you drop every in-flight request.
- Fail readiness before you stop listening, so the load balancer stops routing before the socket closes.
- `server.close()` finishes existing requests while refusing new connections — that's the draining primitive.
- Release the currently-leased job explicitly so it's redelivered immediately, not after a visibility timeout.
- Flush logs, metrics and traces before exit, or a bad deploy is invisible in exactly the window you need.
- Force-exit on a timer inside the platform's grace period, and make sure that period exceeds your drain time.
- Tell streaming clients to reconnect rather than dropping them, and jitter their backoff.
- Graceful shutdown is a mitigation, not a guarantee — the work still has to be idempotent and restartable.
