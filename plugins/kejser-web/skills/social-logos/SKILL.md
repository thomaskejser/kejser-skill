---
name: social-logos
description: SVG logos for the major social media platforms (Bluesky, Discord, Facebook, GitHub, Instagram, LinkedIn, Mastodon, Medium, Messenger, Patreon, Pinterest, Reddit, Signal, Snapchat, Substack, Telegram, Threads, TikTok, Tumblr, Twitch, Vimeo, WhatsApp, X, YouTube), each as a theme-following currentColor version plus light- and dark-surface versions, with a SocialLogo Svelte component, brand-colour CSS, sources, licences and brand-usage rules. Use whenever a page needs a social media or platform logo or icon — share buttons, profile links, integration pages, footers.
---

# Social media logos

Ready-made logos for 24 platforms, in this skill's folder.
Never draw a platform logo by hand or fetch one from a random site; use these.

## What's here

| Path | Holds |
|---|---|
| `svelte/SocialLogo.svelte` | Component that renders any logo inline. |
| `svelte/social-logos.ts` | Path data for every logo, and the `SocialBrand` type. |
| `svelte/social-logos.css` | Sizing, and brand colours that follow the theme. |
| `svg/<brand>.svg` | Single colour, `fill="currentColor"`. |
| `svg/<brand>-light.svg` | Coloured for light surfaces. |
| `svg/<brand>-dark.svg` | Coloured for dark surfaces. |
| `sources.md` | Per brand: colours, source, licence, link to its brand rules. |
| `generate.mjs` | Builds everything above from pinned npm packages. |

- Every logo has a `0 0 24 24` `viewBox` and a `<title>` naming the brand.
- `light` and `dark` use the brand colour when it reaches 3:1 contrast with the surface, otherwise black or white.
  `sources.md` lists which.

## In a SvelteKit app

- Copy `svelte/` into the project as `src/lib/social-logos/`.
- Copy `social-logos.css` into the styles folder and import it from the entry file after `feedback.css` (see `kejser-web:css`).
  Brand colours are an external contract, so the sheet carries them as literals.
- Set `--icon-size` in `tokens.css`; without it, logos are `1em`.
- Use the component:

  ```svelte
  <script lang="ts">
  	import SocialLogo from '#lib/social-logos/SocialLogo.svelte';
  </script>

  <a href={profileUrl}><SocialLogo brand="linkedin" label="LinkedIn" /></a>
  <SocialLogo brand="instagram" tone="brand" />
  ```

- SvelteKit 2 projects import from `$lib/` instead (see `kejser-web:sveltekit`).
- `brand` is typed, so an unknown brand fails `svelte-check`.
- `tone="inherit"` (the default) draws the logo in the surrounding text colour, so it follows every theme.
- `tone="brand"` draws it in the brand colour, switching between the light and dark values with the page's `color-scheme`.
- Pass `label` when the logo is the only content of a link or button.
  Leave it out when visible text already names the platform; the logo is then hidden from screen readers.

## As files

- Use the `svg/` files where a component can't go: Markdown, README files, emails, `<img>`.
- An `<img>` can't inherit `currentColor`, so pick `-light` or `-dark` to match the surface.
- Give the `<img>` an `alt` naming the platform, or `alt=""` when text beside it does.

## Brand rules

- Never change a logo's shape, proportions or rotation, and never add outlines, shadows or effects.
- Colour it only in its brand colour, black or white.
- Keep clear space around it of at least a quarter of its size.
- Don't draw it smaller than 16px.
- Don't make it bigger than your own logo or imply the platform endorses the app.
- A platform's own guidelines win where they are stricter; `sources.md` links them.

## Licences

- 23 logos come from Simple Icons and are CC0; they need no attribution.
- LinkedIn comes from Font Awesome Free and is CC BY 4.0.
  Its attribution comment stays in its SVG files and in `social-logos.ts`, and the app's credits or licence notice names Font Awesome.
- The logos are trademarks of their owners whatever the file licence; they may only refer to the platform.

## Adding a brand

- Add its slug to `generate.mjs`.
  Take it from Simple Icons when it has one, otherwise from Font Awesome Free brands with the official brand colour.
- Run `npm install && npm run generate` in this folder, and commit the generated files.
- Changes to this skill go through the `Skills` agent (see `kejser-code:skill-updates`).
