---
name: database
description: Conventions for databases used by applications — engine choice, schema and naming, keys, types, migrations, and how queries live in code. PLACEHOLDER: most conventions are not yet filled in. Use whenever creating or changing a database schema, writing a migration, choosing a database engine, or modelling tables for an application or warehouse.
---

# Database conventions

How databases are chosen, modelled and evolved in Thomas's projects. For designing SQL syntax inside a database engine, see `kejser-code:sql-design`.

> **⚠️ Placeholder.** Sections marked *TBD* are not decided yet. Where one applies, do not guess — ask, then record the answer here.

## What's settled

- **DuckDB** is the default for local analytics, staging and reporting data.
- SQL lives in standalone `.sql` files, not built from strings in host-language code.
- Omitted, empty, zero, `NULL` and `DEFAULT` are distinct; schemas and code keep them distinguishable.

## TBD — fill in before relying on this skill

- **OLTP engine** — the default for transactional application data (PostgreSQL? SQLite? Lakebase?)
- **Naming** — table names singular or plural; casing; key and foreign-key column names; schema/namespace layout
- **Keys** — surrogate vs natural keys; integer identity vs UUID/ULID
- **Types** — timestamps and time zones, money/decimals, text lengths, enums vs lookup tables, JSON columns
- **Nullability and constraints** — `NOT NULL` by default? Check constraints, foreign keys enforced or not
- **Warehouse modelling** — staging/`dw` layering, star schema vs wide tables, naming of facts and dimensions
- **Migrations** — tool, file naming, forward-only or reversible, where they run relative to the app deploy
- **Query access from apps** — raw SQL files vs a query builder vs an ORM; connection handling
- **Indexing and performance** — when to index, how to verify a plan
- **Test data** — fixtures, seeding, synthetic data

## Updating this skill

When a convention is decided, replace its *TBD* bullet with the concrete rule and move it into "What's settled".
