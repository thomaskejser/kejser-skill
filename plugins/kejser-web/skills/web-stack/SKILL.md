---
name: web-stack
description: Thomas's default web stack and project setup — SvelteKit on Node, scaffolding commands, tooling, DuckDB for analytics data, third-party integration and secret handling, browser extensions. Load before scaffolding a new web app or site, choosing a framework or library, adding an integration with an external service, or building a browser extension.
---

# Web stack

The defaults for any new web app or site. Code and styling conventions live in the sibling skills: `kejser-web:sveltekit` (every UX control is a component) and `kejser-web:css` (semantic global stylesheets and tokens, no Tailwind, no `<style>`).

## Framework

**SvelteKit on Node.js**, Svelte 5 runes, TypeScript throughout.

```sh
npx sv create <dir> --template minimal --types ts
npx sv add sveltekit-adapter="adapter:node" prettier eslint vitest
```

Use `@sveltejs/adapter-node` — we deploy to our own servers (see `kejser-web:deploying`).

Do not pick React, Vue/Nuxt, Next, or a static-site generator for new work unless asked. An existing project on another framework stays on it; follow its conventions rather than migrating.

## Tooling

- npm as package manager; commit the lockfile.
- Prettier + ESLint, plus `svelte-check`. All three must pass.
- Vitest for unit and component tests (browser mode via Playwright, `vitest-browser-svelte`).

## Data

- **DuckDB** is the default for analytics and reporting data — staged files, a local warehouse, read-mostly query backends.
- SQL lives in `.sql` files, not inlined in TypeScript (see `kejser-web:sveltekit`).

## Third-party integrations

- Never store passwords for external services. Connect them via OAuth (or another delegated login that yields a token), keep only the token, encrypted at rest.
- When a service has no OAuth (e.g. FTP), the secret comes from an environment variable whose *name* the user chooses in the UI. Store only the variable name, show only whether it is set, and refuse names of the app's own secrets.
- Provide an integrations page where the user adds, reconnects and disconnects services and can see which are currently authenticated (and when tokens expire).

## Browser extensions

Target Firefox (Manifest V3), built with WXT.

## Recording new preferences

These preferences are maintained in the `kejser-skill` repo. When Thomas states a new web preference, send it to the `Skills` agent (see `kejser-code:skill-updates`) — don't edit the skill yourself, and don't record it in a project's own files.
