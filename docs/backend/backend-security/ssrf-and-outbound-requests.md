---
title: SSRF & Outbound Requests
summary: Why a URL supplied by a user is a request from inside your network, and the allowlist that is the only reliable defence.
level: core
minutes: 20
order: 2
tags: [security, ssrf, network]

related:
  - backend/api-design/webhooks-and-callbacks
  - backend/services-in-production/calling-other-services
  - ai/ai-security/agent-permissions-and-blast-radius

resources:
  - title: Server-side request forgery
    url: https://portswigger.net/web-security/ssrf
    source: PortSwigger
    type: article
    minutes: 30
  - title: SSRF Prevention Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
    source: OWASP
    type: article
    minutes: 25
    primary: true
  - title: IMDSv2
    url: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html
    source: AWS
    type: docs
    minutes: 15
---

## In one line

If a user can influence a URL your server fetches, they can make requests from inside your network — to internal services, to the cloud metadata endpoint, to anything a firewall assumed was unreachable.

## What it is

The features that create SSRF are ordinary and everywhere: fetch a URL for a link preview, import from a user-supplied endpoint, deliver a webhook to a customer's URL, let an agent browse a page, render an image from a remote source. Each takes a URL from an untrusted party and dials it with your service's network position — which is far more privileged than the internet's.

The high-value targets are internal. Cloud **instance metadata** at `169.254.169.254` historically returned IAM credentials to any request from the instance, which turned SSRF straight into cloud account compromise (IMDSv2's token requirement is the fix, and it must be enforced, not merely available). Then: internal admin panels, Kubernetes APIs, Redis and Elasticsearch with no authentication because "they're not exposed", and `localhost` services on the same host.

**Blocklists don't work**, and it's worth knowing why they fail so specifically: `127.0.0.1` has equivalents in decimal (`2130706433`), IPv6 (`[::1]`, `::ffff:127.0.0.1`), and DNS names that resolve to it; a redirect from a public URL can land on an internal one; and **DNS rebinding** defeats validate-then-fetch entirely by returning a public IP to your check and a private one to the actual connection.

So the defences are structural. **Allowlist destinations** where you can — for most integrations you know the exact hosts. Where you genuinely must fetch arbitrary URLs: resolve the hostname yourself, verify every resolved address is public, and **connect to that IP directly** (pinning it, which closes the rebinding window); disable redirects or re-validate each hop; permit only `http`/`https`, rejecting `file://`, `gopher://` and friends; set aggressive timeouts and response size limits; and strip authentication headers from the outbound request.

The strongest control is **network-level**: run URL-fetching work in an isolated egress path — a separate service, a proxy, or a subnet with no route to anything internal — so a bypass in the application code reaches nothing worth having.

## Why it matters

SSRF is the vulnerability that most reliably turns into a serious breach, because it converts "fetch this URL" into "read cloud credentials". It is also increasingly likely in AI products: a tool that browses the web, or an agent that follows a link in a document, is an SSRF surface with a language model deciding the target.

## Key points

- Any user-influenced URL is a request made with your service's network privileges.
- Cloud metadata endpoints are the classic escalation from SSRF to full credential compromise.
- Blocklists fail to alternate IP encodings, IPv6 forms, redirects and DNS rebinding.
- Allowlist hosts where the integration is known — most are.
- For arbitrary URLs, resolve first, validate the IP, then connect to that pinned IP.
- Restrict schemes to http/https, cap response size, set short timeouts, and re-validate every redirect.
- Isolate outbound-fetch workloads on a network path with no route to internal services.
- Agent browsing tools are an SSRF surface where the attacker's input reaches the model, not just your code.
