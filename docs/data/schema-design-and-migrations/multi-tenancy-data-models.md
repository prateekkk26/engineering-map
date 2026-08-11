---
title: Multi-Tenancy Data Models
summary: Shared tables, schema per tenant, or database per tenant — and why shared-with-a-tenant-column is the default that scales furthest.
level: core
minutes: 20
order: 6
tags: [data, modelling, system-design, saas]

related:
  - data/postgres-in-depth/row-level-security
  - data/scaling-data/partitioning-and-sharding
  - data/schema-design-and-migrations/zero-downtime-migrations

resources:
  - title: Designing your SaaS Database for Scale
    url: https://www.citusdata.com/blog/2016/10/03/designing-your-saas-database-for-high-scalability/
    source: Citus Data
    type: article
    minutes: 25
    primary: true
  - title: Multi-tenant SaaS patterns
    url: https://learn.microsoft.com/en-us/azure/azure-sql/database/saas-tenancy-app-design-patterns
    source: Microsoft
    type: docs
    minutes: 25
  - title: Schemas
    url: https://www.postgresql.org/docs/current/ddl-schemas.html
    source: PostgreSQL
    type: docs
    minutes: 15
---

## In one line

Three isolation levels — a tenant column, a schema per tenant, a database per tenant — trading blast radius against the cost of operating thousands of copies.

## What it is

**Shared tables with a `tenant_id` column.** One schema, one connection pool, one migration. Cheap, and it handles tens of thousands of tenants. `tenant_id` goes on every tenant-owned table and becomes the leading column of nearly every index, because every query is scoped by it. The risk is exactly one thing: a query that forgets the filter returns another customer's data. That risk is managed with a data-access layer that always applies it, row-level security as a backstop, and tests that assert cross-tenant isolation explicitly.

**Schema per tenant.** Each tenant gets a Postgres schema with identical tables. Better perceived isolation and easy per-tenant export, but migrations now run N times — at a thousand tenants a migration is a job with a progress bar and partial-failure handling — and the catalog itself gets slow with tens of thousands of schemas. Connection pooling suffers because `search_path` is session state.

**Database (or cluster) per tenant.** Strongest isolation, per-tenant backup, restore and residency, and the ability to give a big customer their own resources. It is also the most operational cost per tenant, and cross-tenant analytics becomes a pipeline problem rather than a query. This is what enterprise and regulated deals actually ask for.

Most products land on **shared tables, plus the ability to peel a specific tenant out** onto their own database when a contract demands it. That hybrid is worth stating explicitly in a design round: it keeps the common path cheap while having an answer for the enterprise requirement.

Cross-cutting concerns whichever you choose: **noisy neighbours** (one tenant's giant query or import degrading everyone — rate limits, statement timeouts, and per-tenant quotas), **skew** (the biggest tenant being 1000× the median, which breaks any assumption that per-tenant tables stay small), **per-tenant data export and deletion**, which compliance will ask for, and **where tenant identity comes from** — it must derive from the authenticated session, never from a request parameter.

## Why it matters

Almost every B2B product is multi-tenant, so this is a recurring system design prompt, and the cross-tenant leak is one of the highest-severity bugs a SaaS product can ship. Being able to compare the three models by blast radius, migration cost and cross-tenant querying — rather than asserting one is correct — is the senior answer.

## Key points

- Shared tables with a tenant column is the right default: one migration, one pool, scales to very large tenant counts.
- `tenant_id` belongs at the front of nearly every composite index because every query filters on it.
- The tenant filter must live in a shared data-access layer, with RLS as a backstop — never repeated by hand.
- Schema per tenant multiplies migration cost by tenant count and stresses the catalog past a few thousand.
- Database per tenant buys isolation, residency and per-tenant restore, and costs the most to operate.
- A hybrid — shared by default, dedicated for enterprise customers — is a legitimate and common answer.
- Tenant skew and noisy neighbours are the operational realities: enforce statement timeouts and per-tenant quotas.
