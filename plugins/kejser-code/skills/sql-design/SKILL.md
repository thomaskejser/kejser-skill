---
name: sql-design
description: How Thomas designs SQL surfaces and writes SQL — established statement forms, presence semantics, precise SQLSTATEs, rejecting unsupported syntax, SQL kept in .sql files. Use when designing SQL syntax or utility statements for a database engine, mapping an API onto SQL, writing SQL-facing error handling, or deciding where SQL text lives in an application.
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

## Tests

Cover each statement's success, every clause and modifier, absence, conflict, and downstream failure — plus rejection cases proving out-of-scope syntax fails.

## SQL in applications

SQL text lives in standalone `.sql` files, loaded or imported by the application — not built from strings inlined in host-language code. To change a query, edit its `.sql` file.

DuckDB is the default engine for local analytics, staging and reporting.
