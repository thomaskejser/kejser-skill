---
name: etl
description: Conventions for ETL — acquiring external datasets, staging them, loading and transforming them into a database, and recording provenance. PLACEHOLDER: only the engine and SQL-file rules are settled; acquisition, staging layout, load tooling, re-runs, validation and scheduling are TBD. Use whenever fetching, importing or loading datasets, writing a load or transform step, building a warehouse or research database, or tracking where data came from.
---

# ETL

How external data is fetched, staged and loaded into a database in Thomas's projects.

> **⚠️ Placeholder.** Sections marked *TBD* are not decided yet.
> Where one applies, do not guess: ask Thomas, then send the answer to the `Skills` agent (see `kejser-code:skill-updates`).

## What's settled

- The target database follows `kejser-code:database`: naming, keys, types, NULL rules.
- **DuckDB** holds staged and loaded analytics data.
- From Node, load with the `duckdb-access` package.
  `db.exec(script)` runs a multi-statement transform file, and `db.transaction(work)` wraps a load that must land whole.
- Transforms are SQL in `.sql` files, run as they are; they are never assembled from strings in host-language code.
- An app that reads a database an ETL job rebuilds opens it with `readOnly: true, reopenOnChange: true`.

## TBD — fill in before relying on this skill

- **Source acquisition**: how datasets are fetched (download, API, scrape), where credentials come from, rate limits.
- **Licensing and provenance**: how each source's URL, licence, version and fetch date are recorded, and how a loaded row traces back to its source.
- **Raw and staging layout**: where raw downloads live, whether they are committed, and the staging schema or file layout.
- **Load tooling**: DuckDB SQL alone (`read_csv`, `read_parquet`, `read_json`) versus Node or Python scripts, and when each applies.
- **Re-runs**: idempotent loads, full rebuild versus incremental, and how a rebuilt file replaces the live one.
- **Validation and rejected rows**: checks run after a load, where rejected rows go, and what fails the run.
- **Scheduling**: manual, cron or CI, and how failures are reported.

## Updating this skill

When a convention is decided, send it to the `Skills` agent.
It replaces the *TBD* bullet with the concrete rule and moves it into "What's settled".
