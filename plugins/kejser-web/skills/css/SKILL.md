---
name: css
description: CSS conventions — semantic styling only, no Tailwind or any utility-class framework, a fixed set of global stylesheets (tokens, reset, text, table, form, navigation, layout, feedback) in cascade layers, role-named design tokens with light-dark() theming, fluid responsive layout where the page never scrolls sideways. Use whenever writing or editing CSS, styling components or pages, choosing class names, adding tokens, or setting up the styles of a new app.
---

# CSS conventions

Applies to any styling work: stylesheets, class names, component markup, tokens, or setting up styles for a new app.
`~/source/floe-ux/style/` is a working reference implementation of these rules.

## No Tailwind, no utility classes

- Never use Tailwind, UnoCSS, Windi, Tachyons, Bootstrap utilities, or any framework that styles by stacking single-purpose classes.
- Never write `.mt-4`, `.flex`, `.text-sm`, `.w-full` or anything else that names appearance.
- If a project already contains Tailwind, say so and propose removing it rather than adding to it.
- No CSS-in-JS and no preprocessors (Sass, Less, Stylus); native CSS has nesting, custom properties and `color-mix()`.
- No inline `style` attributes, except for a genuinely dynamic per-instance value such as a computed width.

## Style what the markup means

Pick selectors in this order of preference:

1. **Elements** — `button`, `table`, `nav a`, `summary`.
   Correct HTML is the styling API.
2. **Platform state** — `:disabled`, `:checked`, `:user-invalid`, `[open]`, `:hover`.
3. **ARIA state and role** — `[aria-current]`, `[aria-sort]`, `[aria-invalid]`, `[aria-busy]`, `[role="alert"]`.
   They belong in the markup for assistive technology anyway, so styling from them makes correct markup the cheap path.
4. **`data-*` naming meaning**, only where HTML and ARIA can't say it — `data-action="destructive"`, `data-tone="warn"`, never `data-color="red"`.
5. **Classes naming what a thing is** — `field-error`, `action-card`, `menu-label`.
   Use single hyphens (`.block`, `.block-element`, `.block-modifier`), never `__`.
6. **IDs** — never, for styling.

- If a component can't get the styling it needs, its HTML isn't saying what it means yet.
  Fix the markup instead of adding a hook.
- No wrapper `<div>` unless layout genuinely needs it.
- Never encode a value in a name: `.warning`, not `.red-warning`.
- Class names a third-party tool emits (e.g. highlight.js `hljs-*`) are an external contract; style them in their own sheet.
- `a` is not a link; `a:any-link` is.
  Hover, cursor and affordance rules target `a:any-link`; "where you are" rules target `[aria-current]`.
- Styling may reinforce a warning but never be the only carrier of it.
  Copying text loses its styling, so the warning goes in the text.

## Global stylesheets

- All styles live in global stylesheets.
- Never use a `<style>` block, not even for a one-off.
  Svelte's scoped CSS adds a hash class that stops global selectors matching.
- Components emit semantic markup and inherit their appearance.

| Sheet | Layer | Owns |
|---|---|---|
| `tokens.css` | `tokens` | Every raw value: palette, role colours, type, space, radii, durations, layout sizes, z-index layers. Also `@font-face`. |
| `reset.css` | `reset` | Box sizing, margin reset, media defaults, `[hidden]`, focus ring, reduced motion. |
| `text.css` | `base` | Prose: `body` type, headings, paragraphs, lists, `dl`, links, inline semantics, `code`, `kbd`, `pre`, `blockquote`, `hr`. |
| `table.css` | `base` | Tables: `thead`, sticky headers, zebra rows, sorting state, numeric cells, scrolling region. |
| `form.css` | `base` | `form`, `fieldset`, `label`, inputs, `select`, checkboxes, buttons and their `data-action` variants, validation states. |
| `navigation.css` | `base` | `nav`, menus, breadcrumbs, tabs, steps, pagination, trees, `aria-current`. |
| `layout.css` | `layout` | Page grid and landmark regions (`header`, `nav`, `aside`, `main`, `footer`), sticky banner, flow spacing, page width. |
| `feedback.css` | `components` | Status and alert callouts, `dialog`, popovers, disclosure (`details`), spinners, `progress`, `meter`, `[aria-busy]`. |

- New rules go in the sheet that owns the concern.
- Add another sheet only when something fits none of the eight, and say why.
  A syntax-highlighting theme is a typical example.
- Every sheet wraps its rules in its own `@layer`, so it behaves the same when imported alone.

### Entry point and location

- One entry file declares the layer order, then imports the sheets:

  ```css
  @layer tokens, reset, base, layout, components, overrides;

  @import url("./tokens.css");
  @import url("./reset.css");
  @import url("./text.css");
  @import url("./table.css");
  @import url("./form.css");
  @import url("./navigation.css");
  @import url("./layout.css");
  @import url("./feedback.css");
  ```

- Import it once, in the root `+layout.svelte`.
- In a single-app project the sheets live in `src/lib/styles/`, with the entry file `app.css`.
- When several apps in one repo share a design, the sheets live in a root `style/` folder.
  Each app maps it as `#style` in its `package.json` `"imports"` (`"#style/*": "../style/*"`) and imports `#style/<entry>.css`.
  Vite accepts an import target outside the package; Node doesn't, which is fine for files only Vite loads.
  SvelteKit 2 apps alias it as `$style` with `kit.alias` instead.
- `@layer` ordering replaces specificity fights; `!important` is only for reset idioms such as `[hidden]` and reduced motion.

## Tokens

- Every raw value — colour, size, space, radius, duration, font stack — lives in `tokens.css`.
  A literal anywhere else is a bug.
- A raw brand palette (`--floe-brown`, `--floe-blue`) may exist, but only `tokens.css` uses it.
  Every other sheet uses role tokens.
- Role tokens name what a colour is for: `--surface`, `--surface-raised`, `--surface-sunken`, `--text`, `--text-muted`, `--border`, `--border-strong`, `--accent`, `--on-accent`, `--danger`, `--ok`, `--warn`.
- Scales use t-shirt steps: `--size-sm` … `--size-3xl`, `--space-3xs` … `--space-3xl`, `--radius-sm/md/lg/round`, `--duration-fast/base/slow`.
- Layout sizes are tokens too: `--measure`, `--page-width`, `--page-gutter`, `--tap-target`, `--layer-sticky`.
- Media queries can't read custom properties, so breakpoints are the one literal allowed outside tokens.
  Keep them to a small set, and check the existing ones before adding a new one.

### Theming and derived colours

- `:root` sets `color-scheme: light dark`, and colour tokens use `light-dark(<light>, <dark>)`.
- `:root[data-theme="light"]` and `:root[data-theme="dark"]` force a theme by setting `color-scheme`.
- Other modes (e.g. `data-density="compact"`) redefine tokens; they never rewrite rules.
- Derive instead of enumerating: hovers, tints and borders come from `color-mix(in oklab, …)` over an existing token.
- A variant sets one custom property (`--tone`, `--fill`) that the base rule consumes; it never repeats a block.

## Layout and spacing

- Containers space their children with `> * + * { margin-block-start: var(--flow, var(--space-md)); }`.
  Children never set their own outer margins.
- Grid for two dimensions, flexbox for one, `gap` between items.
- Use logical properties throughout (`margin-inline`, `padding-block`, `inset-block-start`, `overflow-inline`), so RTL is a `dir` attribute away.
- Use native nesting, kept shallow.
  Deeper than two levels usually means the markup wants a component.
- `:where()` for zero-specificity defaults; `:is()` and `:has()` to keep selectors short.

## Responsive

Every surface works from 320px wide to widescreen.

- Go fluid first and add breakpoints last: `clamp()`, `min()` and percentages before any media query.
- **The page never scrolls horizontally.**
  Wide content (tables, code, diagrams) scrolls inside its own container.
- Write grid tracks as `minmax(0, 1fr)`, never a bare `1fr`.
- Write auto-fit grids as `repeat(auto-fit, minmax(min(24rem, 100%), 1fr))`.
- Put `overflow-wrap: anywhere` on text holding identifiers, URIs or connection strings.
  It is the wrap mode that lowers min-content, so it fixes overflow all the way up the tree.
  Prose stays on `break-word`.
- Prose stops at `--measure`, never at a pixel width.
- `--tap-target` sets the minimum height of buttons, nav links and summaries.
- Check it: at 320px, `document.documentElement.scrollWidth` must not exceed `innerWidth`, in both themes.

## Accessibility

- Never remove focus styles; use `:focus-visible` with a clearly visible outline.
- Keep WCAG AA contrast against the surface tokens, in both themes.
- Respect `prefers-reduced-motion`.
- Never convey state by colour alone; pair it with an icon, text or weight.

## No comments in stylesheets

- Stylesheets carry no comments: no section banners, no explanations.
- Reasoning worth keeping goes in a `README.md` next to the sheets.
  It describes the design as it is now (see `kejser-code:markdown`).

## Review checklist

1. No Tailwind, utility classes, `<style>` blocks or inline styles.
2. Selectors follow the preference order; class names say what a thing is.
3. No raw values outside `tokens.css`, apart from breakpoints; no palette tokens outside it.
4. Each rule sits in the sheet and layer that own its concern.
5. Logical properties only.
6. No horizontal page scroll at 320px, in either theme.
7. Focus visible, contrast adequate, motion preference respected.
8. No comments in the stylesheets.
