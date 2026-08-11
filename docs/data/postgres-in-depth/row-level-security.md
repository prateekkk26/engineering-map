---
title: Row-Level Security
summary: Pushing tenant and ownership rules into the database as policies, and the ways that goes wrong.
level: deep
minutes: 20
order: 5
tags: [data, postgres, security, multi-tenancy]

related:
  - data/schema-design-and-migrations/multi-tenancy-data-models
  - data/postgres-in-depth/connection-pooling
  - frontend/security/auth-token-storage

resources:
  - title: Row Security Policies
    url: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
    source: PostgreSQL
    type: docs
    minutes: 25
    primary: true
  - title: Row Level Security
    url: https://supabase.com/docs/guides/database/postgres/row-level-security
    source: Supabase
    type: docs
    minutes: 20
  - title: A Practical Guide to Row Level Security
    url: https://www.crunchydata.com/blog/row-level-security-for-tenants-in-postgres
    source: Crunchy Data
    type: article
    minutes: 15
---

## In one line

Row-level security attaches a `WHERE` clause to a table that the database enforces on every query, so a missing filter in application code stops being a data leak.

## What it is

You enable it per table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) and attach policies: a `USING` expression controlling which rows are visible to `SELECT`, `UPDATE` and `DELETE`, and a `WITH CHECK` expression controlling which rows may be written. A typical tenant policy compares a column to a value from the session — `tenant_id = current_setting('app.tenant_id')::uuid` — or to a claim in a JWT, which is how Supabase-style architectures let a browser talk to Postgres directly through PostgREST.

Two details decide whether it actually holds. **Table owners and superusers bypass policies** unless you add `FORCE ROW LEVEL SECURITY`, so testing as the owner proves nothing. And the session variable has to be set *by trusted code on every connection checkout* — if your API sets `app.tenant_id` once at connect time but the pooler recycles connections between requests in transaction mode, one request can inherit another tenant's setting. Set it inside the transaction, and prefer `set_config(..., true)` so it is transaction-scoped.

**Performance**: a policy is a predicate merged into every plan, so it must be indexable. A policy calling a slow function, or one whose predicate cannot use an index, quietly turns every query on the table into a sequential scan. Postgres also treats some functions in policies as non-leakproof and may refuse to push down filters, which changes plans in ways that surprise people.

The honest trade-off. RLS is defence in depth: it converts "we forgot the tenant filter in this one query" from a cross-tenant data leak into an empty result set, which is the single most expensive bug class in a multi-tenant product. The cost is that authorisation logic now lives in two places, policies are harder to read and test than application code, and debugging "why is this row missing?" gets less obvious. Most teams that adopt it do so because a browser or an untrusted client talks to the database directly, or because compliance demands enforcement below the application.

## Why it matters

Multi-tenancy comes up in almost every B2B system design conversation, and RLS is the answer that shows you know enforcement can live below the application layer. It is also standard equipment in the Supabase-shaped stacks a lot of AI-forward startups use, so "how does RLS interact with your pooler?" is a plausible practical question.

## Key points

- A policy is a predicate the database applies to every statement, so forgetting a filter yields no rows rather than another tenant's rows.
- `USING` controls what is readable; `WITH CHECK` controls what may be written — you usually need both.
- Table owners bypass policies unless `FORCE ROW LEVEL SECURITY` is set, which makes owner-account testing misleading.
- The tenant setting must be applied inside the transaction, or transaction-mode pooling can leak it across requests.
- Policy predicates must be indexable; an unindexable policy turns every query into a sequential scan.
- RLS duplicates authorisation logic — adopt it as defence in depth or for direct client access, not to replace application checks.
- Test policies with a non-owner role, including the negative case, or you have tested nothing.
