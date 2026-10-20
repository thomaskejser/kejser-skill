---
name: etl
description: Conventions for ETL — acquiring external datasets, staging them, loading and transforming them into a database, and recording provenance. PLACEHOLDER: settled are Python scripts running .sql files in DuckDB, all transformation in SQL, and no dbt, Airflow or other ETL tool; acquisition, staging layout, re-runs, validation and scheduling are TBD. Use whenever fetching, importing or loading datasets, writing a load or transform step, building a warehouse or research database, or tracking where data came from.
---

# ETL

How external data is fetched, staged and loaded into a database in Thomas's projects.

> **⚠️ Placeholder.** Sections marked *TBD* are not decided yet.
> Where one applies, do not guess: ask Thomas, then send the answer to the `Skills` agent (see `kejser-code:skill-updates`).

## What's settled

- The target database follows `kejser-code:database`: naming, keys, types, NULL rules.
- **DuckDB** is the ETL engine, and holds staged and loaded analytics data.
- ETL is **Python scripts that run `.sql` files** in DuckDB, through the `duckdb` Python package (see `kejser-code:language-choice`).
  - SQL does all reading, transforming and writing: `read_csv`, `read_parquet` and `read_json` load files, and `.sql` files transform them.
  - Python fetches sources, decides which `.sql` files run in what order with which parameters, wraps a load that must land whole in a transaction, and logs.
  - Python never transforms data: no pandas, Polars or row loops.
- Transforms are SQL in `.sql` files, run as they are, with bound parameters; they are never assembled from strings in Python.
- Never dbt, Airflow, Dagster, Prefect or any other ETL or orchestration tool.
- An app that reads a database an ETL job rebuilds opens it with `readOnly: true, reopenOnChange: true`.

## TBD — fill in before relying on this skill

- **Source acquisition**: how datasets are fetched (download, API, scrape), where credentials come from, rate limits.
- **Licensing and provenance**: how each source's URL, licence, version and fetch date are recorded, and how a loaded row traces back to its source.
- **Raw and staging layout**: where raw downloads live, whether they are committed, and the staging schema or file layout.
- **Python conventions**: Python version, package and environment tool, script layout, how scripts find their `.sql` files.
- **Re-runs**: idempotent loads, full rebuild versus incremental, and how a rebuilt file replaces the live one.
- **Validation and rejected rows**: checks run after a load, where rejected rows go, and what fails the run.
- **Scheduling**: manual, cron or CI (never an orchestration tool), and how failures are reported.

## Updating this skill

When a convention is decided, send it to the `Skills` agent.
It replaces the *TBD* bullet with the concrete rule and moves it into "What's settled".
