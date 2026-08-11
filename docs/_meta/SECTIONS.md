# Sections index

What each primary section covers, and — more usefully — what it *doesn't*, so topics land in the right place.

Subsection lists below are **placeholders**. Each section gets specified properly in Phase 2, one at a time. A section marked *not yet specified* has a `_meta.yaml` and an empty folder, and that's correct for now.

---

## 1. Frontend Engineering — `frontend`

> The browser, the language, React, and what it takes to ship UI that holds up.

**In scope:** JavaScript and TypeScript depth, React internals and patterns, Next.js, browser platform APIs, rendering and performance, frontend-specific security and privacy, frontend testing, accessibility and i18n, building UIs on top of model APIs, build tooling, and how frontend architecture is organised at scale.

**Not here:** general testing philosophy (`_shared/`), API design (`backend`), caching as a concept (`_shared/` — though HTTP caching specifically lives here), **frontend system design** (`system-design/frontend-system-design` — the design problems live with the other design problems).

**Status:** **specified.** 14 subsections, 207 topics. Authoring runs depth-first in the order below.

| # | Subsection | Topics | Covers |
|---|---|---|---|
| 1 | `javascript` | 16 | Language mechanics and models. No basics. |
| 2 | `react` | 24 | Mental model, internals, hooks, concurrent rendering, RSC, React 19. |
| 3 | `nextjs` | 18 | App Router, rendering strategies, the caching model, shipping it. |
| 4 | `state-and-data` | 17 | Where state lives; server state, fetching, forms, realtime. |
| 5 | `browser-platform` | 20 | Rendering path, events, storage, transport, workers, navigation. |
| 6 | `performance` | 16 | Core Web Vitals, loading, INP, profiling, budgets. |
| 7 | `ai-interfaces` | 9 | Streaming, chat UI, cancellation, tool-call rendering, safe output. |
| 8 | `security` | 15 | Browser threat model, XSS/CSP, auth storage, supply chain, GDPR. |
| 9 | `typescript` | 13 | The type system as a design tool. |
| 10 | `css` | 8 | Cascade, layout, tokens, styling-architecture tradeoffs, scale. |
| 11 | `architecture` | 15 | Component APIs, design systems, monorepos, observability, migrations. |
| 12 | `testing` | 13 | Strategy, RTL, MSW, Playwright, flake, CI. |
| 13 | `accessibility` | 10 | Semantics, ARIA, focus, WCAG/ADA/EAA, i18n and RTL. |
| 14 | `tooling` | 13 | Modules, bundlers, tree shaking, publishing, CI/CD, debugging. |

### What the target loops actually test

Researched against published interview guides, question banks, and current senior frontend JDs at AI-forward US/EU companies (August 2026). This is the evidence the tree is checked against, per `PRD.md` §1.2.

- **Technical screen** — ~45 minutes live coding in a shared editor (CoderPad or similar), not whiteboard DSA. Data transformation, event handling, and small UI components from scratch. This is what `javascript/utilities-from-scratch` and `machine-coding-classics` exist for.
- **Framework deep-dive** — ~60 minutes on React internals: hooks, state management, rendering behaviour, performance. Drives the size of the `react` subsection.
- **Practical / take-home** — a real repo, deliberately underspecified. Reviewers score architecture decisions, loading/error/success states, and whether you asked the right clarifying questions — not just whether it works. At AI companies the brief is frequently a streaming chat surface.
- **Frontend system design** — the named framework in circulation is **RADIO** (Requirements, Architecture, Data model, Interface/API, Optimisations). Standard prompts: autocomplete/typeahead, news feed, collaborative editor, dashboard, e-commerce checkout. Difficulty ladders from request lifecycle and local state → caching, normalisation, pagination, virtualisation → concurrency, conflict handling, offline consistency.
- **The senior signal, explicitly** — every guide says the same thing: the differentiator is not getting a working answer, it's **optimisations, performance, accessibility, and i18n** raised unprompted, plus tradeoff reasoning that survives follow-up. That is why `performance`, `accessibility`, and `security` are full subsections rather than footnotes.
- **JD requirements that recur** — React/Next.js/TypeScript, SSR and caching for performance, reusable component libraries across teams, accessibility and cross-browser support, GraphQL consumption, Redux/Zustand-class state libraries, and increasingly *agentic coding workflow* (specs, delegating subtasks to AI tools).

**Noted gap, not frontend's to fill:** "how you work with AI coding tools" is now a live interview question and a JD line item. It belongs in `practices`, not here — flagged for when that section is specified.

---

## 2. Backend Engineering — `backend`

> Services: how they're designed, secured, kept running, and observed.

**In scope:** the Node.js runtime, API design, authentication and authorization, async work and queues, real-time transport, reliability patterns, observability, deployment and runtime concerns.

**Not here:** database internals (`data`), system-level architecture across many services (`system-design`), CI/CD pipelines (`practices`).

**Status:** not yet specified.

---

## 3. Data & Databases — `data`

> Modelling data, and what happens when there's a lot of it.

**In scope:** relational fundamentals, Postgres in depth, transactions and isolation, schema design and migrations, choosing a datastore, scaling strategies, vector search and retrieval, data pipeline basics.

**Not here:** how a service talks to its database (`backend`), sharding as a distributed-systems concept (`system-design`).

> **Open question:** whether this stays separate from `backend` at all. Kept separate for now because Postgres depth is a distinct, deep, frequently-tested area — and because vector search sits naturally next to it and matters for the AI track.

**Status:** not yet specified.

---

## 4. System Design — `system-design`

> Designing systems at the whiteboard, including the AI-shaped ones.

**In scope:** design fundamentals and how to run the interview itself, building blocks, scalability, distributed systems theory, reliability, classic design problems, **AI system design**, low-level design and machine coding, architecture decision-making.

**Not here:** implementation detail of any single service (`backend`), how an LLM works internally (`ai`).

**Note:** *AI system design* is the highest-leverage subsection in the entire map for the target roles — designing an LLM gateway, RAG at scale, a multi-tenant agent platform, eval infrastructure. Few candidates can do these, and the companies hiring for AI-forward roles ask about them.

**Status:** one subsection specified — `frontend-system-design` (14 topics), authored as part of the frontend workstream. It holds the frontend design round: the RADIO framework, frontend API design, and the standard prompts (autocomplete, infinite feed, chat, collaborative editor, file uploader, data grid, notifications, analytics SDK, multi-step form, design system, offline architecture, machine-coding classics). It lives here rather than in `frontend` so that all design problems sit together. The rest of the section is not yet specified.

---

## 5. AI & LLM Engineering — `ai`

> Building real things with models: the differentiator for these roles.

**In scope:** LLM fundamentals, working with the API, prompting and context engineering, tool use and function calling, agents, MCP, RAG and retrieval, evals and quality, AI observability and cost, AI security, AI product thinking.

**Not here:** the architecture of an AI system at scale (`system-design` → AI system design). Roughly: *how the pieces work* lives here, *how you'd wire them together for a million users* lives there.

**Also not here:** model training and fine-tuning internals. Awareness-level only — knowing when to reach for fine-tuning versus RAG versus prompting is in scope; how to actually train is not.

**Status:** **specified and authored.** 11 subsections, 70 topics, all written.

Reading order is the subsection order: how a model behaves (`llm-foundations`), how you call it (`working-with-the-api`), how you steer it (`prompting-and-context`), then the four things built on top (`tool-use`, `agents`, `mcp`, `rag-and-retrieval`), then the four that decide whether any of it survives production (`evals-and-quality`, `observability-and-cost`, `ai-security`, `ai-product-thinking`).

Two deliberate boundaries: the UI on top of a model API is `frontend/ai-interfaces`, not here; and browser-side consequences of model output (XSS from rendered markdown, CSP) are `frontend/security`, while `ai-security` holds the model-layer threat model.

---

## 6. CS Fundamentals — `cs-fundamentals`

> The layer underneath everything else.

**In scope:** complexity analysis, core data structures, algorithm patterns, concurrency and parallelism, networking, operating systems basics, and a curated problem-practice protocol.

**Not here:** language-specific implementation details (`frontend` for JS specifics).

> **Weighting, now settled by evidence:** the loops in `PRD.md` §1.1 do not run heavy DSA rounds — the technical screen is live coding in a real editor on data transformation and UI components, not algorithm puzzles. This section stays deliberately small. Networking and concurrency earn their place regardless; they show up in system design and backend work constantly.

**Status:** **specified and authored.** 7 subsections, 39 topics, all written. That is deliberately a fifth of `frontend`'s size — the weighting note above is the reason.

Reading order is the subsection order: how you talk about cost, what you store things in, what you do to them, then the three areas that are fundamentals in the "underneath everything" sense, then how to practise.

| # | Subsection | Topics | Covers |
|---|---|---|---|
| 1 | `complexity` | 4 | Big-O, space tradeoffs, amortised vs average case, and when the notation lies. |
| 2 | `data-structures` | 8 | Arrays through graphs, ending on how to justify the choice out loud. |
| 3 | `algorithms` | 7 | Patterns, not a catalogue — recognition speed under time pressure. |
| 4 | `concurrency` | 4 | Threads vs async I/O, races, locks, backpressure. Plus `_shared/concurrency-models`. |
| 5 | `networking` | 8 | Names, packets, sockets, certificates, distance, and failure. |
| 6 | `operating-systems` | 5 | Only what has plausibly paged someone at 3am. |
| 7 | `problem-practice` | 3 | What actually gets asked, thinking out loud, and a practice protocol. |

Three boundaries worth stating. The browser-facing half of HTTP — caching, CORS, versions and transports as the browser exposes them — stays in `frontend/browser-platform`; `networking` is the layer below it. `_shared/concurrency-models` is surfaced into `cs-fundamentals/concurrency` rather than duplicated. And per `PRD.md` §2 this app links out to problem sets rather than hosting them, which is why `problem-practice` holds the method and not the problems.

**Scoping decisions to note.** `dynamic-programming` and `tries-and-prefix-search` are `level: deep` on purpose — real, occasionally asked, and not worth grinding for this target. Deliberately absent: sorting-algorithm implementations as separate pages, advanced graph algorithms beyond traversal and a named mention of Dijkstra, bit manipulation, and OS syllabus material with no operational consequence. Each failed the §0 test — no round asks it.

---

## 7. Engineering Practices — `practices`

> How work actually gets done on a team, and the senior-level version of each.

**In scope:** git and collaboration, code review, CI/CD, documentation and technical communication, tech debt and refactoring, incident response, developer experience.

**Not here:** testing strategy (`_shared/` — both frontend and backend own a version of that argument).

**Status:** not yet specified.

---

## 8. Behavioral & Senior Signals — `behavioral`

> The half of the loop that isn't technical, and where senior candidates most often lose.

**In scope:** what "senior" actually means in scope and influence, a STAR story bank drawn from real projects, common behavioral prompts, technical communication, AI-specific behavioral questions, the reverse interview, compensation and levelling, positioning and outreach.

> **Open question:** whether this belongs in the app at all. The story bank in particular is personal, specific, and not really *reference* material — it may want to be a private document rather than a page next to `Event Loop`. Deferred until the technical sections are real.

**Status:** not yet specified.

---

## `_shared/`

Not a section — it never appears on the home screen. It holds concepts two or more sections would each want to own, so they exist once and surface in several places via `surfaced_in`.

Current and likely candidates: caching, idempotency, testing strategy, error handling, security fundamentals, API contracts, concurrency models.

The rule for what qualifies, and the tie-breaker for borderline cases, is in `CONVENTIONS.md` § 1.
