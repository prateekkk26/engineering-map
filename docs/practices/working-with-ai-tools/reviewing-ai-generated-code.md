---
title: Reviewing AI-generated code
summary: Generated code is plausible by construction, so review it for invented APIs, missing edge cases, and dependencies you didn't ask for — and never merge what you can't explain.
level: core
minutes: 22
order: 3
tags: [ai, code-review, security]

related:
  - practices/code-review/what-to-look-for-in-a-review
  - practices/working-with-ai-tools/where-ai-coding-tools-fail
  - frontend/security/dependency-supply-chain

resources:
  - title: Hallucinations in code are the least dangerous form of LLM mistakes
    url: https://simonwillison.net/2025/Mar/2/hallucinations-in-code/
    source: Simon Willison
    type: article
    minutes: 10
    primary: true
  - title: AI code suggestions sabotage software supply chain
    url: https://www.theregister.com/2025/04/12/ai_code_suggestions_sabotage_supply_chain/
    source: The Register
    type: article
    minutes: 10
  - title: OWASP Top 10 for LLM Applications
    url: https://owasp.org/www-project-top-10-for-large-language-model-applications/
    source: OWASP
    type: docs
    minutes: 30
  - title: Do Users Write More Insecure Code with AI Assistants?
    url: https://arxiv.org/abs/2211.03622
    source: Stanford
    type: article
    minutes: 30
---

## In one line

The failure mode is not obviously wrong code — it's code that looks exactly like correct code and is subtly not.

## What it is

Generated code is optimised for plausibility, which defeats the heuristics reviewers rely on. Human mistakes look messy; model mistakes look tidy, idiomatic, and confident. So the review has to be deliberate rather than pattern-matched, and it needs a checklist of the failure classes that recur.

**Hallucinated APIs and packages.** Functions, options, and config keys that don't exist but should. Worse, imports of packages that don't exist — an attack surface with a name now, *slopsquatting*, where someone registers the plausible-but-nonexistent package the models keep suggesting. Verify every new dependency actually exists, is the one you meant, and is maintained. Check the lockfile diff, not just the import line.

**Edge cases and error handling.** The happy path is nearly always right. Empty arrays, nulls, unicode, timezones, concurrent callers, partial failure, and non-2xx responses are where the gaps live. Error handling tends toward the generic `try/catch` that swallows and logs.

**Security.** Input reaching a sink without escaping, authorisation checked in the wrong layer or not at all, secrets in code, permissive CORS, weak or outdated crypto choices copied from old training data. The empirical finding worth knowing: assisted participants in the Stanford study wrote less secure code *while being more confident it was secure* — the confidence gap is the actual hazard.

**Fit with the codebase.** Reimplementing a helper that exists, a different HTTP client, a state pattern the codebase abandoned, a new dependency where an existing one does the job. Individually harmless, collectively a codebase with five ways to do everything.

**Tests that assert nothing.** Generated tests love to mock the unit under test, assert on implementation detail, or test that a mock was called. Ask the same question as always: would this fail if the behaviour were wrong?

Two rules that cover most of it. **You are the author** — "the model wrote it" is not a defence in review or in a postmortem, and the PR is yours. And **if you can't explain a line, it doesn't merge**: understanding is not optional overhead, it's what makes you able to debug it at 3am.

## Why it matters

Teams are merging far more generated code than a year ago, and review is now the binding constraint on quality. Interviewers ask about it directly — describing specific failure classes you check for is one of the clearest ways to show you use these tools seriously rather than credulously.

## Key points

- Model errors look idiomatic and confident, which defeats normal review pattern-matching.
- Verify every new dependency exists and is maintained; hallucinated package names are an active supply-chain attack vector.
- The happy path is usually correct — spend the review on empty, null, concurrent, and failure cases.
- Check authorisation, escaping, and secret handling explicitly; assisted code skews less secure while feeling more secure.
- Watch for duplicated helpers and inconsistent patterns that fragment the codebase.
- Generated tests often assert on mocks; require that a test would fail if behaviour were wrong.
- You are the author of what you submit, regardless of what produced it.
- Don't merge a line you can't explain — you'll be the one debugging it.
