# kejser-skill

Personal Claude Code plugin marketplace — coding conventions as installable skills.

## Install

```
/plugin marketplace add thomaskejser/kejser-skill
/plugin install kejser-web@kejser-skill
```

Pin to a tag or branch if you want reproducible behaviour across machines:

```
/plugin marketplace add thomaskejser/kejser-skill#v0.1.0
```

## Contents

### `kejser-web`

| Skill | Covers |
|---|---|
| `sveltekit` | Svelte 5 + SvelteKit conventions. Central rule: **every UX control is a component** — pages and layouts are composition only. |
| `css` | **No Tailwind, no utility classes.** Semantic element selectors, meaning-based class names, design tokens, and six global stylesheets (`tokens`, `reset`, `text`, `table`, `form`, `navigation`). |
| `deploying` | *Placeholder.* adapter-node build pipeline is settled; server specifics are marked TBD and must be filled in before use. |

Once installed, skills are referenced as `/kejser-web:sveltekit`, `/kejser-web:css`, `/kejser-web:deploying`.

## Layout

```
.claude-plugin/
  marketplace.json          # marketplace manifest — lists plugins
plugins/
  kejser-web/
    .claude-plugin/
      plugin.json           # plugin manifest
    skills/
      sveltekit/SKILL.md
      css/SKILL.md
      deploying/SKILL.md
```

## Adding a skill

1. Create `plugins/<plugin>/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`).
2. Write the `description` as a trigger — it is what Claude reads to decide whether the skill is relevant, so state the situations that should invoke it.
3. Bump `version` in both `plugin.json` and `marketplace.json`.
4. Commit and push. Installed copies pick it up when the marketplace is re-pulled.

Supporting files (`scripts/`, `references/`, `assets/`) can sit alongside `SKILL.md` and are loaded on demand when the skill points at them.

## Caveat

Do not make `plugins/<plugin>/skills/` itself a symlink — plugin validation does not follow symlinks at that level and will report an error.
