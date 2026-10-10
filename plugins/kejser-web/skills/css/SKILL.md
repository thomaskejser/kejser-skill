---
name: css
description: CSS conventions — semantic styling only, no Tailwind or any utility-class framework, global stylesheets (table.css, form.css, navigation.css, text.css), design tokens as custom properties, modern layout. Use whenever writing or editing CSS, styling components or pages, or choosing class names.
---

# CSS conventions

Apply these to any styling work: stylesheets, class names, component markup, or choosing how to style something new.

## No Tailwind. No utility classes. Ever.

Tailwind CSS is **not to be used**. Do not install it, do not configure it, do not add it to a build, and do not write markup in its idiom. The same ban applies to every other utility-first or atomic CSS framework — UnoCSS, Windi, Tachyons, Bootstrap's utility classes, and anything that works by stacking single-purpose classes on an element.

If asked to style something, the answer is never a string of utility classes. If a project already contains Tailwind, say so and propose removing it rather than adding to it.

Also avoid: CSS-in-JS, inline `style` attributes for anything but genuinely dynamic per-instance values (a computed width, a progress percentage), and preprocessors (Sass, Less, Stylus) — modern CSS has nesting, variables, and `color-mix()` natively.

## Semantic styling only

Style meaning, not appearance.

- Target semantic HTML elements directly wherever possible: `table`, `th`, `td`, `form`, `label`, `input`, `nav`, `a`, `h1`–`h6`, `p`, `blockquote`, `figure`. Well-structured markup should look correct with almost no classes at all.
- When a class is needed, name it for what the thing **is**, never for what it looks like.
  - Good: `.card`, `.card__title`, `.card--featured`, `.nav-link`, `.field-error`, `.data-table`, `.site-footer`
  - Forbidden: `.mt-4`, `.text-red`, `.flex-row`, `.w-full`, `.bold`, `.big-blue-button`, `.col-6`
- BEM-ish structure: `.block`, `.block__element`, `.block--modifier`. Keep it shallow; nesting beyond two levels usually means the markup needs a component, not a longer selector.
- Never encode a value in a name. A class called `.red-warning` breaks the moment warnings turn amber; `.warning` does not.

## Global stylesheets

Styles live in global stylesheets embedded on every page — **not** in per-component `<style>` blocks. Components emit semantic markup and inherit their appearance from these sheets.

The sheets, under `src/lib/styles/`:

| File | Owns |
|---|---|
| `tokens.css` | design tokens as custom properties on `:root` |
| `reset.css` | the base reset / normalization |
| `text.css` | written text: headings, paragraphs, lists, links in prose, emphasis, code, blockquotes, measure and rhythm |
| `table.css` | tables: `table`, `thead`, `tbody`, `th`, `td`, zebra striping, alignment, captions, responsive overflow |
| `form.css` | forms and controls: `form`, `fieldset`, `legend`, `label`, `input`, `select`, `textarea`, `button`, validation and error states, focus rings |
| `navigation.css` | navigation: `nav`, nav links, menus, breadcrumbs, tabs, pagination, active and current states |

Import order matters — tokens, reset, then the rest:

```css
/* src/lib/styles/app.css */
@import './tokens.css';
@import './reset.css';
@import './text.css';
@import './table.css';
@import './form.css';
@import './navigation.css';
```

Import `app.css` once in the root layout so it applies to every page.

New styling belongs in whichever of these sheets owns that concern. Only create an additional sheet when something genuinely falls outside all six — and say why when you do.

## Design tokens

Every colour, space, size, radius, and duration is a custom property defined on `:root` in `tokens.css`. No raw hex values, pixel spacing, or font stacks scattered through the other sheets.

```css
:root {
	/* colour — semantic names, not colour names */
	--color-surface: #ffffff;
	--color-surface-raised: #f7f7f8;
	--color-text: #16161a;
	--color-text-muted: #5c5c66;
	--color-border: #d8d8de;
	--color-accent: #2f5fd8;
	--color-danger: #c0392b;

	/* space — one scale, used everywhere */
	--space-2xs: 0.25rem;
	--space-xs: 0.5rem;
	--space-s: 0.75rem;
	--space-m: 1rem;
	--space-l: 1.5rem;
	--space-xl: 2.5rem;

	/* type */
	--font-body: system-ui, sans-serif;
	--font-mono: ui-monospace, monospace;
	--size-step-0: 1rem;
	--size-step-1: 1.25rem;
	--size-step-2: 1.6rem;
	--line-height: 1.5;
	--measure: 65ch;

	--radius: 0.375rem;
	--transition: 150ms ease;
}
```

Token names describe role (`--color-danger`), not appearance (`--color-red`). Theming — dark mode, high contrast — is a matter of redefining tokens under a media query or `[data-theme]`, never of rewriting rules.

## Modern CSS

- **Layout**: Grid for two-dimensional layout, Flexbox for one-dimensional. No float hacks, no grid frameworks, no `.col-*` classes.
- **Logical properties**: `margin-inline`, `padding-block`, `inset-inline-start`, `border-inline-end` — not `margin-left` / `padding-top`. Keeps layouts correct in any writing direction.
- **Container queries** (`@container`) for components that adapt to their own space; media queries only for genuinely page-level changes.
- **Native nesting** for state and descendants, kept shallow:

```css
.card {
	display: grid;
	gap: var(--space-s);
	padding: var(--space-m);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	background: var(--color-surface-raised);

	& .card__title {
		font-size: var(--size-step-1);
	}

	&:focus-within {
		outline: 2px solid var(--color-accent);
	}
}
```

- `clamp()` for fluid type and spacing; `min()` / `max()` instead of breakpoint-switched widths.
- `color-mix()` and relative colour syntax to derive hover and muted variants from a token instead of defining new ones.
- `:is()`, `:where()`, `:has()` to keep selectors short — `:where()` for zero-specificity defaults.
- `@layer` (`reset, base, components, overrides`) so specificity never needs fighting with `!important`.
- `gap` for spacing between items rather than margins on children.

## Accessibility

- Never remove focus styles. Use `:focus-visible` with a clearly visible outline.
- Maintain WCAG AA contrast against the surface tokens.
- Respect `prefers-reduced-motion` — wrap transitions and animations.
- Do not convey state by colour alone; pair it with an icon, text, or weight.
- Keep tap targets at least 44×44px.

## Review checklist

Before finishing any styling work:

1. No Tailwind or utility classes anywhere.
2. Every class name describes what the element is, not how it looks.
3. No hardcoded colours, spacing, or font stacks — tokens only.
4. The rule landed in the correct global sheet; no component `<style>` blocks.
5. Logical properties, not physical ones.
6. Focus visible, contrast adequate, motion preference respected.
