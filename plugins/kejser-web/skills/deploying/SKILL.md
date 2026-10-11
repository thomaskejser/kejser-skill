---
name: deploying
description: How to deploy SvelteKit apps to our servers — build, adapter config, environment, and release steps. PLACEHOLDER: the server-specific details are not yet filled in. Use whenever deploying, releasing, or shipping a SvelteKit app, or configuring build output for our infrastructure.
---

# Deploying

How SvelteKit apps get built and shipped to our servers.

> **⚠️ Placeholder.** The server-specific details below are not yet filled in. Where a section is marked *TBD*, do not guess — ask before acting, and never invent a hostname, credential, path, or command.

## What's settled

**Adapter.** `@sveltejs/adapter-node`. We deploy to our own servers, so platform adapters (Vercel, Netlify, Cloudflare) are not used. The adapter emits a standalone Node server into `build/`.

**Build.**

```sh
npm ci          # never `npm install` in CI — lockfile is authoritative
npm run check   # svelte-check must pass
npm run lint
npm test
npm run build   # outputs ./build
```

A build that fails `check`, `lint`, or `test` does not ship.

**Runtime.** The built server runs with `node build` and reads configuration from the environment. Nothing is baked into the image at build time except public (`PUBLIC_*`) variables.

## TBD — fill in before relying on this skill

- **Target servers** — hostnames, environments (staging / production), how many, who owns them
- **Deployment mechanism** — containers vs. bare Node, orchestration, CI/CD pipeline, which branch or tag triggers a release
- **Process supervision** — systemd, pm2, Docker restart policy; log destination
- **Reverse proxy** — nginx/Caddy config, TLS termination, `ORIGIN` / `PROTOCOL_HEADER` / `HOST_HEADER` settings the Node adapter needs behind a proxy
- **Environment variables and secrets** — where they live, how they're injected, who can read them
- **Static assets** — whether the proxy serves `build/client` directly or the Node server does
- **Database migrations** — ordering relative to the app deploy
- **Health checks and readiness** — endpoint, expected response
- **Rollback** — how to revert a bad release, and how fast
- **Zero-downtime strategy** — blue/green, rolling, or accepted downtime window

## Rules that hold regardless

- Secrets never enter the repo, the build output, or a `PUBLIC_*` variable. Only `$env/static/private` and `$env/dynamic/private`, imported from server-only code.
- Deploy from a clean, tagged commit — never from a dirty working tree or local build.
- Staging first, then production, unless explicitly told otherwise.
- Confirm before touching production, and confirm before anything destructive (migrations, data backfills, config rewrites).

## Updating this skill

As deployment details get decided, send it to the `Skills` agent (see `kejser-code:skill-updates`). It replaces the matching *TBD* bullet with the concrete answer and moves it up into "What's settled", keeping real commands verbatim so they can be copied without editing.
