# Authoring conventions

The rules that keep a few hundred topic files consistent. This file is the **schema of record** — if the PRD and this file disagree about a field, this file wins.

---

## 0. Whether a topic exists at all

Before anything else. The rule is `PRD.md` §1.2, the interview alignment test:

> A topic earns a page if it can plausibly come up in one of the rounds in PRD §1.1, or if you need it to answer something that does.

Answer it out loud: **which round asks this, and what does the question sound like?**

- No answer → no page. Deep engine trivia, deprecated APIs, and framework history don't get one.
- "Only as a follow-up to something else" → it exists, but as `level: deep`.
- Genuinely unsure → create it. A missing topic is discovered in the interview; an unnecessary one costs twenty minutes of reading.

This cuts both ways. It is also the argument for including things a generic frontend map would skip — GDPR-compliant consent, the European Accessibility Act, streaming LLM UIs — because the target companies do ask about them.

---

## 1. Where a topic goes

Every topic lives at exactly one path:

```
docs/<section>/<subsection>/<topic>.md
```

Slugs are lowercase, hyphen-separated, and stable. **The slug is the URL and the identity of the topic** — Phase 5 progress tracking keys off the full path. Renaming a file breaks that link, so rename deliberately, not casually.

Prefer a slug that reads as a concept rather than a question: `event-loop`, not `how-does-the-event-loop-work`.

### The `_shared/` decision

A concept goes in `_shared/` when **two or more sections would each want to own it**.

Ask: *if I put this in section A, would a reader browsing section B reasonably expect to find it there too, and be confused when it's missing?* If yes, it's shared.

| Concept | Home | Why |
|---|---|---|
| Caching | `_shared/` | Frontend (HTTP caching), Backend (Redis, cache-aside), Data (query caching) all want it |
| Idempotency | `_shared/` | API design and distributed systems both need it |
| XSS | `frontend/security/` | Only meaningful in a browser context |
| Index types | `data/postgres/` | Only meaningful against a database |
| Testing strategy | `_shared/` | Frontend and backend both own a version of this argument |
| React reconciliation | `frontend/react/` | Single home, no ambiguity |

**Tie-breaker when it's genuinely 50/50:** put it in the section where you'd look for it *first*, and add a `related` entry from the other. Do not create it twice. A duplicated topic is worse than a slightly misfiled one, because the two copies will drift and you'll trust the wrong one.

A shared topic still declares which subsections should surface it, via `surfaced_in` (see below).

---

## 2. Frontmatter

Every topic file starts with YAML frontmatter.

```yaml
---
title: Event Loop, Microtasks & Macrotasks
summary: How JavaScript schedules async work, and why a promise always runs before a timer.
level: core
minutes: 25
order: 3
tags: [async, runtime]
related:
  - frontend/javascript/promises
  - _shared/concurrency-models
resources:
  - title: In The Loop
    url: https://www.youtube.com/watch?v=cCOL7MC4Pl0
    source: JSConf
    type: video
    minutes: 34
    primary: true
  - title: The event loop
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
    source: MDN
    type: docs
    minutes: 10
---
```

### Field reference

| Field | Required | Type | Notes |
|---|---|---|---|
| `title` | yes | string | Sentence case. The concept, not a question. |
| `summary` | yes | string | **One sentence**, shown in topic lists and search results. Say what the reader gets, not what the page contains. |
| `level` | yes | `core` \| `deep` | `core` = expected of any senior candidate. `deep` = differentiator, or only relevant in specific roles. |
| `minutes` | yes | int | Estimated time to read this page *and* its primary resource. |
| `order` | no | int | Position within the subsection. Omitted topics sort after ordered ones, alphabetically. |
| `tags` | no | string[] | Freeform, lowercase. For search and cross-cutting discovery. Don't invent a taxonomy — reuse existing tags where they fit. |
| `related` | no | string[] | Slug paths, no leading slash, no `.md`. Rendered as internal links. |
| `resources` | yes | object[] | At least one. See below. |
| `surfaced_in` | `_shared/` only | string[] | `section/subsection` paths where this shared topic should appear in the topic list. |

### Resource fields

| Field | Required | Notes |
|---|---|---|
| `title` | yes | The resource's own title, not your description of it. |
| `url` | yes | Direct link. No trackers, no shorteners, no paywalled-without-warning links. |
| `source` | yes | Who published it — `MDN`, `Anthropic`, `Martin Fowler`, `JSConf`. Shown next to the title so credibility is visible at a glance. |
| `type` | yes | `docs` \| `article` \| `video` \| `repo` \| `book` \| `course` |
| `minutes` | no | Rough time. For books, omit. |
| `primary` | no | Exactly one resource per topic sets `primary: true`. |

### The `primary` resource

Exactly one per topic. This is the "if you only read one thing" link, rendered on its own as **Start here**.

Choose it by what teaches the concept best, not by what's most official. A 30-minute conference talk that makes something click beats a reference page that technically documents it.

---

## 3. Body structure

Four headings, in this order, always. Use the exact heading text — the renderer keys off it.

```markdown
## In one line

## What it is

## Why it matters

## Key points
```

Resources and related topics are **not** written in the body. They come from frontmatter and are rendered into the "Actions & links" block automatically. Never hand-write a links section.

### What goes in each

**In one line** — a single sentence. The thing you'd say if someone asked "what's X?" and you had five seconds. If you can't write this one, you don't understand the topic well enough to write the rest yet.

**What it is** — two to four paragraphs of plain-language explanation. Assume a competent engineer who hasn't worked with this specific thing. No throat-clearing, no history lesson unless the history explains the design.

**Why it matters** — two or three sentences on why a senior candidate is expected to know this, and where it actually shows up in real work. Be concrete: name the failure mode it prevents or the interview question it unlocks. "It's important to understand" is not a reason.

**Key points** — four to eight bullets. Each one is a claim you should be able to state and defend out loud. This is the checkable "do I actually know this?" list, so write them as assertions, not topics.

> Good: *A promise callback always runs before a `setTimeout(fn, 0)` scheduled in the same tick, because microtasks drain fully before the next macrotask.*
> Bad: *Microtasks vs macrotasks.*

---

## 4. Length, and when to split

**Target: 300–600 words of body.** Under 200 and it's probably a bullet on another page. Over 900 and it's probably two topics.

Split when the "Key points" list exceeds eight bullets, or when the page is answering two different questions.

**Split into siblings, never into children.** The tree is four levels and stops. If `Caching` gets too big, it becomes `Caching Strategies` and `Cache Invalidation` next to each other, linked by `related` — not a `caching/` folder with pages inside it.

**There is no cap on topics per subsection.** A subsection splits when it stops describing one coherent area, not when it passes a count. `frontend/react` at 24 topics is fine — it is all one thing, and dropping a topic to hit a number would fail §0. But if half of those topics were really about data fetching, that half is a different subsection.

---

## 5. Link policy

A resource earns its place. The default is to include nothing.

**Include:**
- Primary sources — official docs, specs, the original paper or post that introduced the idea.
- Explanations that genuinely teach, from people who know the subject.
- Something you have actually read or watched, or would confidently recommend.

**Exclude:**
- SEO listicles, "top 10 X interview questions", content farms.
- Anything requiring signup to read the substance.
- Video courses where the useful part is 4 minutes in a 3-hour playlist — unless you link the timestamp.
- Duplicates. Three articles saying the same thing is worse than one, because now you have to choose.

**Three to five resources per topic is right.** More than six means you haven't decided.

Links authored from memory need verifying before they're trusted — URLs move and posts disappear. Flag anything unverified with a trailing `# unverified` comment in the YAML until it's checked.

---

## 6. Tone

Write for yourself, six months from now, on a phone, with ten minutes.

- Direct. No "in this article we will explore."
- Opinionated where you have an opinion. "JWT is usually the wrong default for sessions, and here's when it isn't" is more useful than a neutral comparison table.
- Concrete over abstract. Name the failure, the number, the real system.
- No hedging filler — "it's worth noting that", "essentially", "basically".
- It's fine to say something is rarely asked but worth knowing. Say so explicitly rather than implying it by omission.

---

## 7. Starting a new topic

0. Apply §0 — name the round that asks it. If you can't, stop here.
1. Copy `docs/_meta/TEMPLATE.md` to its path.
2. Fill the frontmatter first — especially `summary` and the `primary` resource. If you can't pick a primary resource, you're not ready to write the page.
3. Write **In one line**. If it doesn't come easily, go read the primary resource and come back.
4. Write the rest.
5. Add the topic's slug to its subsection `_meta.yaml` `topics` list if you want explicit ordering.

A topic with good frontmatter, real resources, and an empty body is a legitimate intermediate state — it's already useful. An empty topic with no resources is not; don't create the file until you have at least the primary link.
