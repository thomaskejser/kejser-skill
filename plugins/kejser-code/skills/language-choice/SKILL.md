---
name: language-choice
description: Which language and framework to use for each kind of work in Thomas's projects — Rust for self-contained binaries, TypeScript and SvelteKit for the web, SQL for all database logic (stored procedures only to cut round trips or for complex transactions), Python only for instrumentation and ETL glue, ETL as Python scripts running SQL in DuckDB. Never an ORM; never dbt, Airflow or any other ETL tool. Use whenever starting a project, tool, script or component, choosing a language, framework or library for it, adding a data access layer, or building a data pipeline.
---

# Language choice

Which language and framework each kind of work uses.
Each row's skill holds the conventions for that language.

## By kind of work

| Work | Use | Skill |
|---|---|---|
| A program shipped as one self-contained binary: CLI tools, agents, services | Rust | `kejser-code:rust` |
| Web apps | TypeScript, SvelteKit on Node | `kejser-web:web-stack`, `kejser-web:sveltekit` |
| Static sites | TypeScript, SvelteKit with adapter-static | `kejser-web:svelte-static` |
| Database logic: queries, transformations, business rules over data | SQL | `kejser-code:database`, `kejser-code:sql-design` |
| ETL | Python scripts running SQL, with DuckDB as the engine | `kejser-code:etl` |
| Instrumentation: measuring, benchmark harnesses, collecting and reporting metrics | Python | — |
| Code inside a C++ system, such as a DuckDB extension | C++ | `kejser-code:cpp` |

- A repo that already exists keeps its languages; don't rewrite working code in another language to match this table.

## Rust for self-contained binaries

- Anything that ships as an executable for people or machines to run is written in Rust and built fully self-contained (see `kejser-code:rust`).
- Not Python, Node or Go packaged into an executable.

## SQL for database logic

- Logic over data lives in SQL whenever SQL can express it, not in host-language loops over fetched rows.
- SQL lives in `.sql` files, run as they are, with bound parameters (see `kejser-code:database`).
- Stored procedures are used only where they:
  - cut round trips between the app and the database, or
  - handle a complex transaction that must run as one unit inside the database.
- Otherwise the app runs plain SQL statements from its `.sql` files.

### No ORM, ever

- Never an ORM, in any language: no Prisma, Drizzle, TypeORM, Sequelize, SQLAlchemy ORM, Django ORM, Diesel, SeaORM, Entity Framework, Hibernate.
- No query builder that generates SQL from host-language calls either (Kysely, Knex, SQLAlchemy Core): the database skill requires raw SQL from `.sql` files.
- No exception for prototypes or small projects.

## Python: instrumentation and glue only

Python is allowed for:
- instrumentation: measuring, benchmark harnesses, collecting and reporting metrics;
- ETL glue: fetching files and APIs, calling SQL, moving files, logging.

Python never transforms data.
- No pandas, Polars or plain Python loops reshaping, joining, filtering, aggregating or cleaning data.
- That work is SQL, run in DuckDB.
- Python may pass data through untouched, e.g. writing a downloaded file to staging for DuckDB to read.

## ETL

- ETL is Python scripts that run `.sql` files in DuckDB (see `kejser-code:etl`).
- DuckDB does the reading, transforming and writing; Python decides what runs, in what order, and with which parameters.
- Never dbt, Airflow, Dagster, Prefect, Luigi, Mage, Meltano, Airbyte, Fivetran, SSIS, Spark or any other ETL or orchestration tool or framework.

## Updating this skill

Changes go through the `Skills` agent (see `kejser-code:skill-updates`).
