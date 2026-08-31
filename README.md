# Engineering Map

A knowledge map of what a senior engineer is expected to know — the browser, React, backend, data, distributed systems, and building with models — written as short pages that each say what a thing is, why it matters, and where to go next.

**[engineering-map.vercel.app](https://engineering-map.vercel.app)**

573 topics · 74 subsections · 8 sections · 1,415 hand-picked outbound links.

It was written for one person preparing for senior and staff-leaning interviews, which is why it takes positions instead of hedging. It is open because the content stopped being private the day the repository was.

---

## What it is

Four levels, and it stops there:

```
① Home  →  ② Section  →  ③ Subsection  →  ④ Topic
```

**The topic page is terminal.** If a topic grows too big it becomes two sibling topics, never a parent with children — depth comes from the links out, not from more nesting. A four-level tree stays navigable on a phone; a five-level one becomes a maze.

Every topic page renders the same shape, every time: what it is in one line, what it is, why it matters, key points, then the links. Predictability is the feature — you learn where things are once.

### How topics were chosen

One rule, applied to all 573:

> A topic earns a page if it can plausibly come up in a real interview round, or if you need it to answer something that does.

That is why there is no algorithms grind here, and why the AI and LLM section is as large as it is. The full reasoning is in [`PRD.md`](PRD.md); the authoring rules are in [`docs/_meta/CONVENTIONS.md`](docs/_meta/CONVENTIONS.md).

## How it is built

Markdown in [`docs/`](docs/), read from disk at build time with `gray-matter`, rendered by Next.js App Router into ~660 prerendered pages. No database, no CMS, no admin UI. The content reads as files on GitHub and renders as pages on the site, and both are the same source.

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict) · **Tailwind v4**
- Client-side search over a JSON index built at compile time, reachable with <kbd>⌘K</kbd> from any page
- Installable to a home screen via a web manifest

```bash
npm install
cp .env.example .env.local
npm run dev
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build — prerenders every page |
| `npm run lint` | ESLint |
| `npm run check:docs` | Structural linter for `docs/` — frontmatter, headings, resource counts |
| `npm run check:links` | Requests every outbound URL and reports the dead ones |

Both `check:` scripts are Python 3 and need `pyyaml` (`pip install pyyaml`).

## Configuration

Everything optional is behind a build-time flag, and **every flag defaults to off** — a missing or misspelled variable means the feature is absent, never that it leaked. They are read in exactly one place, [`src/lib/flags.ts`](src/lib/flags.ts). See [`.env.example`](.env.example) for the full list.

| Variable | Gates |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, the sitemap, link previews |
| `NEXT_PUBLIC_ENABLE_PROGRESS` | Per-topic "covered" marks, the rollup meters, `/progress` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` + `NEXT_PUBLIC_GA_ID` | Google Analytics |
| `NEXT_PUBLIC_ENABLE_VISITORS` | Display of the visitor count |
| `NEXT_PUBLIC_ENABLE_LIKES` | The site-wide like count |
| `NEXT_PUBLIC_ENABLE_DONATIONS` + `NEXT_PUBLIC_POLAR_CHECKOUT_URL` | The support link |

`NEXT_PUBLIC_*` values are inlined into the browser bundle at build time, so changing one in the Vercel dashboard needs a redeploy. There is no runtime toggle, deliberately.

### Two things that surprise people

**Progress is per-browser.** It lives in `localStorage`, which is scoped to the origin — so marks made on the deployed site are not visible to `npm run dev` on localhost, and every Vercel preview deployment gets its own empty store. That is expected. `/progress` has an export and an import for moving between devices.

**If you enable Google Analytics**, also turn on *GA4 Admin → Data Streams → Enhanced Measurement → "Page changes based on browser history events"*. Without it GA records only the landing page, because every navigation after that is client-side. Do not add manual pageview events to compensate — they double-count the moment someone flips the setting on.

### Setting up the optional services

Each is independent, and the site is complete without any of them.

**The like count** needs a Redis store. Vercel dashboard → Storage → Marketplace → Upstash → create a database → connect it to the project, then `vercel env pull .env.local`. Set `LIKES_IP_SALT` to any long random string (`openssl rand -hex 32`) — it salts the per-visitor hash that rate-limits the button, and the raw address is never stored.

**The visitor count** reads the Google Analytics Data API, so the number on the page matches the dashboard. Create a Google Cloud project, enable the *Google Analytics Data API*, create a service account and download its JSON key, then add that service account's email as a **Viewer** under GA4 Admin → Property Access Management. `GA_SA_PRIVATE_KEY` holds the key with escaped newlines; the route unescapes them, which is the failure everyone hits first.

**The support link** needs no code and no secret. In Polar: create a one-time product with *pay what you want* pricing, name it exactly what the button says, then Products → Checkout Links → New Link and put that URL in `NEXT_PUBLIC_POLAR_CHECKOUT_URL`.

Every one of these degrades to *nothing rendered* if its service is unreachable. There is no state in which a counter shows a zero or an error.

## Contributing

Corrections, dead links and better resources are welcome — open an issue or a PR. New topics are a harder yes: the map is deliberately bounded by the selection rule above, so a topic needs an answer to *which interview round asks this, and what does the question sound like?* Read [`docs/_meta/CONVENTIONS.md`](docs/_meta/CONVENTIONS.md) first — it is the schema of record, and `npm run check:docs` enforces most of it.

## Licence

Two licences, because the code and the writing want different terms:

- **Code** — `src/`, `scripts/`, configuration: [MIT](LICENSE).
- **Content** — everything in `docs/`: [CC BY-NC-SA 4.0](docs/LICENSE). Share it, adapt it, credit it, keep it non-commercial, and pass on the same freedoms.

The split is deliberate. The code is unremarkable and you should take it. The writing is a few hundred hours of selection, and the failure mode worth guarding against is it being repackaged and sold as a course.
