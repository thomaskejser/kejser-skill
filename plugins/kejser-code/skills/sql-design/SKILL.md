---
name: sql-design
description: How Thomas designs SQL surfaces and writes SQL — established statement forms, presence semantics, precise SQLSTATEs, rejecting unsupported syntax, naming of system views and catalog columns (singular views, _log history views, identity columns named after the object, <object>_id keys, created_time and altered_time as timestamptz, UPPERCASE enum values), SQL kept in .sql files. Use when designing SQL syntax, utility statements, system views or catalog tables for a database engine, mapping an API onto SQL, writing SQL-facing error handling, or deciding where SQL text lives in an application.
---

# SQL design

## Designing statements

- Use the **established forms**: `CREATE`, `ALTER`, `DROP`, `SHOW`, `DESCRIBE`, `USE`. Design the SQL a user expects — don't mirror a client library's or RPC's shape, and don't map one RPC to one statement.
- **Preserve presence semantics.** Omitted, empty, zero, `NULL` and `DEFAULT` are different things and must stay distinguishable from parser to handler.
- **Never accept syntax a handler later ignores.** Out-of-scope clauses are rejected by the grammar, with a clear error.
- One form, one code path. If two spellings mean the same thing, they share an implementation.
- Confirm semantics in the service implementation, not just in the proto or client — they drift.

## Errors and results

- Raise precise SQLSTATEs, not a generic catch-all.
- Hide internal fields (ids, versions, implementation flags) from result rows.

## System views and catalogs

How a database engine names the views and columns it exposes about itself.

### Views

- A view is named with a singular noun for the kind of object it has one row per: `table`, `query`, `session`.
- A live view's historical counterpart has the suffix `_log`: `query` holds current and in-progress state, `query_log` holds completed history.
  - A suffix, not a `log_` prefix, so the two sort together.
  - A `_log` view describes the same object, so it has the same key.

### The identity column

- Named after the object, never a generic `name` or `id`.
- An object addressed by a user-chosen name: the column is the bare object name, with no `_name` suffix.
  The name of a `catalog_overlay` is in the column `catalog_overlay`.
- An object addressed by a generated id keeps `_id`: `query_id`, `session_id`.
  Here the id is the object itself, not a suffix on a name.

### Keys

- The primary key is `<object>_id`.
- An object whose id is unique only within its parent is keyed on the parent's key plus its own: `(table_id, column_id)`.
  The parent's key is still a foreign key to the parent.
- A foreign key has exactly the same name and type as the key it points at, so `JOIN … USING (account_id)` works.
  The name is the reference: `account_id` in any view means `account.account_id`.
- Several columns pointing at the same object are told apart by a `_<purpose>` suffix on the foreign key's name.
- A column that looks like a key but isn't one is the exception, and is marked as such where the view is defined.

### Timestamps

- All timestamps are `timestamptz`.
- `created_time` is when the object was created.
- `altered_time` is when it was last altered, and `NULL` if it never was.
- Every view has both by default.
  Append-only logs, whose rows are never altered, leave them out.

### Enum-style values

- Columns holding enum-style values are `text`, and the values are UPPERCASE: `ICEBERG_REST`.

### Standard views

- `information_schema` views follow the ANSI/ISO standard's own names and lowercase column casing, not these rules.

## Tests

Cover each statement's success, every clause and modifier, absence, conflict, and downstream failure — plus rejection cases proving out-of-scope syntax fails.

## SQL in applications

SQL text lives in standalone `.sql` files, loaded or imported by the application — not built from strings inlined in host-language code. To change a query, edit its `.sql` file.

DuckDB is the default engine for local analytics, staging and reporting.
