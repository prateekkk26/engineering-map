---
title: Frontend Observability
summary: Knowing what users actually experience — error tracking, real-user monitoring, logs and traces that cross into the backend.
level: core
minutes: 25
order: 12
tags: [architecture, observability, monitoring]

related:
  - frontend/performance/lab-vs-field-measurement
  - frontend/architecture/resilient-ui-error-handling
  - frontend/tooling/source-maps-and-production-debugging

resources:
  - title: Web Vitals
    url: https://web.dev/articles/vitals
    source: web.dev
    type: article
    minutes: 25
    primary: true
  - title: OpenTelemetry JS
    url: https://opentelemetry.io/docs/languages/js/
    source: OpenTelemetry
    type: docs
    minutes: 30
  - title: Sentry for JavaScript
    url: https://docs.sentry.io/platforms/javascript/
    source: Sentry
    type: docs
    minutes: 25
---

## In one line

The frontend runs on hardware you do not control, on networks you cannot see, so anything you do not deliberately measure is invisible.

## What it is

Four signals, each answering a different question.

**Errors.** Uncaught exceptions, unhandled rejections, error-boundary catches, and failed requests. Useful reports need release, route, user or session, browser and device, and a correlation id that ties to the server request. Without uploaded source maps the stack is minified noise. Group by fingerprint, alert on rate rather than on each event, and expect a long tail of browser-extension errors that need filtering or they drown the signal.

**Metrics.** Core Web Vitals from real users with the `web-vitals` library, reported at the 75th and 95th percentile and segmented by route, device class, and country. A single global number hides the segment that is failing.

**Logs.** Sparse and structured, because volume costs money and noise. Log decisions and transitions, not narration.

**Traces.** The highest-value and least-adopted. Propagate a trace id from the browser through your BFF and into the services, and "this page was slow" becomes an answerable question with a specific span. OpenTelemetry is the standard, and browser instrumentation has matured enough to be practical.

Two things are frontend-specific and easy to miss. **Send telemetry reliably** — `navigator.sendBeacon` or `fetch` with `keepalive`, because a normal request during page unload is cancelled and you lose exactly the sessions that ended badly. And **respect privacy**: no personal data in events, mask form fields in session recording, honour consent before non-essential telemetry, and remember that URLs frequently contain identifiers.

**Sampling** keeps it affordable: sample traces and performance heavily, keep errors unsampled or nearly so, and make sure your sampling is consistent per session rather than per event or a trace becomes fragments.

The thing that turns data into value is **correlation**. One session id linking an error, its trace, the vitals for that page load, and the user's actions turns a report into a reproducible story. Without it you have four dashboards nobody opens.

## Why it matters

Frontend failures are invisible by default — users do not file tickets, they leave — so observability is the only way to know the real experience.

It is also a senior differentiator: instrumenting a product is the difference between guessing and knowing, and interviewers ask "how would you know if this was slow for users?"

## Key points

- Errors, metrics, logs, and traces answer different questions; you need all four to different depths.
- Error reports are only actionable with release, route, session, device, and uploaded source maps.
- Report vitals at p75 and p95 segmented by route, device class, and geography — a global number hides failures.
- Trace propagation from browser to backend is the highest-value, least-adopted signal.
- Use `sendBeacon` or `keepalive` so telemetry survives page unload.
- Sample traces heavily and errors lightly, consistently per session.
- Correlate everything on one session id, or you have dashboards instead of answers.
