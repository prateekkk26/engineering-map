---
title: Design an Autocomplete
summary: The canonical frontend design prompt — debounce, cancellation, out-of-order responses, caching, and a listbox that a keyboard can actually drive.
level: core
minutes: 25
order: 4
tags: [frontend-system-design, design-problem, search]

related:
  - system-design/classic-problems/design-typeahead-search
  - frontend/state-and-data/data-fetching-patterns
  - frontend/accessibility/aria-and-when-not-to-use-it
  - frontend/browser-platform/fetch-cors-and-credentials

resources:
  - title: WAI-ARIA Authoring Practices — Combobox Pattern
    url: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
    source: W3C
    type: docs
    minutes: 25
    primary: true
  - title: AbortController
    url: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
    source: MDN
    type: docs
    minutes: 10
  - title: Debouncing and Throttling Explained
    url: https://css-tricks.com/debouncing-throttling-explained-examples/
    source: CSS-Tricks
    type: article
    minutes: 15
---

## In one line

Every keystroke wants to be a request, and the entire design is about sending fewer of them and correctly ignoring the answers to the ones you regret.

## What it is

**Requirements.** Suggestions under ~100ms perceived, top 5–10 results, keyboard operable, works on a phone, results possibly of mixed type (recent searches, entities, raw query). Ask whether the dataset is small enough to ship to the client — a country picker is a client-side filter and the whole network design disappears.

**The request path.** Debounce input at ~150–300ms. Set a minimum query length (2–3 characters) — short prefixes match everything and cost the most. Cache responses by normalised query string in an in-memory `Map`, and serve a cache hit synchronously so common prefixes never flicker. Prefix-narrowing is a cheap extra win: if `"rea"` returned results and the user types `"reac"`, you can filter locally while the network call is in flight.

**Out-of-order responses are the bug this prompt exists to test.** Request for `"re"` and `"react"` go out; `"re"` resolves second and overwrites the better answer. Two fixes, and you should name both: abort the previous request with an `AbortController`, and additionally tag each request with a sequence number or compare the response's query against the current input before committing it. Aborting alone isn't sufficient reasoning — a response can already be in flight past the abort point.

**Rendering.** The correct semantics are the ARIA **combobox** pattern: `role="combobox"` with `aria-expanded`, `aria-controls`, and `aria-activedescendant` pointing at the highlighted option in a `role="listbox"`. Focus stays in the input; arrow keys move the active descendant. Enter selects, Escape closes then clears, Tab commits or closes. Announce result counts via a live region so a screen reader knows something appeared.

**Optimisations to raise unprompted.** Virtualise only if the list can be long — usually it can't, so say why you're not. Highlight the matched substring safely, escaping user input rather than injecting HTML. Preconnect to the search origin. Handle the empty state, the zero-results state, and the network-error state distinctly. On mobile: don't let the on-screen keyboard cover the list, and use `enterkeyhint="search"`.

**Failure modes.** Network error → keep the last good results and show an inline retry rather than clearing. Slow response → show a spinner only after ~300ms so fast responses never flash one.

## Why it matters

This is the single most-asked frontend design prompt, and the interviewer is specifically listening for cancellation and out-of-order handling — most candidates debounce, stop, and consider the problem solved. It also has an unusually clean accessibility answer, which makes it the cheapest place to demonstrate the a11y signal these loops score.

## Key points

- Debounce plus a minimum query length removes most requests before any other optimisation matters.
- Out-of-order responses are the defining correctness bug; abort the old request *and* verify the response still matches current input.
- Cache by normalised query in memory, and filter the previous result set locally while the refined query is in flight.
- The right semantics are the ARIA combobox pattern with `aria-activedescendant` — focus never leaves the input.
- Delay the spinner by ~300ms so fast responses don't flash loading state.
- On error, retain the last good results rather than clearing the list.
- Escape user input when highlighting matches; this is a real XSS path.
- If the dataset is small, filter on the client and say so — the best request is the one not sent.
