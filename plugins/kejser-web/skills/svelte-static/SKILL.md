---
name: svelte-static
description: How we build static SvelteKit sites (blogs, docs, content and marketing sites) — adapter-static, every page prerendered with no client JavaScript by default, Markdown content collections rendered at build time, build-time code highlighting, SEO metadata and sitemap, and publishing to cPanel. Use whenever creating, scaffolding or extending a static or prerendered Svelte site, adding content collections, posts, pages, tags or pagination, or setting up SEO for one.
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
npm i gray-matter marked marked-gfm-heading-id marked-shiki shiki
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
- `svelte.config.js` sets `kit.prerender.entries: ['*', '/sitemap.xml']`.
- A broken internal link or an unrendered route fails the build.
  Never override `handleHttpError` or `handleUnseenRoutes` to log instead of throw.

## Content collections

- Content lives in `src/content/<collection>/<slug>.md`, e.g. `src/content/posts/` and `src/content/pages/`.
- The file name is the slug, and the URL is `/<collection>/<slug>`.
- Front matter holds only what the text can't: `date` (ISO `YYYY-MM-DD`) and `tags`.
- The title is the file's single `#` heading; it is never repeated in front matter.
- Content files follow the one-sentence-per-line and heading rules of `kejser-code:markdown`.
  Articles are prose; the bullets-over-prose rule is for repo docs.
- Links between content files are written as relative `.md` paths, so they also work on GitHub.
  The renderer strips the `.md` extension.
- One server-only module (`$lib/server/content.ts`) reads, parses and sorts a collection.
  Routes call it; they never parse Markdown themselves.

### Rendering Markdown

- Parse front matter with `gray-matter` and render with `marked`.
- `marked-gfm-heading-id` gives headings stable anchor ids.
- Highlight code at build time with `shiki` through `marked-shiki`.
  No highlighter ships to the browser.
- Create the shiki highlighter once and reuse it across pages.
- Derived values (summary, meta description, reading time) come from walking the `marked` token tree, not from regexes over the text.
- Render the HTML with `{@html}` inside an `<article>`.
  The content is ours and built at build time, so it is trusted.

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
- `static/robots.txt` allows crawling and points to the sitemap.

## Images and static files

- Files under `static/` are copied to the site root unchanged.
- Images are WebP.
  A `prebuild` step converts other formats with ImageMagick (`magick`).
- Cover images live at `static/img/cover/<slug>.webp`.
- Every `<img>` has a meaningful `alt`, or `alt=""` when decorative.

## Build

```json
"prebuild": "node scripts/convert-images.ts",
"build": "vite build && node scripts/cleanup-build.ts",
"preview": "vite preview",
"deploy": "npm run build && node --env-file-if-exists=.env scripts/deploy-cpanel.ts"
```

- Output goes to `build/`.
- `cleanup-build.ts` removes the `__data.json` files, which a site without client rendering never requests.
- adapter-static writes `/about` as `about.html`.
  The host must serve extensionless URLs from `.html` files; cPanel's Apache does.
- Check the built site with `npm run preview` before deploying, not only with `vite dev`.

## Review checklist

1. adapter-static, with `prerender = true` and `csr = false` at the root.
2. Every dynamic route has `entries()`; the build fails on broken links.
3. Content parsing lives in one server module; routes don't parse Markdown.
4. Code highlighting happens at build time.
5. Canonical URL, description and title on every page; sitemap complete.
6. Styling follows `kejser-web:css`.
7. No secrets in `config.json` or `static/`.
