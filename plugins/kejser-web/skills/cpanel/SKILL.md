---
name: cpanel
description: Publishing a static site to cPanel shared hosting over FTPS — the build is zipped, uploaded with a one-shot PHP unpack script, and unpacked in the web root. Includes a ready-made deploy-cpanel.ts helper and the <APP>_FTP_* / <APP>_SITE_URL environment-variable convention. Use whenever deploying, publishing or uploading a site to cPanel, shared hosting or an FTP server, or setting up a deploy script for an adapter-static SvelteKit site.
---

# Publishing to cPanel

cPanel shared hosting serves files and runs PHP; it does not run a Node server.
This skill covers static sites: SvelteKit with `@sveltejs/adapter-static`, prerendered into `build/` (see `kejser-web:svelte-static`).
Node servers deploy as described in `kejser-web:deploying`.

## How it works

1. Zip the build directory in memory.
2. Upload it over FTPS (explicit TLS on port 21) as `deploy-<random>.zip`.
3. Upload a one-shot `deploy-<random>.php` next to it.
4. Request that script over HTTPS.
   It unzips into its own directory, deletes the zip and itself, and answers `deployed`.
5. Remove both files over FTP in any case, so a failed deploy leaves nothing behind.

- One upload of one file is much faster than FTP-ing thousands of small files.
- The random name keeps outsiders from triggering the unpack script.

## Helper

- [`deploy-cpanel.ts`](deploy-cpanel.ts), next to this file, implements the steps above.
- Copy it into the project as `scripts/deploy-cpanel.ts`, unchanged.
- It needs Node ≥22.18 to run TypeScript directly.
- Dependencies:

  ```sh
  npm i -D basic-ftp adm-zip @types/adm-zip
  ```

- Script in `package.json`:

  ```json
  "deploy": "npm run build && node --env-file-if-exists=.env scripts/deploy-cpanel.ts"
  ```

- `node scripts/deploy-cpanel.ts [PREFIX] [buildDir]` overrides the variable prefix and the `build` directory.
- From code: `deployToCpanel(cpanelTargetFromEnv(), 'build')`.

## Environment variables

The prefix is the `package.json` name in upper snake case, without any npm scope: `database-doctor` → `DATABASE_DOCTOR`.

| Variable | Holds |
|---|---|
| `<APP>_FTP_HOST` | The cPanel server's hostname, e.g. `server.hosting-provider.com`. |
| `<APP>_FTP_PORT` | Optional; defaults to `21`. |
| `<APP>_FTP_USER` | The FTP account, e.g. `deploy@example.com`. |
| `<APP>_FTP_PWD` | The FTP account's password. |
| `<APP>_SITE_URL` | The public site URL, e.g. `https://www.example.com`. |

- A missing variable fails the deploy before anything is uploaded.
- Values live in the shell environment or in a git-ignored `.env`, never in the repo or in `$env/static/public`.

## cPanel setup

- Create a dedicated FTP account in cPanel → **FTP Accounts**.
- Set its directory to the site's document root (e.g. `public_html`), because the helper uploads to the account's root.
- Use the server's own hostname for `<APP>_FTP_HOST`, not the site's domain.
  The server's TLS certificate names the server, and the helper verifies it.
  `openssl s_client -starttls ftp -connect <host>:21` shows which name the certificate carries.
- PHP needs the `zip` extension (`ZipArchive`), which cPanel enables by default.

## Limits

- Unzipping overwrites and adds files; it never deletes files a previous build had.
  Remove stale files through cPanel's File Manager when a page or asset is retired.
- The site is briefly half-updated while the zip unpacks.
- Deploying to the live site is outward-facing: confirm with Thomas before running it.
