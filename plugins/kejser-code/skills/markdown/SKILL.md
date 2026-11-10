---
name: markdown
description: How Thomas wants Markdown files written — one sentence per line, tables padded so the source reads as a grid, intent stated in bullets rather than long prose, a single top-level # header, uppercase file names with a lowercase .md extension, and describing the current state rather than history. Use whenever creating or editing any .md file, including README.md, CLAUDE.md, AGENTS.md, SKILL.md and docs/.
---

# Markdown files

Applies to every `.md` file written or edited: READMEs, `CLAUDE.md`/`AGENTS.md`, `SKILL.md`, and anything under `docs/`.
It governs files, not chat replies.

## One sentence per line

- Every sentence starts on a new line.
- A paragraph is consecutive lines; a blank line separates paragraphs.
- Rendered output is unchanged, since Markdown joins adjacent lines into one paragraph.
- Diffs then show exactly which sentence changed.
- In a list item, a second sentence goes on its own line, indented to align with the item's text:

  ```markdown
  - Primary keys are surrogate integers.
    The database generates them where it can.
  ```

- Never hard-wrap a sentence at a fixed column.
- Code blocks, tables and front matter are exempt.

## Tables look like tables

- Pad every cell so the pipes line up in each column, and the raw `.md` reads as a grid.
- The separator row spans each column's full width; alignment markers stay at the ends: `| ------: |`.
- One space between each pipe and the cell text, as Prettier formats it.
- Numbers go in right-aligned columns, padded on the left so their digits line up.

  ```markdown
  | Engine | Default for        | Rows |
  | ------ | ------------------ | ---: |
  | SQLite | Application data   |   12 |
  | DuckDB | Analytics, staging |  340 |
  ```

- After editing a table, re-pad the whole table, not just the changed row.

## Bullets over prose

- State intent in bullets: what the thing is for, what to do, what not to do.
- Each bullet carries one point.
- Lead with the claim; follow with the reason only when it isn't obvious.
- Prose is for short context — one to three sentences under a heading, not paragraphs.
- Prefer a table when bullets would repeat the same attributes for several items.

## Present tense, current state

- A Markdown file describes what the code does now, not how it got there.
- No changelog sections, "previously…", "now uses…", or dated update notes.
- When the code changes, rewrite the affected text instead of appending to it.
- History lives in git (see `kejser-code:code-style`).

## File names

- Name Markdown files in uppercase with a lowercase `.md` extension: `README.md`, `DESIGN.md`, `SOURCES.md`.
- Separate words with underscores: `DEAD_ENDS.md`.
- Never `Sources.md` or `sources.md`.
- Exception: content files a site renders as pages keep lowercase names, because the file name is the URL slug (see `kejser-web:svelte-static`).

## Headings

- Exactly one `#` heading, at the top, as the document's title.
- Sections use `##`, subsections `###`.
  Don't skip levels.
- In a file with YAML front matter, the `#` title comes right after it.
