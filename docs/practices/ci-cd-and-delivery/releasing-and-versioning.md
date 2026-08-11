---
title: Releasing & versioning
summary: Semantic versioning is a promise to consumers about breakage, and a changelog is the interface through which that promise is read.
level: core
minutes: 18
order: 4
tags: [delivery, versioning, packages]

related:
  - frontend/tooling/publishing-a-frontend-package
  - frontend/architecture/versioning-shared-ui
  - practices/ci-cd-and-delivery/deploying-safely-in-practice

resources:
  - title: Semantic Versioning 2.0.0
    url: https://semver.org/
    source: semver.org
    type: docs
    minutes: 12
    primary: true
  - title: Keep a Changelog
    url: https://keepachangelog.com/en/1.1.0/
    source: Olivier Lacan
    type: docs
    minutes: 10
  - title: Changesets
    url: https://github.com/changesets/changesets
    source: Changesets
    type: repo
    minutes: 15
---

## In one line

`MAJOR.MINOR.PATCH` encodes one thing — whether upgrading can break you — and every argument about releases is really an argument about who absorbs that break.

## What it is

**Semver**: patch for backwards-compatible fixes, minor for backwards-compatible additions, major for anything that breaks a consumer. The hard part isn't the rules, it's deciding what counts as a breaking change — and the honest answer is anything an existing consumer relies on, including a stricter type signature, a changed default, or a rendered DOM structure someone was styling. What you consider public API needs stating explicitly, or every change is potentially breaking.

Semver only applies where something is **consumed** — a library, an SDK, an API. A continuously deployed web app has no version its users care about; there, the meaningful identifier is the commit SHA and the release notes.

**Automation** is worth setting up once. Conventional commits plus semantic-release derives the version and changelog from commit messages. Changesets — the common choice in JavaScript monorepos — has authors declare the impact of each change in a small file at PR time, which is better because a human decides what's breaking rather than a prefix. Either way, the goal is that releasing is a merge, not a ritual someone remembers on Fridays.

**Changelogs are written for humans deciding whether to upgrade**, which is why a dump of commit subjects is nearly useless. Group by Added / Changed / Fixed / Removed, lead with breaking changes, and give a migration path for each one — the codemod, the replacement API, the deprecation timeline. For a deprecation: ship the replacement first, warn at runtime with a link, keep both for a stated period, then remove in a major.

For an application rather than a package, the same discipline shows up as **release notes and a deploy log**: what shipped, when, and behind which flags. During an incident, the first question is always "what changed?", and a searchable record of deploys answers it in seconds instead of minutes.

## Why it matters

Any role that owns a shared component library or an SDK gets asked how they version and deprecate, and "we bump major when it feels big" is a bad answer. The failure mode is concrete: an unannounced breaking change in a minor release breaks every consumer's build simultaneously and burns the trust that makes internal libraries viable.

## Key points

- Major/minor/patch communicates exactly one thing: whether upgrading can break a consumer.
- Define your public API explicitly, or you cannot say what "breaking" means.
- Semver applies to consumed artifacts; a continuously deployed app is identified by commit and release notes.
- Automate versioning from commits or changesets so releasing is a merge, not a manual ritual.
- Changelogs are for upgrade decisions — group by change type, lead with breaking changes, include migrations.
- Deprecate in stages: ship the replacement, warn with a link, keep both, then remove in a major.
- Keep a deploy log for applications; "what changed?" is the first question of every incident.
