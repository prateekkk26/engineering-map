---
title: Dependency & Supply Chain Security
summary: The npm attack surface — typosquats, compromised maintainers, malicious install scripts — and the controls that actually help.
level: core
minutes: 20
order: 14
tags: [security, supply-chain, tooling]

related:
  - frontend/security/third-party-scripts-and-tag-managers
  - frontend/tooling/package-management
  - frontend/tooling/ci-cd-for-frontend

resources:
  - title: Auditing package dependencies for security vulnerabilities
    url: https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities
    source: npm
    type: docs
    minutes: 20
    primary: true
  - title: SLSA
    url: https://slsa.dev/
    source: OpenSSF
    type: docs
    minutes: 30
  - title: npm ci
    url: https://docs.npmjs.com/cli/v10/commands/npm-ci
    source: npm
    type: docs
    minutes: 10
---

## In one line

`npm install` executes code from hundreds of strangers, and the attacks that matter target the maintainers and the install step rather than the code you read.

## What it is

The dependency tree is the surface. A modest application pulls in a thousand-plus transitive packages, each with maintainers you have never evaluated, any of whom can publish a new version at any time.

The recurring attack patterns are worth recognising:

**Compromised maintainer accounts** — a phished or credential-stuffed npm account publishes a malicious patch release to a package millions depend on. This has happened repeatedly to top-100 packages.

**Typosquatting and slopsquatting** — a package named one character away from a real one, or named after a plausible-but-nonexistent library that an AI assistant hallucinated into a recommendation.

**Install scripts** — `postinstall` runs arbitrary code on developer machines and CI runners, with access to environment variables, cloud credentials, and the source tree. This is the most common exfiltration path, and it fires before anyone reviews a line of code.

**Dependency confusion** — publishing a public package with the same name as your private internal one, so a misconfigured registry resolves to the attacker's.

Controls, in the order they pay off. **Commit the lockfile and use `npm ci`** so builds are reproducible and a compromised patch release cannot silently enter. **Disable install scripts by default** — `--ignore-scripts`, or pnpm's default of blocking them — and allowlist the few that genuinely need them. **Pin and review**: treat adding a dependency as a code review, looking at maintenance, maintainer count, and whether it needs to exist at all. **Delay upgrades** — a cooldown of a few days on new releases catches most compromises, which are typically detected fast.

Then the tooling: `npm audit` and Dependabot for known CVEs, and behaviour-based scanners like Socket for what audit cannot see — a package that suddenly starts making network calls or reading the filesystem. Scoped registries and namespace reservation close dependency confusion.

The most reliable control remains **fewer dependencies**. A left-pad-sized package is not worth a supply chain entry.

## Why it matters

Real, widely-used packages have been compromised repeatedly, and the blast radius is every developer machine and CI runner that installed the bad version — often including cloud credentials.

It also appears in enterprise procurement: SBOM and provenance questions are now standard, and being able to answer them is a practical skill.

## Key points

- Install scripts execute before any review, with access to credentials and the source tree — disable them by default.
- Commit lockfiles and use `npm ci`; a floating range is an open door for a malicious patch release.
- Typosquats and hallucinated package names are a live risk — verify a package is the one you meant.
- Dependency confusion is fixed by scoped names and correct registry configuration.
- `npm audit` finds known CVEs; behaviour-based scanners catch a package that starts doing something new.
- Delay adopting brand-new releases by a few days — most compromises are caught quickly.
- The strongest control is having fewer dependencies at all.
