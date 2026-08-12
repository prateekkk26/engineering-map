# Knowledge Map — Product Requirements

**Status:** Phases 1–4 complete; Phase 5 partial
**Last updated:** 2026-08-12

---

## 1. Problem & goal

Preparing for senior engineering interviews means holding a wide surface area in your head: the browser, React, backend design, databases, distributed systems, and — increasingly — how to actually build with LLMs and agents. The material exists, but it's scattered across bookmarks, tabs, and half-remembered blog posts. There's no single place that says *here is the set of things a senior engineer is expected to have a real grasp of, and here's where to go learn each one.*

**Goal:** a simple, readable knowledge map that can be browsed from a phone. Pick a subject, drill down, read what a concept is and why it matters, and follow curated links out for depth.

**Who it's for:** one person — Prateek. Not a product, not a community resource. Optimising for one reader means it can be opinionated.

**Done looks like:** the interview alignment test in §1.2 passes for every section — nothing that could reasonably be asked in the target loops is missing a page. Each page says what the concept is and why it matters, and points at the best material for going deeper. Reachable in three taps or one search, from a phone, on a train.

---

## 1.1 Target roles and companies

This is not a general knowledge base. It is preparation for a specific job search, and that search determines what belongs in it.

**Roles:** senior and staff-leaning frontend and full-stack engineering.

**Companies:** AI-forward startups and product companies in the **US and Europe**, remote-first. The kind of place where the product is built on models, the frontend is React and Next.js, and the team is small enough that a senior engineer owns a surface end to end.

**The loop those companies run**, because it decides what the content has to prepare for:

| Round | What it actually is |
|---|---|
| Recruiter screen | Motivation, level, comp range, remote logistics |
| Technical screen | Live coding in a real editor — not whiteboard algorithms. Usually language and framework fluency under time pressure |
| Practical round | A take-home or pair-programming session in a real repo. Frequently building a UI against an LLM API |
| Frontend system design | Component and data-layer altitude — design an autocomplete, a feed, a collaborative surface. Not boxes-and-arrows infrastructure |
| Deep dive on prior work | One project, probed by follow-up until it hits the limit of what you actually know |
| Behavioural / values | Ownership, ambiguity, disagreement, and why this company |
| Founder or hiring manager | Judgement, product sense, and whether you'd be good to work with |

Notably absent from most of these loops: heavy DSA rounds. That is why `cs-fundamentals` is deliberately small — see `docs/_meta/SECTIONS.md` §6.

## 1.2 The interview alignment test

The content selection rule of record. Every topic in this map is checked against it.

> **A topic earns a page if it can plausibly come up in one of the rounds above, or if you need it to answer something that does.**
>
> A topic can be skipped if it is real but never asked — deep browser-engine trivia, deprecated APIs, framework history for its own sake.
>
> When in doubt, include it. A missing topic is discovered in the interview; an unnecessary one costs twenty minutes of reading.

Applied concretely: before creating a topic, answer *which round asks this, and what does the question sound like?* If there's no answer, it doesn't get a page. If the answer is "only as a follow-up to something else," it's `level: deep` rather than `core`.

**"Done" for a section means: nothing that could reasonably be asked in these loops is absent from it.** Not "the outline looks complete" — the test is a coverage audit against real job descriptions and real interview guides for the companies above.

---

## 2. Non-goals

Named explicitly so they don't creep back in later:

- **No quizzes, flashcards, or spaced repetition.** This is a reading and reference tool. Self-testing happens elsewhere.
- **No drills or practice problems.** Links out to them, yes. Hosting them, no.
- **No gamification** — no streaks, badges, XP, or "you're on fire" messaging.
- **No social features.** Single user.
- **No CMS or admin UI.** Content is markdown files edited in an editor and committed to git.
- **No AI features in the initial build.** Possible much later; not part of the product definition.

---

## 3. Information architecture

Four levels, and it stops there:

```
① Home            →  ② Section        →  ③ Subsection      →  ④ Topic
   all sections       its subsections     its topics           the content
```

**The topic page is terminal.** There is no fifth level, and topics do not nest.

This is the most important structural rule in the document. If a topic grows too big, it becomes two sibling topics — never a parent with children. Depth beyond level ④ comes from outbound resource links and links to related topics, not from more nesting. A four-level tree stays navigable on a phone; a five-level one becomes a maze, and the reader loses track of where they are.

### Primary sections

Starting set. Expect this to be reshaped as sections get specified in detail.

| Section | Slug | Covers |
|---|---|---|
| Frontend Engineering | `frontend` | The browser, JavaScript, React, performance, frontend security |
| Backend Engineering | `backend` | APIs, auth, async work, reliability, observability |
| Data & Databases | `data` | Relational modelling, Postgres, transactions, scaling data |
| System Design | `system-design` | Design fundamentals, distributed systems, classic and AI system design |
| AI & LLM Engineering | `ai` | LLM fundamentals, tool use, agents, MCP, RAG, evals |
| CS Fundamentals | `cs-fundamentals` | Complexity, data structures, algorithm patterns, networking |
| Engineering Practices | `practices` | Git, code review, CI/CD, incidents, tech debt, writing, AI tooling |
| Behavioral & Senior Signals | `behavioral` | Story bank, communication, the reverse interview |

---

## 4. Navigation flow

### ① Home — "what can I learn?"

A single vertical list of section cards. Each card shows an icon, the title, a one-line description, and a count (`6 subsections · 48 topics`).

Nothing else. No dashboard, no charts, no hero section.

A search box sits at the top and filters across every topic title and summary in the tree, so a concept you already know the name of is one search away instead of three taps. Search is the primary navigation path for anything you're looking for on purpose; browsing is for discovering what you didn't know was there.

### ② Section — "what's inside this subject?"

Breadcrumb, section title and description, then a list of subsections. Each row: title, one-line description, topic count.

### ③ Subsection — "which concept do I want?"

Breadcrumb, subsection title and description, then the topic list. Each row: topic title, its one-line summary, and small chips for level (`core` / `deep`) and estimated read time.

Shared topics pulled in from `_shared/` appear in this list too, marked so it's clear they live elsewhere.

### ④ Topic — the content

See section 5.

---

## 5. The topic page contract

Every leaf page renders the same shape, every time. Predictability is the feature: you learn where things are once, and after that you can skim any page at speed.

| Block | Content |
|---|---|
| Breadcrumb | `Frontend › JavaScript › Event Loop` — each level tappable |
| Title + chips | Concept name; level and estimated read time |
| **In one line** | The TL;DR, one sentence |
| **What it is** | Plain-language explanation, a few paragraphs |
| **Why it matters** | The senior-interview and real-work relevance |
| **Key points** | 4–8 bullets — the checkable "do I actually know this" list |
| **Actions & links** | See below |
| Prev / next | Move through the subsection without going back up |

### The "Actions & links" block

This is what gives a topic more context than the page itself carries:

- **Start here** — the single best resource, called out on its own. Exactly one per topic.
- **Go deeper** — the rest of the curated links. Each shows title, source, a type icon (docs / article / video / repo / book / course), and rough time.
- **Related topics** — internal links to siblings and across sections, so `Caching` in Backend can point at `HTTP Caching` in Frontend.
- **Look it up** — one-tap outbound actions for when the curated links aren't enough: search the web for the concept, or open it in Claude with a pre-filled "explain this to me" prompt.

> **Resources are the floor; prose is the ceiling.**
> A topic with good links and no prose is still useful. A topic with neither is not. Authoring therefore runs links-first across the whole tree, then backfills prose by priority.

---

## 6. Content model

`docs/` is both the human-readable knowledge base **and** the app's content source. It reads well directly on GitHub and renders nicely in the app. One source, two surfaces.

### Folder layout

```
docs/
  _meta/                   # authoring infrastructure, not content
    TEMPLATE.md
    CONVENTIONS.md
    SECTIONS.md
  _shared/                 # cross-cutting concepts owned by no single section
    _meta.yaml
    <topic>.md
  <section>/
    _meta.yaml
    <subsection>/
      _meta.yaml
      <topic>.md
```

### Path maps directly to route

```
docs/frontend/javascript/event-loop.md   →   /frontend/javascript/event-loop
```

No route table to maintain. Moving a file moves the page.

### Metadata lives next to what it describes

Ordering, titles, icons, and descriptions live in a `_meta.yaml` inside each folder, rather than in one central outline file. Adding a subsection is one folder plus one small file — nothing to keep in sync, and no drift between an outline and reality. The folder tree *is* the structure.

```yaml
# docs/frontend/_meta.yaml
title: Frontend Engineering
icon: monitor
description: What a senior is expected to know about the browser, React, and shipping UI.
order: 1
subsections: [javascript, typescript, react, performance, security, testing]
```

Any folder not listed in `subsections` still renders, appended alphabetically. A new folder is never invisible just because the meta file wasn't updated.

### Frontmatter

Full field reference in `docs/_meta/CONVENTIONS.md`. It is the schema of record; this section is a summary.

### `_shared/` — the cross-cutting problem

Some concepts genuinely belong to more than one section: security fundamentals, caching, testing philosophy, error handling, idempotency. Duplicating them means two copies drifting apart. Picking one home means every other section has a hole.

**Rule:** a concept lives in `_shared/` when two or more sections would each want to own it. Sections reference it from their `_meta.yaml`, and it renders inline in those subsection topic lists with a "shared" marker — discoverable from every section that needs it, while existing exactly once on disk.

`CONVENTIONS.md` holds the tie-breaker for borderline cases.

---

## 7. Design principles

Written down so they act as a constraint later, when the temptation to add things arrives.

- **One column of reading, always.** Max-width text, generous line height, large tap targets. This is a reading app.
- **The frame around it may use the screen.** On a phone the page is that single column and nothing else. On a laptop it sits in a persistent shell: a navigation rail on the left carrying the whole tree, and — on the topic page only, above 1280px — the Actions & links block moved into a rail on the right. The prose measure does not change between them; what changes is how much walking it takes to reach a page. The tree is 40-odd subsections deep now, and three clicks from wherever you are was the single biggest cost of using this on a laptop.
- **Search is reachable from every page**, via ⌘K. §4 calls search the primary navigation path; it should not require going home first.
- **Lists, not grids.** Grids look designed and read worse on a phone.
- **Icons for recognition only** — one per section, one per resource type. A small consistent set, no decoration.
- **No animation, no charts, no dashboard, no empty-state illustrations.**
- **Respect system light/dark.** No theme switcher.
- **Every screen reachable in three taps or one search.**
- **Fast over fancy.** Statically generated; no loading spinners on content.

The test for any proposed addition: *does this help me read and find things faster?* If not, it doesn't go in.

---

## 8. Phases

| Phase | Scope | Status |
|---|---|---|
| **1** | PRD, `docs/` skeleton, `_meta/` (template + conventions + section index), section `_meta.yaml` files, sample topics proving the contract | Done |
| **2** | Per-section subsection and topic specification, driven by Prateek section by section | Done — 8 sections, 82 subsections |
| **3** | The app — Next.js App Router + TypeScript + Tailwind, reading `docs/` at build time, statically generated, deployed to Vercel, installable to the home screen | Done — 661 static pages |
| **4** | Content authoring, **depth-first by subsection** — each subsection finished completely (meta, frontmatter, verified resources, prose) before the next begins. Section priority: Frontend → AI → System Design → Backend → Data → rest | Done — 573 topics, all written. Resources verified by `npm run check:links` |
| **5** | Progress tracking — per-topic status and confidence, rolled up to subsection and section. Additive; static pages stay static | Part shipped: the covered/not-covered bit, rollups on every level, and a `/progress` overview. Confidence rating and notes not built |

### Phase 3 technical notes

Next.js App Router + TypeScript + Tailwind, matching the existing `portfolio` project so there's no new learning curve. Content read from `docs/` at build time via `gray-matter`. Fully static — no database, no auth, no server runtime until Phase 5. Client-side search runs against a JSON index built at compile time. Web app manifest so it installs to the home screen.

### Phase 5 technical notes

Progress is keyed on the topic's full slug path (`section/subsection/topic`), not on a database row ID, so it survives content restructuring. Per topic: status (`not started` / `reading` / `done`), a 1–5 confidence rating, and free-text notes. Confidence rolls up into the subsection and section views, and the home page gains a "weakest areas" strip. Storage decision deferred to Phase 5 — the requirement is that it syncs between phone and laptop.

**What was actually built first**, and why it is narrower than the paragraph above:

- **One bit, not three states.** `covered` / `not covered`, set by hand on the topic page and by nothing else. `reading` is a state the app would have to infer from a page view, and an inferred number is not a number you can trust when deciding what to revise.
- **No confidence rating yet.** It changes what the rollups mean — an average, not a count — so it waits until the count has been lived with. The store (`src/lib/progress.ts`) keys on slug and holds a value per topic, so adding a rating is a change to that value, not a migration.
- **Storage is `localStorage`, with export/import on `/progress`.** The sync requirement is unmet and known: it needs a server, and Phase 3's "no server runtime" is worth more right now than automatic sync between two devices. Every read and write goes through one module, so the swap is confined to it.
- **Rollups are counted by slug prefix**, not by shipping topic lists to the client — the denominators come from the same build-time counts the "written of planned" lines use.

---

## 9. Open questions

To resolve as sections get specified.

- [x] ~~Are the eight primary sections in section 3 the right cut?~~ **Answered by authoring them.** `data` stays separate — almost none of its 41 topics would have landed naturally in `backend`. `cs-fundamentals` earns its place at a deliberate 39 topics, a fifth of `frontend`, because networking and concurrency carry it even though DSA is weighted lightly. See `SECTIONS.md` §3 and §6.
- [x] ~~Should `behavioral` live in this app at all, or is it a different kind of artifact (a private story bank) that doesn't belong next to technical reference?~~ **Answered:** it lives here, but only the reference half. `behavioral/story-bank` covers how to build and tell the stories; the stories themselves are personal, stay out of the repo, and are kept in a private document.
- [ ] Is `level: core | deep` the right axis, or should it be by round from §1.1 (screen / practical / design / deep-dive)? `core`/`deep` kept for now because a topic often serves more than one round.
- [x] ~~How many topics per subsection before it should be split?~~ **Answered:** no fixed cap. A subsection splits when it stops describing one coherent area, not on a count. §1.2 governs what gets created; `CONVENTIONS.md` §4 holds the rule.
- [ ] Should the search index cover full topic body text, or just titles and summaries? **Still open.** Titles, summaries and tags ship today — 227KB as a fetched `/search-index.json` route at 573 topics. Body text would multiply that by roughly an order of magnitude, so the question is now whether the index stays a single fetched file at all.
- [ ] Phase 5: where does progress actually live? **Interim answer:** browser storage with manual export/import, because it keeps the build static. Still open, because it does not sync — a hosted database or a synced file is what the requirement actually asks for.
