---
name: svelte-static
description: How we build static SvelteKit sites (blogs, docs, content and marketing sites) — adapter-static, every page prerendered with no client JavaScript by default, Markdown content collections (the src/content layout, front matter, links, images) rendered at build time by a ready-made markdown.ts and Prose component, build-time code highlighting, SEO metadata and sitemap, and publishing to cPanel. Use whenever creating, scaffolding or extending a static or prerendered Svelte site, adding content collections, posts, pages, tags or pagination, rendering Markdown files to HTML, or setting up SEO for one.
---

# Static Svelte sites

A static site is SvelteKit with `@sveltejs/adapter-static`: every page is rendered to HTML at build time and served as plain files.
Use it for content that changes only when the site is rebuilt: blogs, documentation, marketing and project sites.
An app that needs per-request data, logins or a database at runtime is an adapter-node app (see `kejser-web:web-stack`).

`~/source/database-doctor` is the reference implementation for the routes and the content pipeline.
Its stylesheets do not follow `kejser-web:css`; the skill wins.

## Related skills

| Skill | Covers |
|---|---|
| `kejser-web:web-stack` | Stack, tooling, scaffolding and the dev-server loop. |
| `kejser-web:sveltekit` | Components, runes, naming, no wrapper `<div>`s. |
| `kejser-web:css` | All styling: global sheets, tokens, no `<style>` blocks. |
| `kejser-web:cpanel` | Publishing the build to cPanel over FTPS. |
| `kejser-code:code-style` | Comments, errors, tests. |
| `kejser-code:markdown` | Repo docs, and the line and heading rules for content files. |
| `kejser-code:collaboration` | Shared trees, commits, credentials. |

## Scaffold

```sh
npx sv create <dir> --template minimal --types ts
npx sv add sveltekit-adapter="adapter:static" prettier eslint
npm i -D gray-matter marked marked-gfm-heading-id marked-shiki shiki @types/node
```

## Rendering

- The root `src/routes/+layout.server.ts` makes the whole site static and JavaScript-free:

  ```ts
  export const prerender = true;
  export const csr = false;
  ```

- Pages ship as HTML and CSS only.
  A page that genuinely needs interactivity sets `export const csr = true;` in its own `+page.ts`.
- `load` functions in `+page.server.ts` run at build time, so they read content from disk with `node:fs`.
- Every dynamic route (`[post]`, `[tag]`, `[page]`) exports `entries()` listing every value it renders.
- `src/routes/404/+page.svelte` is the not-found page; it prerenders to `404.html`, which the host serves for unknown paths.
  adapter-static's `fallback` is not used: without client rendering, its page is empty.

### Broken links fail the build

- A link to a missing page, a link to a missing `#anchor`, and a route nothing prerendered each fail the build.
- The prerender handlers throw with the path and the page that links to it:

  ```ts
  // vite.config.ts
  sveltekit({
  	adapter: adapter(),
  	prerender: {
  		entries: ['*', '/sitemap.xml'],
  		handleHttpError: ({ status, path, referrer, referenceType }) => {
  			throw new Error(`${status} ${path} (${referenceType} from ${referrer ?? 'entries'})`);
  		},
  		handleMissingId: ({ path, id, referrers }) => {
  			throw new Error(`${path}#${id} has no element with that id (linked from ${referrers.join(', ')})`);
  		},
  		handleUnseenRoutes: ({ routes }) => {
  			throw new Error(`routes never prerendered:\n${routes.join('\n')}`);
  		}
  	}
  })
  ```

- A handler never only logs, and never ignores a status.
  Fix the link or add the page instead.
- SvelteKit 3 reads these options from `sveltekit({...})` in `vite.config.ts`.
  SvelteKit 2 projects put the same `prerender` block under `kit` in `svelte.config.js`.

## Content

### Layout

```text
src/
  content/
    pages/                  # single pages: /about, /sources
      about.md
    posts/                  # one folder per collection: /posts/<slug>
      first-post.md
      second-post.md
  lib/
    components/
      Prose.svelte          # copied from this skill
    server/
      markdown.ts           # copied from this skill
      pages.ts              # one module per collection: its front matter schema
      posts.ts
  routes/
    [slug]/+page.server.ts  # pages/<slug>.md, or one route per page: about/+page.server.ts
    posts/[post]/+page.server.ts
static/
  img/
    cover/first-post.webp
    posts/first-post/plan.webp
```

- Content lives in `src/content/`, never in a top-level `content/`.
  Everything the build reads lives under `src/`, as in database-doctor.
- Each folder in `src/content/` is a collection, and each collection maps to one route: `posts/<slug>.md` is `/posts/<slug>`.
- Single pages (about, sources, privacy) are the collection `pages/`, mapped to `/<slug>`.
- The file name is the slug: lowercase kebab-case, or the build fails.
- There are no drafts and no `drafts/` folder; Thomas decides which articles exist, and every file in a collection is published.
- Content files follow the one-sentence-per-line and heading rules of `kejser-code:markdown`.
  Articles are prose; the bullets-over-prose rule is for repo docs.

### Front matter and titles

- Front matter holds only what the text can't, such as `date` (ISO `YYYY-MM-DD`) and `tags` on posts.
- Each collection defines its own fields in its server module, `#lib/server/<collection>.ts`.
  That module loads files with `loadMarkdown`, checks the fields, and returns typed objects.
- A missing required field, a wrong type, or a field the collection doesn't define fails the build.
- The title is always the file's one `#` heading, in every collection; an FAQ's question is its `#` heading too.
  A file with no `#` heading, or more than one, fails the build.
- The title is never in front matter: no `title`, `question` or similar field.

### Links

- Links between content files are relative `.md` paths, so they also work on GitHub and in editors: `[the plan](../posts/first-post.md#the-plan)`.
- `markdown.ts` turns them into site paths (`/posts/first-post#the-plan`).
  It fails the build on a relative link to anything but a `.md` file, or one that leaves `src/content/`.
- Links to routes that aren't content files, such as `/tags/sql`, are site paths.
- The prerender crawler then follows every link, so a missing page or `#anchor` fails the build (see [Broken links fail the build](#broken-links-fail-the-build)).

### Images

- Images used by content live in `static/img/<collection>/<slug>/`, and covers in `static/img/cover/<slug>.webp`.
- Content refers to them by site path: `![The plan](/img/posts/first-post/plan.webp)`.
- `markdown.ts` fails the build on an image path that isn't in `static/`, and on a relative image path.

### Rendering Markdown

Two files in this skill's folder do the work, copied into the project unchanged:

| File | Copy to | Does |
|---|---|---|
| [`markdown.ts`](markdown.ts) | `src/lib/server/markdown.ts` | Reads a content file, parses its front matter, renders its HTML at build time. |
| [`Prose.svelte`](Prose.svelte) | `src/lib/components/Prose.svelte` | Displays rendered HTML as `<article class="prose">`. |

```ts
// src/routes/about/+page.server.ts
import { loadMarkdown } from '#lib/server/markdown.ts';

export async function load() {
	const { title, html } = await loadMarkdown('pages/about');
	return { title, html };
}
```

```svelte
<!-- src/routes/about/+page.svelte -->
<script lang="ts">
	import Prose from '#lib/components/Prose.svelte';

	let { data } = $props();
</script>

<svelte:head><title>{data.title}</title></svelte:head>
<Prose html={data.html} />
```

- `loadMarkdown(name, options?)` reads `src/content/<name>.md` and returns `{ name, slug, frontMatter, title, html, tokens }`.
  A missing file is a 404, so a broken link fails the build naming the page that links to it.
- `listMarkdown(collection)` returns every content path in a collection, for `entries()` and index pages.
- `renderMarkdown(name, source)` renders text already in hand, such as an `import.meta.glob` `?raw` import.
- It renders with `marked`, gives headings anchor ids with `marked-gfm-heading-id`, and highlights code with Shiki through `marked-shiki`.
  One Shiki highlighter is shared by every page, and loads each language on first use.
- Code colours follow the page's `color-scheme` through `light-dark()`; `themes` picks the pair, GitHub light and dark by default.
- A fence with an unknown language, an empty body, or anything but exactly one `#` heading fails the build.
- Options cover what differs between sites:
  - `extensions`: extra `marked` extensions, such as stripping links from a summary.
  - `languages`: custom TextMate grammars, such as database-doctor's query-plan grammar.
  - `languageAliases`: fence names mapped to a language, e.g. `{ postgres: 'sql' }`.
  - `stripTitle`: leave the `#` heading out of `html` when the layout renders `title` itself.
  - `urlFor`: a different content-path-to-URL mapping.
- Derived values (summary, meta description, reading time) come from walking `tokens`, not from regexes over the text.
- `Prose` styling lives in the `kejser-web:css` sheets: flow spacing for `.prose > * + *` in `layout.css`, and prose type in `text.css`.

#### Why `Prose` doesn't convert the Markdown itself

- A Svelte component can't be server-only.
  On any page with client rendering, `marked`, Shiki and the content would ship to the browser.
- The page needs the front matter too, so its `load` function reads the file anyway.
- Checks across files, such as broken links and links between parent and child pages, need all rendered HTML in one server module.

### Lists, tags and pagination

- Sort posts newest first by `date`.
- Paginate with prerendered routes: `/posts/page/[page]`, `/tags/[tag]/page/[page]`.
- A tag's URL segment is its slug; tags that aren't URL-safe (`C#`, `C++`) map to slugs in config.
  An unmapped unsafe tag fails the build.

## Site configuration

- `src/lib/config.json` holds the public site settings: name, description, canonical `url`, posts per page, analytics IDs, social handles, tag-slug map.
- Nothing secret goes in it; it ships in the build.
- Deploy credentials live in environment variables (see `kejser-web:cpanel`).

## SEO and metadata

- Every page sets `<title>`, `<meta name="description">` and an absolute `<link rel="canonical">` built from `config.url`.
- Posts add Open Graph and Twitter card tags, `article:published_time`, `article:tag`, and a `BlogPosting` JSON-LD block.
- `src/routes/sitemap.xml/+server.ts` is prerendered and lists every canonical URL.
- `static/robots.txt` always points to the sitemap with an absolute URL:

  ```text
  User-agent: *
  Disallow:

  Sitemap: https://www.example.com/sitemap.xml
  ```

## Images and static files

- Files under `static/` are copied to the site root unchanged.
- Images are WebP.
  A `prebuild` step converts other formats with ImageMagick (`magick`).
- Content images live under `static/img/` (see [Images](#images)).
- Every `<img>` has a meaningful `alt`, or `alt=""` when decorative.

## Build

```json
"prebuild": "node scripts/convert-images.ts",
"build": "vite build && node scripts/cleanup-build.ts",
"preview": "vite preview",
"deploy": "npm run build && node --env-file-if-exists=.env scripts/deploy-cpanel.ts MYSITE"
```

- Output goes to `build/`.
- `MYSITE` stands for the site's deploy-variable prefix (see `kejser-web:cpanel`).
- `cleanup-build.ts` removes the `__data.json` files, which a site without client rendering never requests.
- adapter-static writes `/about` as `about.html`.
  Apache needs the `static/.htaccess` from `kejser-web:cpanel` to serve it at `/about`, and to serve `404.html` for unknown paths.
- Check the built site with `npm run preview` before deploying, not only with `vite dev`.

## Review checklist

1. adapter-static, with `prerender = true` and `csr = false` at the root.
2. Every dynamic route has `entries()`; the prerender handlers throw, so broken links and anchors fail the build.
3. Markdown goes through the skill's `markdown.ts`, from one server module per collection, and is shown with `Prose`; routes don't parse Markdown.
4. Code highlighting happens at build time.
5. Canonical URL, description and title on every page; sitemap complete, and `robots.txt` points to it.
6. Styling follows `kejser-web:css`.
7. No secrets in `config.json` or `static/`.
8. The site has its own favicon (see `kejser-web:web-stack`).
9. `static/.htaccess` from `kejser-web:cpanel`, carrying the server's PHP handler block, and a prerendered `404` page.
