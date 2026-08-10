---
title: Internationalised Routing
summary: Locale in the URL, dictionaries loaded on the server, and the parts of i18n that are not translation.
level: deep
minutes: 20
order: 15
tags: [nextjs, i18n, routing]

related:
  - frontend/accessibility/internationalisation-and-rtl
  - frontend/nextjs/middleware-and-the-edge-runtime
  - frontend/nextjs/metadata-and-seo

resources:
  - title: Internationalization
    url: https://nextjs.org/docs/app/guides/internationalization
    source: Next.js
    type: docs
    minutes: 25
    primary: true
  - title: next-intl
    url: https://next-intl.dev/docs/getting-started
    source: next-intl
    type: docs
    minutes: 25
  - title: Intl
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
    source: MDN
    type: docs
    minutes: 20
---

## In one line

The App Router has no built-in i18n routing, so the locale becomes a dynamic segment — `app/[lang]/...` — with `proxy.ts` redirecting bare paths to a detected default.

## What it is

The Pages Router had an `i18n` config that handled locale routing for you. The App Router deliberately does not; you build it from the primitives, which is more code and considerably more control.

The standard shape is a `[lang]` segment at the top of the tree. Every route sits under it, `generateStaticParams` enumerates the supported locales so they prerender, and the root layout sets `<html lang={lang} dir={dir}>` from the param. `proxy.ts` handles the bare `/about` case: read `Accept-Language` or a stored cookie preference, then redirect to `/en/about`.

Dictionaries load on the server. A per-locale JSON module imported inside a server component means only the active locale's strings ship — the alternative, a client-side i18n provider, sends every language to every user and grows linearly with the number of locales. Libraries like `next-intl` handle the plumbing plus plural rules and message formatting, which you do not want to hand-roll.

Then there is the part that is not translation. `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, and `Intl.PluralRules` are built into the platform and handle currency, dates, and plural categories correctly — a language with six plural forms will not survive an `n === 1 ? 'item' : 'items'`. Right-to-left needs CSS logical properties (`margin-inline-start`, not `margin-left`) rather than a mirrored stylesheet. And text expansion is real: German runs roughly 30% longer than English and will break a layout designed to fit exactly.

SEO has its own requirements: `alternates.languages` in metadata generates `hreflang` tags, each locale needs its own canonical, and the sitemap should list every localised URL.

## Why it matters

The target companies here are US *and* Europe, and European products ship multilingual by default — so this appears in JDs and in design rounds far more often than it does for US-only work.

It is also a good depth probe: "how would you add a second language?" separates people who say "add a translation library" from people who mention routing, RTL, plural rules, and hreflang.

## Key points

- There is no built-in i18n routing in the App Router — the locale is a `[lang]` dynamic segment you own.
- `generateStaticParams` over the locale list prerenders each language; the root layout sets `lang` and `dir`.
- `proxy.ts` detects locale from `Accept-Language` or a cookie and redirects bare paths.
- Load dictionaries on the server so only the active locale ships to the browser.
- Use the `Intl` APIs for dates, numbers, currency, and plural rules rather than hand-written formatting.
- RTL needs CSS logical properties, and layouts must tolerate ~30% text expansion.
- `alternates.languages` produces `hreflang`; every locale needs its own canonical and sitemap entry.
