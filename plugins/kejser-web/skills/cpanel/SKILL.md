---
name: cpanel
description: Publishing a static site to cPanel shared hosting over FTPS — the build is zipped, uploaded with a one-shot PHP unpack script, and unpacked in the web root. Includes a ready-made deploy-cpanel.ts helper, the <PREFIX>_FTP_* / <PREFIX>_SITE_URL environment variables (kept in shell exports such as ~/.zshenv), and the .htaccess every site ships (extensionless URLs, 404 page, cPanel's PHP handler). Use whenever deploying, publishing or uploading a site to cPanel, shared hosting, Apache or an FTP server, setting up a deploy script or .htaccess for an adapter-static SvelteKit site, or choosing its deploy environment variables.
---

# Publishing to cPanel

cPanel shared hosting serves files and runs PHP; it does not run a Node server.
This skill covers static sites: SvelteKit with `@sveltejs/adapter-static`, prerendered into `build/` (see `kejser-web:svelte-static`).
Node servers deploy as described in `kejser-web:deploying`.

## How it works

1. Connect over FTPS (explicit TLS on port 21) and read the server's `.htaccess`.
   If the build's `.htaccess` would drop cPanel's PHP handler, stop before uploading anything (see [PHP handler](#php-handler)).
2. Zip the build directory in memory and upload it as `deploy-<random>.zip`.
3. Upload a one-shot `deploy-<random>.php` next to it.
4. Request that script over HTTPS.
   It unzips into its own directory, deletes the zip and itself, and answers `deployed`.
5. Remove both files over FTP in any case, so a failed deploy leaves nothing behind.

- One upload of one file is much faster than FTP-ing thousands of small files.
- The random name keeps outsiders from triggering the unpack script.
- Our sites never use PHP; the unpack script is the only PHP that ever runs.

## Set up a project

1. Copy [`deploy-cpanel.ts`](deploy-cpanel.ts), next to this file, into the project as `scripts/deploy-cpanel.ts`, unchanged.
   It is formatted with the stack's Prettier settings, so `prettier --check` passes.
2. Install its dependencies:

   ```sh
   npm i -D basic-ftp adm-zip @types/adm-zip
   ```

3. Choose the variable prefix (see [Environment variables](#environment-variables)), and add the script to `package.json`:

   ```json
   "deploy": "npm run build && node --env-file-if-exists=.env scripts/deploy-cpanel.ts DOGS"
   ```

4. Add `static/.htaccess` (see [.htaccess](#htaccess)).
5. Ask Thomas to set the variables, then run `npm run deploy`.
   Deploying is outward-facing: confirm with Thomas before every run.

- The helper needs Node ≥22.18 to run TypeScript directly.
- `node scripts/deploy-cpanel.ts [PREFIX] [buildDir]` takes the prefix and the build directory, `build` by default.
- From code: `deployToCpanel(cpanelTargetFromEnv('DOGS'), 'build')`.

## Environment variables

| Variable | Holds | Example |
|---|---|---|
| `<PREFIX>_FTP_HOST` | The cPanel server's own hostname, not the site's domain. | `server42.hosting-provider.com` |
| `<PREFIX>_FTP_PORT` | Optional; defaults to `21`. | `21` |
| `<PREFIX>_FTP_USER` | The site's FTP account. | `deploy@example.com` |
| `<PREFIX>_FTP_PWD` | That account's password. | |
| `<PREFIX>_SITE_URL` | The public site URL, with `https://`. | `https://www.example.com` |

### The prefix

- Pass a short prefix naming the site, e.g. `DOGS` for dogs.kejser.org, as the script's first argument.
- Use a custom prefix whenever the package name is long or generic, or Thomas names one.
- Without an argument, the prefix is the `package.json` name in upper snake case, without any npm scope: `database-doctor` → `DATABASE_DOCTOR`.
- A missing variable fails the deploy before anything is uploaded, naming the variable.

### Where the values live

- Thomas keeps them as shell exports in `~/.zshenv`; that is the expected home, above all for the password.

  ```sh
  export DOGS_FTP_HOST=server42.hosting-provider.com
  export DOGS_FTP_USER=deploy@example.com
  export DOGS_FTP_PWD='…'
  export DOGS_SITE_URL=https://dogs.example.com
  ```

- A git-ignored `.env` in the project is optional; `--env-file-if-exists` loads it when present.
- When a variable is set in both places, the shell's value wins; Node's `--env-file` never overrides the environment.
- Never write the values into the repo, `config.json`, or a public build-time variable, and never print the password.
- Agents ask Thomas to set the variables; they don't write `~/.zshenv` themselves.

## .htaccess

Every site ships `static/.htaccess`, which the deploy copies over the server's:

```apache
# php -- BEGIN cPanel-generated handler, do not edit
<copied from the server; see PHP handler>
# php -- END cPanel-generated handler, do not edit

Options -MultiViews -Indexes
DirectorySlash Off
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} ^(.+?)/?$
RewriteCond %1.html -f
RewriteRule ^(.+?)/?$ $1.html [L]
ErrorDocument 404 /404.html
```

- adapter-static writes `/about` as `about.html`, and Apache doesn't serve that for `/about` by itself.
  The rewrite maps `/about` and `/about/` to `about.html` when that file exists.
- `DirectorySlash Off` matters when a page and a folder share a name (`posts.html` and `posts/`).
  Without it, Apache redirects `/posts` to `/posts/` and answers 403.
- `-Indexes` stops Apache listing folders that have no page.
- `/404.html` comes from a prerendered `src/routes/404/+page.svelte` (see `kejser-web:svelte-static`).

### PHP handler

- cPanel writes a `# php -- BEGIN cPanel-generated handler` block into the server's `.htaccess`.
  It makes `.php` files run, and the deploy's unpack script needs it.
- Copy that block from the server into `static/.htaccess`, exactly as it is.
- The helper checks this on every deploy.
  If the server has the block and the build's `.htaccess` lacks it, the deploy stops and prints the block to copy.
- Drop every other cPanel PHP block, such as `BEGIN cPanel-generated php ini directives`.
  The sites don't use PHP, and that block holds the hosting account's home path, which must not be committed.

## cPanel setup

- Create a dedicated FTP account in cPanel → **FTP Accounts**.
- Set its directory to the site's document root (e.g. `public_html`), because the helper uploads to the account's root.
- Use the server's own hostname for `<PREFIX>_FTP_HOST`, not the site's domain.
  The server's TLS certificate names the server, and the helper verifies it.
  `openssl s_client -starttls ftp -connect <host>:21` shows which name the certificate carries.
- PHP needs the `zip` extension (`ZipArchive`), which cPanel enables by default.

## Limits

- Unzipping overwrites and adds files; it never deletes files a previous build had.
  Remove stale files through cPanel's File Manager when a page or asset is retired.
- The site is briefly half-updated while the zip unpacks.
