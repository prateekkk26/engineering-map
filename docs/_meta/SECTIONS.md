# Sections index

What each primary section covers, and — more usefully — what it *doesn't*, so topics land in the right place.

Every section below is specified and authored: 8 sections, 82 subsections, 573 topics including `_shared/`. The per-section tables are the shipped structure, not a plan.

---

## 1. Frontend Engineering — `frontend`

> The browser, the language, React, and what it takes to ship UI that holds up.

**In scope:** JavaScript and TypeScript depth, React internals and patterns, Next.js, browser platform APIs, rendering and performance, frontend-specific security and privacy, frontend testing, accessibility and i18n, building UIs on top of model APIs, build tooling, and how frontend architecture is organised at scale.

**Not here:** general testing philosophy (`_shared/`), API design (`backend`), caching as a concept (`_shared/` — though HTTP caching specifically lives here), **frontend system design** (`system-design/frontend-system-design` — the design problems live with the other design problems).

**Status:** **specified and authored.** 14 subsections, 207 topics, all written.

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

**Noted gap, not frontend's to fill:** "how you work with AI coding tools" is now a live interview question and a JD line item. It belongs in `practices`, not here — closed by `practices/working-with-ai-tools`.

---

## 2. Backend Engineering — `backend`

> Services: how they're designed, secured, kept running, and observed.

**In scope:** the Node.js runtime, API design, authentication and authorization, async work and queues, real-time transport, reliability patterns, observability, deployment and runtime concerns.

**Not here:** database internals (`data`), system-level architecture across many services (`system-design`), CI/CD pipelines (`practices`).

**Status:** **specified and authored.** 8 subsections, 48 topics, all written, plus `_shared/idempotency` and `_shared/caching` surfaced in.

Reading order is the subsection order — the order you'd actually build a service. The contract it offers, who may call it, what runs it, the work that outlives a request, the work pushed back to the client, what running it in production involves, how you see inside it, and how it gets attacked.

| # | Subsection | Topics | Covers |
|---|---|---|---|
| 1 | `api-design` | 10 | Resources, validators, errors, pagination, versioning, limits, GraphQL/RPC, webhooks. |
| 2 | `auth` | 7 | Sessions, JWTs, OAuth/OIDC, authorization models, machine callers, credentials. |
| 3 | `node-runtime` | 5 | The event loop on a server, streams, async errors, leaks, using more than one core. |
| 4 | `async-work` | 6 | Queues, retries, idempotent consumers, schedules, long-running AI jobs. |
| 5 | `realtime` | 5 | Transport choice, SSE, WebSockets, proxying a model stream, connection fanout. |
| 6 | `services-in-production` | 6 | Serverless vs servers, config, pools, HTTP clients, uploads, SIGTERM. |
| 7 | `observability` | 5 | Structured logs, RED metrics, tracing, probes, and what telemetry costs. |
| 8 | `backend-security` | 4 | Injection, SSRF, secrets, and personal data. |

**Boundaries, because three sections are adjacent.** `data` owns the database; this section owns *talking to* one — pooling, transactions from application code, uploads to object storage. `system-design` owns reliability at design altitude — SLOs, blast radius, circuit breakers as a box on a diagram — so the implementation-level halves live here instead: the timeout you set on `fetch`, the readiness probe you fail first, the shutdown handler you write. `practices` owns the human half of operations. One duplicate was found and removed during authoring: HTTP methods and status codes are already `cs-fundamentals/networking`, so `api-design` carries only the server-authoring remainder — emitting validators and using `If-Match` for concurrency.

**Scoping decisions to note.** Written for a senior full-stack engineer at an AI-forward product company, not a backend specialist: Node and Postgres are named throughout rather than kept generic, and three topics exist purely because this is what those companies' backends actually do — `realtime/proxying-an-llm-stream`, `async-work/long-running-ai-jobs`, and `api-design/rate-limits-and-quotas` with token and cost quotas alongside request limits. `backend-security` is deliberately four topics: the browser threat model is `frontend/security` and the model layer is `ai/ai-security`, so what remains is the server's own surface.

Two topics are `level: deep` — `node-runtime/memory-and-leaks-in-node` and `realtime/scaling-connections-and-fanout` — real, and follow-ups rather than expected knowledge. Deliberately absent: framework tutorials (Express versus Fastify as a topic), Kubernetes and infrastructure-as-code, gRPC internals, message-broker internals, and microservice decomposition. Each failed the §0 test or belongs to an adjacent section.

---

## 3. Data & Databases — `data`

> Modelling data, and what happens when there's a lot of it.

**In scope:** relational fundamentals, Postgres in depth, transactions and isolation, schema design and migrations, choosing a datastore, scaling strategies, vector search and retrieval, data pipeline basics.

**Not here:** how a service talks to its database (`backend`), sharding as a distributed-systems concept (`system-design`).

> **Open question:** whether this stays separate from `backend` at all. Kept separate for now because Postgres depth is a distinct, deep, frequently-tested area — and because vector search sits naturally next to it and matters for the AI track. Authoring it settled the question in favour of keeping it: almost none of these topics would have landed naturally in `backend`.

**Status:** **specified and authored.** 8 subsections, 41 topics, all written.

Reading order is the subsection order: the model and the query, then what happens when two of them run at once, then the one database you will actually use, then designing and changing a schema, then picking something other than Postgres, then what breaks at volume, then vectors and pipelines.

| # | Subsection | Topics | Covers |
|---|---|---|---|
| 1 | `relational-fundamentals` | 6 | Normalisation, SQL worth knowing, joins, indexes, query plans, constraints. |
| 2 | `transactions-and-consistency` | 5 | ACID, isolation levels and their anomalies, MVCC, locks, optimistic vs pessimistic. |
| 3 | `postgres-in-depth` | 6 | Index types, JSONB, pooling, vacuum, RLS, and a diagnosis procedure. |
| 4 | `schema-design-and-migrations` | 6 | Feature to tables, keys, time, deletes, zero-downtime changes, multi-tenancy. |
| 5 | `choosing-a-datastore` | 5 | Document, key-value, search, analytical, object storage — and when Postgres already does it. |
| 6 | `scaling-data` | 6 | Replicas, partitioning, denormalisation, hot rows, N+1, dual writes. |
| 7 | `vector-data` | 3 | pgvector, ANN recall, keeping embeddings in sync. |
| 8 | `data-pipelines` | 4 | Batch vs streaming, CDC, ELT, idempotent jobs. |

**Scoping decisions to note.** The section is written for a senior *product* engineer, not a DBA: Postgres is treated as the default and named throughout rather than kept generic, because that is what the target companies run. `vector-data` is deliberately only three topics and only the storage layer — chunking, hybrid search, reranking and retrieval quality stay in `ai/rag-and-retrieval`, and the two sides link to each other. `data-pipelines` is awareness depth, since these loops ask how analytics and embedding jobs get fed, not how to build a Spark cluster. Deliberately absent: query-language tutorials, ORM-specific guides, and database internals below the level where they change a decision — each failed the §0 test.

Three topics are `level: deep` — `row-level-security`, `hot-rows-and-write-contention`, `change-data-capture` — real and occasionally asked, but follow-ups rather than expected knowledge.

---

## 4. System Design — `system-design`

> Designing systems at the whiteboard, including the AI-shaped ones.

**In scope:** design fundamentals and how to run the interview itself, building blocks, scalability, distributed systems theory, reliability, classic design problems, **AI system design**, low-level design and machine coding, architecture decision-making.

**Not here:** implementation detail of any single service (`backend`), how an LLM works internally (`ai`).

**Note:** *AI system design* is the highest-leverage subsection in the entire map for the target roles — designing an LLM gateway, RAG at scale, a multi-tenant agent platform, eval infrastructure. Few candidates can do these, and the companies hiring for AI-forward roles ask about them.

**Status:** **specified and authored.** 10 subsections, 87 topics, all written. `frontend-system-design` was specified earlier as part of the frontend workstream and was authored as its own track; the other 9 subsections (73 topics) were the primary system-design workstream.

Reading order is the subsection order. `design-fundamentals` first because it is how you run the round at all. `frontend-system-design` second because it is the round these loops actually schedule, and it reads fine before the infra chapters. Then the infra ladder — the pieces, making them bigger, what breaks once they are spread out, keeping them up. Then the two problem banks, classics then AI-shaped. Then design below the service line, then the decisions themselves.

| # | Subsection | Topics | Covers |
|---|---|---|---|
| 1 | `design-fundamentals` | 7 | Scoping, estimation, latency numbers, drawing it, defending it. |
| 2 | `frontend-system-design` | 14 | RADIO, frontend API design, and the standard frontend prompts. |
| 3 | `building-blocks` | 9 | One page per box you'd draw, plus `_shared/caching`. |
| 4 | `scalability` | 8 | Stateless services, read scaling, sharding, hot keys, multi-region, cost. |
| 5 | `distributed-systems` | 8 | CAP, consistency models, quorums, consensus, ordering, sagas, partial failure. |
| 6 | `reliability-and-operations` | 8 | SLOs, blast radius, retries, breakers, degradation, rollouts, capacity. |
| 7 | `classic-problems` | 10 | The recurring prompts, each worked to a defensible answer. |
| 8 | `ai-system-design` | 11 | Gateway, serving, streaming, RAG at scale, agents, evals, quotas, guardrails. |
| 9 | `low-level-design` | 5 | OOD in an interview, class APIs, state machines, the classics. |
| 10 | `architecture-decisions` | 7 | Monolith vs services, boundaries, events, build vs buy, ADRs, migration. |

**Scoping decisions to note.** This is written for a senior *product* engineer who will have to design a system out loud, not for a distributed-systems specialist: `distributed-systems` is the vocabulary layer — use the words precisely, know which guarantee you're giving up — and deliberately stops short of proofs. `classic-problems` holds ten prompts chosen because each owns a *distinct* hard part; there is no second feed problem. `low-level-design` is only five topics because these loops rarely run a dedicated OOD round, but "design the module" shows up inside the practical round constantly. `ai-system-design` is the largest subsection and the reason the section matters for this search.

Deliberately absent: consensus-algorithm internals beyond what leader election requires, storage-engine internals (LSM trees, B-tree implementation — `data` owns what a senior needs), Kubernetes and infrastructure-as-code specifics, and design problems whose hard part duplicates one already covered. Each failed the §0 test.

---

## 5. AI & LLM Engineering — `ai`

> Building real things with models: the differentiator for these roles.

**In scope:** LLM fundamentals, working with the API, prompting and context engineering, tool use and function calling, agents, MCP, RAG and retrieval, evals and quality, AI observability and cost, AI security, AI product thinking.

**Not here:** the architecture of an AI system at scale (`system-design` → AI system design). Roughly: *how the pieces work* lives here, *how you'd wire them together for a million users* lives there.

**Also not here:** model training and fine-tuning internals. Awareness-level only — knowing when to reach for fine-tuning versus RAG versus prompting is in scope; how to actually train is not.

**Status:** **specified and authored.** 11 subsections, 70 topics, all written.

Reading order is the subsection order: how a model behaves (`llm-foundations`), how you call it (`working-with-the-api`), how you steer it (`prompting-and-context`), then the four things built on top (`tool-use`, `agents`, `mcp`, `rag-and-retrieval`), then the four that decide whether any of it survives production (`evals-and-quality`, `observability-and-cost`, `ai-security`, `ai-product-thinking`).

| # | Subsection | Topics | Covers |
|---|---|---|---|
| 1 | `llm-foundations` | 8 | What the model actually does, at application-engineer depth. |
| 2 | `working-with-the-api` | 8 | The request/response surface, and what decides its cost and latency. |
| 3 | `prompting-and-context` | 7 | What goes in the window, in what order, and how to stop it rotting. |
| 4 | `tool-use` | 6 | How a model reaches outside its context; designing the tool surface. |
| 5 | `agents` | 7 | When to build one, how the loop works, keeping it on the rails. |
| 6 | `mcp` | 5 | The standard for plugging in tools and data — and when HTTP is still better. |
| 7 | `rag-and-retrieval` | 7 | Getting the right few thousand tokens in front of the model. |
| 8 | `evals-and-quality` | 6 | Knowing whether a change made the thing better. |
| 9 | `observability-and-cost` | 5 | What it did, what it cost, how slow it was for the person waiting. |
| 10 | `ai-security` | 6 | Untrusted text becoming instructions, and everything downstream. |
| 11 | `ai-product-thinking` | 5 | What to build with a model, and what not to. |

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

**In scope:** git and collaboration, code review, CI/CD and delivery, incident response, tech debt and refactoring, documentation and technical communication, working with AI coding tools, team workflow and developer experience.

**Not here:** testing strategy (`_shared/` — both frontend and backend own a version of that argument). SLOs, error budgets, and progressive rollout as *design* concerns (`system-design/reliability-and-operations`); ADRs and live-system migration as architecture (`system-design/architecture-decisions`); frontend-specific pipelines and DX (`frontend/tooling`). This section owns the human half of each — who gets paged, what they do first, what gets written afterwards.

**Status:** **specified and authored.** 8 subsections, 40 topics, all written.

Reading order is the subsection order: the path a change takes (commit, review, pipeline), then what happens when it goes wrong in production, then the slower work of keeping a codebase healthy, then how you write and talk about all of it, then the two things these loops have started asking about explicitly — working with AI coding tools, and how work gets planned at all.

| # | Subsection | Topics | Covers |
|---|---|---|---|
| 1 | `version-control` | 5 | The Git object model, branching strategies, rebase vs merge, PR hygiene, recovery. |
| 2 | `code-review` | 5 | What review is for, what to look for, giving and taking feedback, splitting changes. |
| 3 | `ci-cd-and-delivery` | 5 | CI as a practice, pipeline design, config and secrets, versioning, safe deploys. |
| 4 | `incident-response` | 5 | Alerting, roles and severity, mitigation first, production debugging, postmortems. |
| 5 | `quality-and-tech-debt` | 5 | Naming the debt, funding paydown, refactoring safely, unfamiliar code, health. |
| 6 | `technical-communication` | 5 | Design docs, documentation, runbooks, async updates, non-engineer audiences. |
| 7 | `working-with-ai-tools` | 5 | Workflow, delegating to agents, reviewing generated code, limits, the interview answer. |
| 8 | `team-workflow` | 5 | DORA and DX, estimation, incremental shipping, local setup, remote and async. |

**Scoping decisions to note.** Nothing here is asked as "explain CI" — these topics are the answers to the deep dive on prior work, the behavioural round, and the hiring-manager conversation, which is why the framing is consistently *what you did and how you decided* rather than tooling. `working-with-ai-tools` closes the gap flagged in §1: "how you work with AI coding tools" is a live interview question and a JD line item, and it lands here rather than in `frontend` or `ai` — `ai/` covers how models work, this covers how you work. Every topic is `level: core`; nothing in this section is a differentiator you can skip, because the questions are asked of every candidate.

Deliberately absent: agile ceremony mechanics (standup formats, sprint rituals, story-point calibration), specific vendor tooling walkthroughs, and management-track topics — performance reviews, hiring, headcount. Each failed the §0 test for an individual-contributor loop.

---

## 8. Behavioral & Senior Signals — `behavioral`

> The half of the loop that isn't technical, and where senior candidates most often lose.

**In scope:** what "senior" actually means in scope and influence, the method for building a STAR story bank, common behavioral prompts, technical communication as it's assessed in the loop, the AI-specific rounds, the reverse interview, compensation and levelling, positioning and outreach.

**Not here:** how to work with AI coding tools day to day (`practices/working-with-ai-tools` — including the "talk about your AI workflow" answer), design docs and runbooks as a craft (`practices/technical-communication`), giving and receiving review feedback (`practices/code-review`), whether a feature should use a model at all (`ai/ai-product-thinking`), and the UI mechanics the practical round tests (`frontend/ai-interfaces`).

> **Open question — resolved.** It belongs, but only the reference half. The *method* for building a story bank is reference material and lives here; the stories themselves are personal, stay out of the repo, and `story-bank/` teaches the technique rather than holding them.

**Status:** **specified and authored.** 8 subsections, 32 topics, all written.

| # | Subsection | Topics | Covers |
|---|---|---|---|
| 1 | `what-senior-means` | 5 | Scope, ownership, influence, judgement, and the rubric you're scored against. |
| 2 | `story-bank` | 5 | STAR, sourcing and tagging stories, tailoring, impact numbers, I vs we. |
| 3 | `common-questions` | 6 | Conflict, failure, ambiguity, feedback, mentoring, hardest problem. |
| 4 | `technical-communication` | 4 | Deep dive, thinking out loud, non-engineers, writing that's graded. |
| 5 | `ai-behavioral` | 3 | Narrating model experience, the practical AI round, having a view. |
| 6 | `the-reverse-interview` | 3 | Questions that signal seniority, startup diligence, red flags. |
| 7 | `comp-and-levelling` | 3 | Levelling, negotiation, US/EU remote employment structures. |
| 8 | `positioning-and-outreach` | 3 | The positioning line, CV and LinkedIn, why this company. |

---

## `_shared/`

Not a section — it never appears on the home screen. It holds concepts two or more sections would each want to own, so they exist once and surface in several places via `surfaced_in`.

Authored: `caching`, `cache-invalidation`, `idempotency`, `concurrency-models`, `error-handling`, `testing-strategy`, `security-fundamentals`, `api-contracts`, `observability-fundamentals`. Nine topics, each surfaced into two or three subsections.

The rule for what qualifies, and the tie-breaker for borderline cases, is in `CONVENTIONS.md` § 1.
