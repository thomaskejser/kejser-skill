# kejser-skill

Personal Claude Code plugin marketplace — coding conventions as installable skills.

## Install

The two clients install this differently — `/plugin` is a CLI command and does not exist in Cowork.

### Cowork (desktop app)

Customize → Plugins → Add → Add marketplace → `thomaskejser/kejser-skill`, then install `kejser-web` and `kejser-code` from the marketplace listing. A restart may be needed before the skills register.

### Claude Code (CLI)

```
/plugin marketplace add thomaskejser/kejser-skill
/plugin install kejser-web@kejser-skill
/plugin install kejser-code@kejser-skill
```

Pin to a tag or branch for reproducible behaviour across machines:

```
/plugin marketplace add thomaskejser/kejser-skill#v0.1.0
```

### Note on `~/.claude/skills/`

Claude Code reads skills from `~/.claude/skills/` and `.claude/skills/`; Cowork does **not** — it only loads skills from installed plugins and account-level storage. Distributing through this marketplace is what makes the same skills work in both.

## Contents

### `kejser-web`

| Skill | Covers |
|---|---|
| `web-stack` | Default stack for new web work: SvelteKit on Node, scaffolding commands, tooling, dev loop (restart after every edit, report the localhost URL), DuckDB, integration/secret handling, Firefox extensions via WXT. |
| `sveltekit` | Svelte 5 + SvelteKit conventions. Central rule: **every UX control is a component** — pages and layouts are composition only. |
| `css` | **No Tailwind, no utility classes.** Selectors by meaning (elements, state, ARIA, `data-*`, semantic classes); eight global sheets in cascade layers (`tokens`, `reset`, `text`, `table`, `form`, `navigation`, `layout`, `feedback`); role tokens with `light-dark()`; the page never scrolls sideways. |
| `deploying` | *Placeholder.* adapter-node build pipeline is settled; server specifics are marked TBD and must be filled in before use. |
| `svelte-static` | Static SvelteKit sites: adapter-static, no client JavaScript, broken links fail the build, `src/content` collections rendered by a shared `markdown.ts` and `Prose.svelte`, SEO, sitemap and `robots.txt`. |
| `cpanel` | Publishing a static build to cPanel over FTPS with `deploy-cpanel.ts`, `<PREFIX>_FTP_*` variables, and the `.htaccess` every site ships. |
| `social-logos` | SVG logos for 24 social platforms, with a `SocialLogo` Svelte component, brand colours, sources and licences. |

### `kejser-code`

| Skill | Covers |
|---|---|
| `language-choice` | Which language for which work: Rust for self-contained binaries, TypeScript/SvelteKit for the web, SQL for database logic (stored procedures only to cut round trips or for complex transactions), Python only for instrumentation and ETL glue, ETL as Python running SQL in DuckDB. Never an ORM; never dbt, Airflow or other ETL tools. |
| `code-style` | Any language. Comments default to none (contract only, rationale in `docs/`), guard clauses, fail loudly, no silently-ignored input, testing and verification. |
| `cpp` | Modern C++: smart pointers, `optional`/`expected`, RAII, `const` everywhere, free functions, no `using namespace`, braces always, CLI11, vcpkg manifest mode, Makefile over raw CMake. |
| `rust` | *Placeholder.* Fully self-contained binaries (musl on Linux, static CRT on Windows, bundled C libraries, rustls, assets compiled in); Windows APIs only through Microsoft's `windows` or `windows-sys` crates. The rest is TBD. |
| `sql-design` | Designing SQL surfaces: established statement forms, presence semantics, precise SQLSTATEs, rejecting unsupported syntax; SQL kept in `.sql` files. |
| `etl` | *Placeholder.* Python scripts running `.sql` files in DuckDB, no ETL tools, are settled; acquisition, provenance, staging and re-runs are TBD. |
| `database` | *Partly placeholder.* SQLite for OLTP, DuckDB for analytics; singular snake_case tables; surrogate integer `<table>_id` keys, natural keys as unique indexes; display-name column named after the table; only `BIGINT`/`DOUBLE`/`DECIMAL`/`TEXT`; avoid NULL (`9999-12-31` for open-ended dates); apps run raw SQL from `.sql` files with bound parameters. Migrations and more are TBD. |
| `markdown` | Every `.md` file: one sentence per line, intent in bullets rather than prose, a single `#` title. |
| `skill-updates` | Only the running session named `Skills` changes this repo; other agents message it, or ask Thomas to start it. |
| `collaboration` | Explicit-path staging, one author per commit with session trailers, shared trees and dev servers, honest reporting, credential and production safety. |

Once installed, skills are referenced as `/<plugin>:<skill>`, e.g. `/kejser-web:css`, `/kejser-code:cpp`.

## What stays out of this repo

- **Repo-specific workflows** (dbprove `/prove` `/publish`, iceberg-bench `/bench`, sql-arena `refresh-data`) stay in their own repos — they hardcode that checkout's paths.
- **FLOE brand** stays in the `floe-brand` package: it is unlicensed company material with licensed fonts, and this repo is public.
- **Repo facts** (build commands, architecture) stay in each repo's `CLAUDE.md`/`AGENTS.md`. A repo's own file wins where it is stricter than these skills.

## Layout

```
.claude-plugin/
  marketplace.json          # marketplace manifest — lists plugins
plugins/
  kejser-web/
    .claude-plugin/plugin.json
    skills/{web-stack,sveltekit,css,deploying,svelte-static,cpanel,social-logos}/
  kejser-code/
    .claude-plugin/plugin.json
    skills/{language-choice,code-style,cpp,rust,sql-design,database,etl,markdown,skill-updates,collaboration}/SKILL.md
```

## Adding a skill

Only the agent session named `Skills` changes this repo — see `kejser-code:skill-updates`.

1. Create `plugins/<plugin>/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`).
2. Write the `description` as a trigger — it is what Claude reads to decide whether the skill is relevant, so state the situations that should invoke it.
3. Bump `version` in both `plugin.json` and `marketplace.json`.
4. Commit and push. Installed copies pick it up when the marketplace is re-pulled.

Supporting files (`scripts/`, `references/`, `assets/`) can sit alongside `SKILL.md` and are loaded on demand when the skill points at them.

## Caveat

Do not make `plugins/<plugin>/skills/` itself a symlink — plugin validation does not follow symlinks at that level and will report an error.
