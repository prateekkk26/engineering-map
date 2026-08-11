---
title: TLS and certificates
summary: How two strangers agree on a shared secret over a hostile network, and what a certificate actually proves.
level: core
minutes: 25
order: 4
tags: [networking, security, fundamentals]

related:
  - cs-fundamentals/networking/tcp-udp-and-quic
  - frontend/security/the-browser-security-model
  - cs-fundamentals/networking/proxies-cdns-and-the-network-edge

resources:
  - title: How does SSL/TLS work?
    url: https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/
    source: Cloudflare
    type: article
    minutes: 20
    primary: true
  - title: Transport Layer Security
    url: https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security
    source: MDN
    type: docs
    minutes: 20
  - title: HTTP Strict Transport Security
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security
    source: MDN
    type: docs
    minutes: 15
  - title: SSL Server Test
    url: https://www.ssllabs.com/ssltest/
    source: Qualys SSL Labs
    type: docs
    minutes: 10
---

## In one line

TLS uses asymmetric cryptography once, to authenticate the server and agree on a symmetric key, and then encrypts the actual traffic with that much faster symmetric key.

## What it is

The handshake does three jobs: **authentication** (you are talking to who you think), **key agreement** (both sides derive the same secret without transmitting it), and **negotiation** (version and cipher suite). In TLS 1.3 this is one round trip; 1.2 needed two, and 1.0/1.1 are dead. Key exchange uses ephemeral Diffie–Hellman, which gives **forward secrecy**: a session key is derived fresh and never sent, so an attacker who later steals the server's private key still cannot decrypt recorded past traffic.

A **certificate** binds a public key to a hostname, signed by a Certificate Authority the client already trusts. Chain of trust: leaf → intermediate → root, with roots shipped in the OS or browser trust store. Validation checks the signature chain, the expiry, that the hostname matches a Subject Alternative Name, and revocation status. It proves control of the domain — nothing more. A valid certificate does not mean the site is legitimate or safe; phishing sites have valid certificates, which is why the browser padlock stopped being presented as a trust signal.

Practical details that come up. Let's Encrypt makes certificates free and automated, with 90-day lifetimes that force automated renewal — and expired certificates remain a routine, self-inflicted outage. **SNI** sends the requested hostname in the clear during the handshake, so many sites can share an IP, and that hostname leaks unless Encrypted Client Hello is used. **HSTS** tells browsers to use HTTPS only, for a duration, eliminating the plaintext first request that a downgrade attack targets; the preload list bakes this in before first contact. **Certificate pinning** was the old answer to a compromised CA, is dangerous to operate, and has been largely superseded by Certificate Transparency logs plus CAA records.

TLS terminates somewhere, and where matters. Terminating at a CDN or load balancer means traffic beyond that point is plaintext unless you re-encrypt — which is fine inside a trusted network and not fine across the public internet. Corporate middleboxes perform exactly this interception deliberately, with a private root installed on managed machines.

## Why it matters

Every "is HTTPS enough" and "why can't I just check the padlock" conversation runs on this, and the honest answer — it proves domain control and encrypts transit, and says nothing about the site's intent — is a genuine security-literacy signal. Operationally, expired certificates, missing intermediates, and mismatched hostnames are common outages, and knowing where TLS terminates is what makes a CDN and load balancer topology reviewable.

## Key points

- Asymmetric crypto authenticates and agrees a key; symmetric crypto encrypts the bulk traffic because it is far faster.
- TLS 1.3 completes in one round trip and removed the weak ciphers and options 1.2 still permitted.
- Ephemeral key exchange gives forward secrecy, so stealing the server key later does not decrypt recorded sessions.
- A certificate proves control of a hostname, not legitimacy — phishing sites hold valid certificates.
- Validation checks chain, expiry, hostname against Subject Alternative Names, and revocation; a missing intermediate breaks it for some clients.
- HSTS removes the plaintext first request and blocks downgrade attacks; preloading extends that to first-ever contact.
- SNI exposes the requested hostname in cleartext during the handshake unless Encrypted Client Hello is in use.
- TLS terminating at a CDN or load balancer means the hop beyond it is plaintext unless explicitly re-encrypted.
