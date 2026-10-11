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
| `web-stack` | Default stack for new web work: SvelteKit on Node, scaffolding commands, tooling, DuckDB, integration/secret handling, Firefox extensions via WXT. |
| `sveltekit` | Svelte 5 + SvelteKit conventions. Central rule: **every UX control is a component** — pages and layouts are composition only. |
| `css` | **No Tailwind, no utility classes.** Semantic element selectors, meaning-based class names, design tokens, and six global stylesheets (`tokens`, `reset`, `text`, `table`, `form`, `navigation`). |
| `deploying` | *Placeholder.* adapter-node build pipeline is settled; server specifics are marked TBD and must be filled in before use. |

### `kejser-code`

| Skill | Covers |
|---|---|
| `code-style` | Any language. Comments default to none (contract only, rationale in `docs/`), guard clauses, fail loudly, no silently-ignored input, testing and verification. |
| `cpp` | Modern C++: smart pointers, `optional`/`expected`, RAII, `const` everywhere, free functions, no `using namespace`, braces always, CLI11, vcpkg manifest mode, Makefile over raw CMake. |
| `sql-design` | Designing SQL surfaces: established statement forms, presence semantics, precise SQLSTATEs, rejecting unsupported syntax; SQL kept in `.sql` files. |
| `database` | *Partly placeholder.* SQLite for OLTP, DuckDB for analytics; singular snake_case tables; surrogate integer `<table>_id` keys, natural keys as unique indexes; display-name column named after the table; only `BIGINT`/`DOUBLE`/`DECIMAL`/`TEXT`; avoid NULL (`9999-12-31` for open-ended dates); apps run raw SQL from `.sql` files with bound parameters. Migrations and more are TBD. |
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
    skills/{web-stack,sveltekit,css,deploying}/SKILL.md
  kejser-code/
    .claude-plugin/plugin.json
    skills/{code-style,cpp,sql-design,database,collaboration}/SKILL.md
```

## Adding a skill

1. Create `plugins/<plugin>/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`).
2. Write the `description` as a trigger — it is what Claude reads to decide whether the skill is relevant, so state the situations that should invoke it.
3. Bump `version` in both `plugin.json` and `marketplace.json`.
4. Commit and push. Installed copies pick it up when the marketplace is re-pulled.

Supporting files (`scripts/`, `references/`, `assets/`) can sit alongside `SKILL.md` and are loaded on demand when the skill points at them.

## Caveat

Do not make `plugins/<plugin>/skills/` itself a symlink — plugin validation does not follow symlinks at that level and will report an error.
