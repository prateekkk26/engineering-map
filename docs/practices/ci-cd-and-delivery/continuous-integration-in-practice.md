---
title: Continuous integration in practice
summary: CI is the practice of merging to trunk daily and keeping it green, not the server that runs your tests.
level: core
minutes: 22
order: 1
tags: [ci, delivery, process]

related:
  - practices/version-control/branching-strategies
  - practices/ci-cd-and-delivery/designing-a-pipeline
  - _shared/testing-strategy

resources:
  - title: Continuous Integration
    url: https://martinfowler.com/articles/continuousIntegration.html
    source: Martin Fowler
    type: article
    minutes: 40
    primary: true
  - title: Continuous Delivery
    url: https://continuousdelivery.com/
    source: Jez Humble
    type: docs
    minutes: 20
  - title: Understanding GitHub Actions
    url: https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions
    source: GitHub
    type: docs
    minutes: 20
---

## In one line

Continuous integration means every engineer merges working code into trunk at least daily and a broken trunk is fixed immediately — the build server is just how you find out.

## What it is

The original claim is about **integration frequency**, and it's easy to miss because "we have CI" now usually means "we have a YAML file". A team where everyone works on a branch for two weeks and a pipeline runs on each push is not doing continuous integration; it's doing automated testing on a feature-branch workflow. The distinction matters because the benefit comes from finding conflicts — semantic ones, not just textual — while they're an hour old.

Three practices make it real. **Everyone merges to trunk at least daily**, which forces work to be broken into shippable slices and pushes anything unfinished behind a flag. **The trunk is always green**, which means a broken build is the team's top priority — not "I'll fix it after lunch", because every minute it's red, everyone else is either blocked or building on sand. **The build is self-testing**: it doesn't just compile, it runs tests good enough that green genuinely means shippable.

**Continuous delivery** is the extension: every green commit on trunk is a release candidate that *could* go to production, with the decision to release being a business one rather than an engineering scramble. **Continuous deployment** removes even that gate — green means deployed. Getting the names right in an interview is worth the thirty seconds it takes.

What actually breaks CI in practice is trust. If the pipeline is slow, people batch changes; if it's flaky, people re-run until green and stop reading failures; if it's green but production still breaks, nobody believes it. Each of those is a bug in the pipeline, not in the team's discipline, and treating them as culture problems is why so many CI setups quietly decay.

The prerequisites are unglamorous: the whole thing has to be reproducible from a clean checkout with one command, the build must be runnable locally in a form close enough to CI that "works on my machine" is rare, and the environment has to be pinned — lockfiles, pinned tool versions, containerised runners.

## Why it matters

Hiring managers ask how your team ships, and answering with pipeline mechanics rather than integration frequency is a giveaway. The practical stakes are the ones in the DORA research: teams that integrate and deploy frequently have *lower* change failure rates, which is the counterintuitive result worth being able to state.

## Key points

- CI is a practice about merging to trunk daily; the CI server is a tool that supports it, not the practice itself.
- A red trunk is a stop-the-line event, because everyone downstream is building on unverified code.
- The build must be self-testing — green has to mean "safe to release" or the signal is worthless.
- Continuous delivery keeps every commit releasable; continuous deployment removes the manual gate.
- Slow or flaky pipelines cause batching and re-run-until-green, which destroys the signal.
- Reproducibility — one command from a clean checkout, pinned versions, lockfiles — is the precondition for all of it.
- Frequent small integrations lower change failure rate rather than raising it, which is the DORA finding worth citing.
