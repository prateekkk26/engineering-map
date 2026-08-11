---
title: Internationalisation & RTL
summary: Building for other languages and writing directions — formatting, layout, text expansion, and the parts that are not translation.
level: core
minutes: 25
order: 10
tags: [accessibility, i18n, rtl]

related:
  - frontend/nextjs/internationalised-routing
  - frontend/css/flexbox-and-grid-layout-models
  - frontend/accessibility/visual-accessibility

resources:
  - title: Internationalization
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
    source: MDN
    type: docs
    minutes: 30
    primary: true
  - title: CSS logical properties
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values
    source: MDN
    type: docs
    minutes: 25
  - title: RTL Styling 101
    url: https://rtlstyling.com/posts/rtl-styling
    source: Ahmad Shadeed
    type: article
    minutes: 30
---

## In one line

Internationalisation is mostly the parts that are not translation — formatting, plural rules, layout direction, and leaving room for text that is 30% longer.

## What it is

**The platform does formatting.** `Intl.NumberFormat` handles currency, grouping separators and decimal marks; `Intl.DateTimeFormat` handles date order, month names and calendars; `Intl.RelativeTimeFormat` produces "3 days ago" correctly per locale; `Intl.PluralRules` and `Intl.ListFormat` cover the grammar. Hand-rolled formatting is both wrong and unnecessary — `n === 1 ? 'item' : 'items'` breaks in every language with more than two plural categories, and there are several.

**Interpolation must not be concatenation.** "You have " + n + " messages" cannot be translated, because word order differs. Use a message format with named placeholders — ICU MessageFormat is the standard — so translators can reorder and can express plural and gender selection.

**RTL is a layout concern, not a text one.** Arabic, Hebrew, Persian and Urdu mirror the entire interface: navigation, icons that imply direction, progress bars, sliders. **CSS logical properties** are the mechanism — `margin-inline-start` rather than `margin-left`, `padding-block`, `inset-inline`, `text-align: start` — so one stylesheet works in both directions. `dir="rtl"` on the root then flips everything. Icons that indicate direction (back arrows, chevrons) need mirroring; icons that do not (a clock, a checkmark) must not be.

**Text expansion is a design constraint.** German runs roughly 30% longer than English, and some languages more. A layout designed to exactly fit its English label will break, so components need to tolerate wrapping and avoid fixed widths on text containers. Pseudo-localisation — rendering with accented, lengthened placeholder text — surfaces those failures before translation exists.

**Typography** varies too: line height that suits Latin is too tight for Thai or Devanagari, CJK does not word-wrap the same way, and font stacks need per-script fallbacks.

Then the operational parts. **Locale detection** should follow `Accept-Language` or a stored preference, with an explicit switcher, and locale belongs in the URL for shareability and SEO. **Load only the active locale's messages** — shipping every language to every user is a bundle problem that grows linearly. And **date and number input** are as locale-dependent as output: a date picker assuming month/day order will collect wrong data.

## Why it matters

The target market here is US **and** Europe, where multilingual is the default expectation rather than a later phase, and RTL support appears in JDs for products with Middle East reach.

Retrofitting is expensive: hard-coded strings, concatenated sentences, and physical CSS properties are spread through everything by the time anyone asks.

## Key points

- Use the `Intl` APIs for dates, numbers, currency, relative time, plurals and lists.
- Never concatenate sentences — use ICU-style messages with named placeholders.
- Logical properties make one stylesheet work in both directions; `dir="rtl"` does the rest.
- Mirror directional icons only; leave non-directional ones alone.
- Expect ~30% text expansion and test with pseudo-localisation before translations exist.
- Line height, wrapping, and font fallbacks vary by script.
- Detect locale from headers or preference, put it in the URL, and load only the active locale's messages.
