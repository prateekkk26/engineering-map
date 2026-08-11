---
title: Local environments & onboarding
summary: Time from clone to first merged PR is the single most diagnostic number about a codebase's health, and it's almost always fixable.
level: core
minutes: 18
order: 4
tags: [devex, onboarding, tooling]

related:
  - practices/team-workflow/measuring-delivery-and-devex
  - practices/technical-communication/documentation-that-survives
  - frontend/tooling/developer-experience

resources:
  - title: The Twelve-Factor App — Dev/prod parity
    url: https://12factor.net/dev-prod-parity
    source: Adam Wiggins
    type: docs
    minutes: 6
    primary: true
  - title: Development environments
    url: https://containers.dev/
    source: Dev Containers
    type: docs
    minutes: 20
  - title: Software Engineering at Google — Build Systems
    url: https://abseil.io/resources/swe-book/html/ch18.html
    source: Google
    type: book
---

## In one line

`git clone && make dev` should produce a running application, and every step someone has to figure out instead is a tax paid by everyone who joins after them.

## What it is

The target is a **one-command setup** that is idempotent, works from a clean machine, and produces a running app with seeded data. Getting there means: dependencies and tool versions pinned (a version manager file, a lockfile, or a container); infrastructure — database, cache, queue — running via Docker Compose or a dev container rather than installed by hand; a script that seeds realistic data; and a `.env.example` documenting every variable, with secrets fetched from a manager rather than pasted in Slack.

Realistic **seed data** is the underrated item. An empty database means every developer builds their own fixtures, bugs that only appear with real data shapes never surface locally, and demoing anything requires ten minutes of clicking. A seed script with a few hundred plausible rows pays for itself in a week.

**Dev/prod parity** is the constraint behind most "works locally, fails in production" bugs — different database version, SQLite locally and Postgres in production, a mocked third party. Where you can't have parity, know the deltas and test them elsewhere. Cloud or containerised dev environments (dev containers, Codespaces, ephemeral per-PR environments) fix parity and setup at once, at the cost of latency and money.

Beyond setup, the loops that determine how a day feels: hot reload latency, typecheck speed, how long the fast test subset takes, and whether a single test can be run in isolation. Anything above about ten seconds breaks flow and quietly changes behaviour — people stop running tests locally and lean on CI, which lengthens every feedback loop.

**Onboarding** is the measurement instrument. Watch the next joiner set up without helping, and fix every stumble in the setup script or README rather than answering the question. The metric that captures it — days from start to first merged PR — should be days, not weeks; when it's weeks, the cause is nearly always environment setup and unclear ownership rather than the difficulty of the code.

## Why it matters

Practical rounds sometimes involve running someone else's repo, and how quickly you get productive is visible. More importantly, this is the concrete thing a new senior hire can fix in week one, which makes it a strong answer to "what would you do in your first thirty days?"

## Key points

- One idempotent command from a clean clone to a running app with data is the standard to aim at.
- Pin tool versions and run infrastructure in containers rather than documenting manual installs.
- Realistic seed data prevents a whole class of bugs that only appear with production-shaped data.
- Document every environment variable in an example file; never distribute secrets over chat.
- Dev/prod parity gaps are where "works on my machine" bugs come from — name them explicitly.
- Feedback loop latency above ten seconds changes behaviour: people stop running things locally.
- Use each new joiner as a test of the setup, and fix the script rather than answering the question.
- Time to first merged PR is the cheapest health metric a team can track.
