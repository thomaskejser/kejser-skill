---
name: database
description: Conventions for databases used by applications — engine choice, schema and naming, keys, types, migrations, and how queries live in code. PARTLY PLACEHOLDER: engines, naming, types and NULL rules are settled; the rest is TBD. Use whenever creating or changing a database schema, writing a migration, choosing a database engine, or modelling tables for an application or warehouse.
---

# Database conventions

How databases are chosen, modelled and evolved in Thomas's projects. For designing SQL syntax inside a database engine, see `kejser-code:sql-design`.

> **⚠️ Partly placeholder.** Sections marked *TBD* are not decided yet. Where one applies, do not guess — ask, then record the answer here.

## What's settled

### Engines

- **SQLite** is the default for transactional application data.
- **DuckDB** is the default for local analytics, staging and reporting data.

### Naming

- Table names are **singular**, lowercase, words joined by underscores: `customer`, `order_line`, not `Customers` or `orderLines`.
- ID columns are named **`<table>_id`** — the primary key of `customer` is `customer_id`, and a column referencing it elsewhere is also `customer_id`. Never a bare `id`.

### Types

Use only these:

| Kind | Type |
|---|---|
| Whole numbers | `BIGINT` — never `INT`, `INTEGER`, `SMALLINT`, `TINYINT` or similar |
| Floating point | `DOUBLE` — never `FLOAT` or `REAL` |
| Exact numbers (money, quantities with fixed scale) | `DECIMAL` |
| Text | `TEXT` — never `VARCHAR(n)`, `CHAR(n)` or any length-limited string type |

### NULL and defaults

- **Avoid `NULL`.** Columns are `NOT NULL` with a sensible `DEFAULT` unless the absence of a value genuinely means something different from every possible default.
- A date meaning "infinitely into the future" (e.g. `valid_to` on a current row) is **`9999-12-31`**, never `NULL`.
- Where `NULL` is allowed, it must stay distinguishable from empty, zero and the default — in the schema and in the code that reads it.

### Example

```sql
CREATE TABLE customer (
    customer_id BIGINT  NOT NULL PRIMARY KEY,
    name        TEXT    NOT NULL DEFAULT '',
    credit      DECIMAL NOT NULL DEFAULT 0,
    valid_from  DATE    NOT NULL DEFAULT CURRENT_DATE,
    valid_to    DATE    NOT NULL DEFAULT '9999-12-31'
);
```

### Query access from apps

Apps always execute **raw SQL read from `.sql` files** — no ORM, no query builder, no SQL assembled from strings in host-language code. To change a query, edit its `.sql` file.

A file may contain parameters that are filled in at execution time. Use named placeholders (`:customer_id`) and bind values through the driver; never splice values into the SQL text.

```sql
-- customer-by-id.sql
SELECT customer_id, name, credit
FROM customer
WHERE customer_id = :customer_id
  AND valid_to = '9999-12-31';
```

## TBD — fill in before relying on this skill

- **Naming** — column names beyond IDs; schema/namespace layout
- **Keys** — surrogate vs natural keys; how `<table>_id` values are generated (see the SQLite caveat below); UUID/ULID ever?
- **Types** — timestamps and time zones; booleans; enums vs lookup tables; JSON columns
- **Constraints** — check constraints; foreign keys enforced or not (SQLite needs `PRAGMA foreign_keys = ON` per connection)
- **Warehouse modelling** — staging/`dw` layering, star schema vs wide tables, naming of facts and dimensions
- **Migrations** — tool, file naming, forward-only or reversible, where they run relative to the app deploy
- **Connection handling** — pooling, pragmas set per connection, transactions
- **Indexing and performance** — when to index, how to verify a plan
- **Test data** — fixtures, seeding, synthetic data

## SQLite caveats for these type rules

SQLite maps declared types to storage affinities, so the type list above behaves differently there:

- `BIGINT PRIMARY KEY` is **not** an alias for the rowid — only the exact spelling `INTEGER PRIMARY KEY` is. A `BIGINT` key does not auto-assign values; the application must supply them.
- `DECIMAL` gets NUMERIC affinity and is stored as an integer or 8-byte float — it is **not** exact. Exact money needs integer minor units or `TEXT`.
- `STRICT` tables accept only `INT`, `INTEGER`, `REAL`, `TEXT`, `BLOB`, `ANY` — the type list above cannot be used in a `STRICT` table.

## Updating this skill

When a convention is decided, replace its *TBD* bullet with the concrete rule and move it into "What's settled".
