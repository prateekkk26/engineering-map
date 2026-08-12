---
title: Transports & Authorisation
summary: Local servers over stdio need no auth and get filesystem access; remote servers over HTTP need OAuth, and that difference is the whole security story.
level: deep
minutes: 20
order: 4
tags: [mcp, security, auth, architecture]

related:
  - ai/mcp/building-an-mcp-server
  - ai/ai-security/agent-permissions-and-blast-radius
  - frontend/security/oauth-and-oidc-in-the-browser

resources:
  - title: MCP — Transports
    url: https://modelcontextprotocol.io/docs/concepts/transports
    source: Model Context Protocol
    type: docs
    minutes: 20
    primary: true
  - title: MCP — Authorization specification
    url: https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization
    source: Model Context Protocol
    type: docs
    minutes: 25 # unverified
  - title: Remote MCP Servers
    url: https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/
    source: Cloudflare
    type: article
    minutes: 20 # unverified
---

## In one line

Two transports: stdio for a local subprocess, where trust comes from the fact that you launched it, and streamable HTTP for a remote server, where trust has to come from OAuth.

## What it is

**stdio** runs the server as a child process of the host, exchanging JSON-RPC over standard input and output. There is no network, no port, no authentication — the server inherits the permissions of the process that spawned it. That is a feature for local capability (a filesystem server, a local database, a git repo) and a serious hazard: installing a local MCP server is running arbitrary code with your user's privileges, and the server can read anything you can. Configuration usually means a command and arguments in a config file, which is exactly as auditable as a package install, meaning: barely.

**Streamable HTTP** is the remote transport. A single endpoint handles POSTed JSON-RPC, with responses either returned directly or streamed back as server-sent events for long operations. It supersedes the older HTTP+SSE two-endpoint design, which you will still meet in older servers. Remote servers are multi-tenant, network-reachable, and therefore need real authorisation.

The spec's answer is **OAuth 2.1**, with the pieces that matter for a non-browser client: PKCE, dynamic client registration so a client can onboard without a human pre-registering it, and authorisation-server metadata discovery. The MCP server acts as a resource server; identity lives with a real authorisation server. The practical consequence for a server author is that you do not invent a token scheme, and the practical consequence for a host is that connecting a remote server is a consent flow the user completes, not an API key pasted into a config file.

The security properties worth holding on to. **Tokens must be audience-bound** — a server must reject a token issued for a different resource, or it becomes a confused deputy that replays your credential elsewhere. **Sessions need real session ids** and must not carry authorisation in the session alone. **Every request is authorised on the server**, per user and per tool, because the model asking is not permission. And **the tool descriptions themselves are untrusted input** to the client: a malicious server can put instructions in a description, which is prompt injection delivered through the integration layer rather than through the data.

Operationally, remote servers are ordinary web services — deploy, scale, rate-limit, log, and expect to be called by clients you cannot identify or trust.

## Why it matters

Remote MCP is where the protocol meets real security review, and it is a natural interview follow-up: "you've exposed this to any agent that can authenticate — what stops it doing something bad?" Knowing the local/remote split, and that the spec resolves it with OAuth 2.1 rather than API keys, is a currency signal. It is also a genuine risk in daily work, since installing a local MCP server is a supply-chain decision most people make casually.

## Key points

- stdio runs the server as a subprocess with your privileges — no auth, no network, and no isolation from your files.
- Installing a local MCP server is running third-party code as yourself; treat it as a supply-chain decision, not a config change.
- Streamable HTTP is the remote transport, replacing the older two-endpoint HTTP+SSE design, with SSE used for streaming responses.
- Remote servers authorise with OAuth 2.1 — PKCE, dynamic client registration, and metadata discovery — not with shared API keys.
- Tokens must be audience-bound; accepting a token minted for another resource makes your server a confused deputy.
- Authorise every request server-side, per user and per tool. The model requesting a call is not authorisation.
- Tool descriptions from a server are untrusted text reaching your model — a hostile server can inject instructions through them.
- A remote server is a production web service: rate limits, timeouts, logging, and multi-tenancy isolation all apply.
- Prefer a vetted remote server over a locally installed one when both exist; the blast radius is dramatically smaller.
