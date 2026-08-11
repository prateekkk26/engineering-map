---
title: ETL vs ELT & the Warehouse
summary: Load raw data first and transform it in SQL — why the order changed, and what the modern data stack actually consists of.
level: deep
minutes: 20
order: 3
tags: [data, pipelines, analytics]

related:
  - data/choosing-a-datastore/oltp-vs-olap-and-the-warehouse
  - data/data-pipelines/idempotent-jobs-and-data-quality
  - data/data-pipelines/batch-vs-streaming

resources:
  - title: What is dbt?
    url: https://docs.getdbt.com/docs/introduction
    source: dbt Labs
    type: docs
    minutes: 20
    primary: true
  - title: Apache Iceberg — Table format spec
    url: https://iceberg.apache.org/spec/
    source: Apache Iceberg
    type: docs
    minutes: 30
  - title: Airflow Concepts
    url: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html
    source: Apache Airflow
    type: docs
    minutes: 20
---

## In one line

ETL transformed data before loading it because storage and compute were expensive; ELT loads it raw and transforms it in the warehouse, because they no longer are.

## What it is

**ETL** — extract, transform, load — was necessary when the warehouse was a fixed-size appliance. Transformation happened in a separate system, and only the modelled result landed. The problem is that raw data was discarded: when the definition of "active user" changed, you had to re-extract from the source, which may no longer hold the history.

**ELT** — extract, load, transform — lands raw data first and transforms it inside the warehouse with SQL. Cloud warehouses separate storage from compute and charge little for the former, so keeping everything raw is cheap. The consequence that matters: **transformations become re-runnable**, because the input is still there. A changed metric definition is a rebuild, not an archaeology project.

**The stack in practice.** Ingestion (Fivetran, Airbyte, or your own CDC) lands raw tables. **dbt** models transformations as version-controlled SQL with dependencies, tests and generated documentation — which is what turned analytics engineering into a software-engineering discipline, since models get reviewed, tested and deployed like code. Orchestration (Airflow, Dagster, Prefect) schedules and handles retries and dependencies. BI sits on top.

The **layering convention** is worth knowing because it appears in every dbt project: *staging* models clean and rename raw sources one-to-one; *intermediate* models join and reshape; *marts* are the business-facing tables analysts query. The point is that raw data is never queried directly and business definitions live in exactly one place.

**Lakehouse** formats — Iceberg, Delta Lake, Hudi — put table semantics (schema evolution, time travel, ACID-ish commits) over Parquet files in object storage, so warehouse-style querying works over a data lake. That is what has been collapsing the warehouse/lake distinction, and Iceberg in particular has become the interoperability format multiple engines read.

For a product engineer, the useful boundary is this: you own the **quality and stability of the source data and the events you emit**. If an event's shape changes silently, every downstream model breaks — which makes event schemas a contract, not an implementation detail.

## Why it matters

You will not usually own the warehouse, but you will be asked to emit the events it consumes and to explain why a number in a dashboard disagrees with the product. Knowing where transformation happens and what a staging-to-mart pipeline looks like makes those conversations tractable, and "how do analytics get this data?" is a normal design follow-up.

## Key points

- ELT keeps raw data, which makes transformations re-runnable when definitions change; ETL throws away that option.
- Cheap separated storage and compute in cloud warehouses are what made the reordering practical.
- dbt turns transformations into reviewed, tested, dependency-aware SQL — analytics as software engineering.
- The staging/intermediate/mart layering keeps business definitions in one place and raw tables out of reports.
- Orchestrators handle scheduling, dependencies and retries; they are not where logic should live.
- Lakehouse formats like Iceberg add schema evolution and time travel to files in object storage.
- Event schemas emitted by the product are a contract; changing one silently breaks every downstream model.
