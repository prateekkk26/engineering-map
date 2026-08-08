---
# Copy this file to docs/<section>/<subsection>/<slug>.md and fill it in.
# Field reference and rules: docs/_meta/CONVENTIONS.md

title: # Sentence case. The concept, not a question.
summary: # ONE sentence. Shown in topic lists and search results.
level: core # core | deep
minutes: 20 # Time to read this page plus its primary resource.
order: # Position in the subsection. Omit to sort alphabetically after ordered topics.
tags: [] # Freeform, lowercase. Reuse existing tags where they fit.

related: # Slug paths — no leading slash, no .md. Optional.
  # - frontend/javascript/promises
  # - _shared/caching

resources: # At least one. Exactly one must be primary: true.
  - title: # The resource's own title.
    url:
    source: # Who published it — MDN, Anthropic, Martin Fowler, JSConf.
    type: docs # docs | article | video | repo | book | course
    minutes:
    primary: true
---

## In one line

<!-- A single sentence. What you'd say if someone asked "what's X?" and you had five
     seconds. If this one is hard to write, go read the primary resource first. -->

## What it is

<!-- Two to four paragraphs, plain language. Assume a competent engineer who hasn't
     worked with this specific thing. No throat-clearing, no history unless the
     history explains the design. -->

## Why it matters

<!-- Two or three sentences. Why a senior candidate is expected to know this, and
     where it shows up in real work. Name the failure mode it prevents or the
     interview question it unlocks. "It's important to understand" is not a reason. -->

## Key points

<!-- Four to eight bullets. Each is a claim you should be able to state and defend
     out loud — an assertion, not a topic heading.

     Good: A promise callback always runs before a setTimeout(fn, 0) scheduled in
           the same tick, because microtasks drain fully before the next macrotask.
     Bad:  Microtasks vs macrotasks. -->

-
-
-
-

<!-- Do NOT write a resources or related-links section here.
     Those come from frontmatter and are rendered automatically. -->
