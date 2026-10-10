---
name: sveltekit
description: Conventions for writing SvelteKit (Svelte 5) code — component structure, routing, data loading, and the rule that every UX control must be a component. Use whenever creating or editing .svelte files, routes, load functions, or SvelteKit project structure.
---

# SvelteKit conventions

Apply these when writing or editing any SvelteKit code: `.svelte` files, `+page.ts` / `+page.server.ts` load functions, routes, hooks, or project layout.

## Every UX control is a component

**This is the central rule.** No raw interactive or presentational markup is written inline in a page or layout. Every UX control — anything the user sees, reads, or interacts with — lives in its own `.svelte` component under `src/lib/components/`.

This includes:

- Form controls: buttons, inputs, selects, checkboxes, radios, textareas, file pickers, toggles, sliders
- Navigation: links styled as nav items, breadcrumbs, tabs, pagination, menus
- Containers and surfaces: cards, panels, modals, drawers, accordions, tooltips, popovers
- Feedback: alerts, toasts, badges, spinners, progress bars, empty states, error states
- Data display: tables, table rows and cells, lists, list items, key-value pairs, avatars, icons

Pages (`+page.svelte`) and layouts (`+layout.svelte`) are **composition only**: they fetch nothing of their own beyond `data`, and their markup is a tree of components plus layout structure. If a page contains a bare `<button>`, `<input>`, or a hand-rolled block of markup with its own styling, that is a bug — extract it into a component.

Wrap native elements rather than using them directly:

```svelte
<!-- src/lib/components/Button.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		onclick,
		children
	}: {
		variant?: 'primary' | 'secondary' | 'danger';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	} = $props();
</script>

<button class="button button--{variant}" {type} {disabled} {onclick}>
	{@render children()}
</button>
```

Then pages use `<Button variant="danger" onclick={remove}>Delete</Button>` — never `<button class="...">`.

Why: one place to fix accessibility, one place to change behaviour, and the global stylesheets (see the `css` skill) only ever have to target the small set of elements that components emit.

## Component rules

- One component per file, PascalCase filename matching the component's purpose (`SubmitButton.svelte`, not `btn2.svelte`). Route directories are kebab-case; TypeScript modules and identifiers are camelCase.
- Emit the semantic element for the job and no more — no wrapper `<div>` unless layout needs it.
- Components live in `src/lib/components/`, grouped into subfolders by domain once a folder exceeds ~10 files.
- Props are typed with `$props()` and an inline type annotation. No `export let` — this is Svelte 5.
- Components accept content via snippets (`children`, named snippets) rather than hardcoding text.
- Components are presentation-first: they take data and callbacks as props and do not reach into stores, `$app/state`, or fetch data themselves unless that is their explicit job.
- Never add a `<style>` block to a component. Styling comes from the global stylesheets — see the `css` skill.

## Svelte 5 runes

Use runes everywhere; do not mix in Svelte 4 idioms.

- `$state()` for mutable local state
- `$derived()` / `$derived.by()` for computed values — never recompute in an effect
- `$effect()` only for genuine side effects (DOM measurement, subscriptions, logging). Reaching for `$effect` to keep two pieces of state in sync means `$derived` was the right answer.
- `$props()` for props, `$bindable()` only when two-way binding is genuinely required
- Event handlers are properties: `onclick={fn}`, not `on:click={fn}`
- Content projection uses snippets and `{@render ...}`, not `<slot>`

## Routing and data loading

- Load data in `+page.ts` / `+page.server.ts` / `+layout.server.ts`. Components never fetch on mount to populate their initial view.
- Anything touching secrets, a database, or private APIs goes in `.server.ts`.
- Mutations go through form actions in `+page.server.ts` with progressive enhancement via `use:enhance` — not hand-rolled `fetch` calls in click handlers.
- Use `error()` and `redirect()` from `@sveltejs/kit` rather than returning ad-hoc error shapes.
- Give every route an `+error.svelte` where a failure is plausible.

## TypeScript

- All scripts are `<script lang="ts">`.
- Use generated `./$types` for `PageData`, `PageServerLoad`, `Actions`, `LayoutData`.
- No `any`. If a type is genuinely unknown, use `unknown` and narrow.

## SQL

SQL lives in standalone `.sql` files (e.g. `src/lib/server/sql/`), imported with Vite's `?raw` suffix — never as template strings inlined in TypeScript. Change a query by editing its `.sql` file.

```ts
import topEngines from '$lib/server/sql/top-engines.sql?raw';
```

## Project layout

```
src/
  lib/
    components/     # every UX control
    server/         # server-only modules
    styles/         # global stylesheets (see css skill)
    *.ts            # domain logic, pure and testable
  routes/
  app.html
```

Import through the configured aliases (`#lib/...` or `$lib/...` as the project defines) rather than long relative paths.

## Accessibility

Because every control is a component, accessibility is fixed once per control: correct semantic element, label association, `aria-*` only where a native attribute won't do, visible focus, and keyboard operability. A component that renders a `<div>` with an `onclick` is wrong — it should render a `<button>`.

## Testing

Unit tests with Vitest; component tests with `vitest-browser-svelte`. Components being small and prop-driven is what makes this cheap — test the component, not the page.
