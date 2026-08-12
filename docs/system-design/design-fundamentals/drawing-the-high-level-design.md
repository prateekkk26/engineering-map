---
title: Drawing the High-Level Design
summary: Getting from requirements to a diagram that can actually be evaluated — client to storage, happy path first, every box justified.
level: core
minutes: 20
order: 5
tags: [system-design, interview, architecture]

related:
  - system-design/design-fundamentals/running-a-system-design-interview
  - system-design/building-blocks/picking-the-datastore-in-a-design
  - system-design/frontend-system-design/frontend-api-design

resources:
  - title: The C4 Model for Visualising Software Architecture
    url: https://c4model.com/
    source: Simon Brown
    type: docs
    minutes: 25
    primary: true
  - title: System Design Primer — Step 2, Create a High Level Design
    url: https://github.com/donnemartin/system-design-primer#step-2-create-a-high-level-design
    source: Donne Martin
    type: repo
    minutes: 10
  - title: Architecture Diagrams That Don't Suck
    url: https://www.workingsoftware.dev/software-architecture-documentation-the-ultimate-guide/
    source: Working Software
    type: article
    minutes: 25
---

## In one line

Draw the happy path from client to storage in one pass, name what each box is for as you place it, and only then start adding the parts that handle scale and failure.

## What it is

**Start with the API, not the boxes.** Two or three endpoints with their inputs and outputs — `POST /posts`, `GET /feed?cursor=`. This forces the data flow to be concrete and gives the interviewer something specific to push on.

**Then the data model.** Main entities, their key fields, and the relationships. Enough to see which queries are cheap and which need help. If a required query has no index that can serve it, that's the design problem, and you've found it in minute twelve rather than minute forty.

**Then one pass, client to storage.** Client → edge/CDN → load balancer → API service → datastore. Add only the boxes that a requirement demands. Every box needs a sentence: *"a queue here because thumbnail generation takes seconds and the upload response shouldn't wait for it."* A box you can't justify is a box the interviewer will ask about, and "for scalability" is not an answer.

**Trace one request out loud, end to end.** A user posts; here's what's written, in what order, and what the response contains. Then a read. Tracing catches gaps that staring at the diagram doesn't — usually a missing write path or a query with nothing to serve it.

**Then, and only then, evolve it.** Add caching where the read path is hot, a queue where work is slow or bursty, a replica where reads dominate, fan-out where a write has to reach many readers. Each addition should reference a number from your estimate.

**Keep it legible.** Six to ten boxes at the top level. If a component is getting complicated, draw it as one box and expand it during the deep dive — that is exactly what the deep-dive phase is for. Label the arrows with the protocol or the payload when it isn't obvious (sync HTTP, async event, batch job); half the interesting questions in a design are about the arrows, not the boxes.

## Why it matters

The diagram is the shared artefact for the rest of the round — every follow-up question points at part of it. A diagram drawn depth-first, where one component is elaborate and the rest is missing, can't be evaluated and leaves the interviewer with nothing to probe. Getting a complete happy path down early also means that if you run out of time, you ran out of time with a whole answer on the board rather than a quarter of one.

## Key points

- Sketch the API and the data model before drawing any boxes; both surface disagreement cheaply.
- Cover the happy path end to end before adding anything for scale or failure.
- Every box gets a one-sentence justification tied to a requirement or a number.
- Trace one write and one read out loud through the diagram to find the gaps.
- Add caches, queues, replicas and fan-out as evolutions, each citing the estimate that motivated it.
- Six to ten top-level boxes; push detail into the deep dive rather than into the diagram.
- Label arrows as sync, async or batch — the arrows are where the hard questions live.
