---
name: environment-variables
description: How Thomas's projects name, store, set and read environment variables, including secrets such as passwords and tokens — <PREFIX>_<NAME> names, values kept in ~/.zshenv on macOS and Linux and in the user environment on Windows (set through the system API), agents setting them only when Thomas asks, optional git-ignored .env files, and code that fails loudly on a missing variable. Use whenever a project needs a credential, secret, token, password, host or other setting from the environment, whenever Thomas asks to set, change or remove an environment variable, or when writing code or scripts that read one.
---

# Environment variables

Settings and secrets reach programs through environment variables.
They never live in the repo.

## Naming

- `<PREFIX>_<NAME>` in upper snake case: `DOGS_FTP_HOST`, `DOGS_FTP_PWD`.
- The prefix is a short name for the project or site, so variables of different projects never collide.
- Reuse the names a skill already defines, such as the `<PREFIX>_FTP_*` and `<PREFIX>_SITE_URL` set in `kejser-web:cpanel`.

## Where values live

| OS | Home | Takes effect in |
|---|---|---|
| macOS, Linux | `export` lines in `~/.zshenv` | Every new zsh, including the non-interactive shells agents and scripts run in |
| Windows | User environment variables (`HKCU\Environment`) | Every process started after the change |

- A git-ignored `.env` in a project is optional.
  When both are set, the shell's value wins: load `.env` with Node's `--env-file-if-exists`, which never overrides the environment.
- Never in the repo, a committed `.env`, `config.json`, or a variable that ends up in a client build.

## Setting them

Agents set or change a variable only when Thomas asks.
Otherwise they name the variable and ask him to set it.

### macOS and Linux: `~/.zshenv`

- Write one line per variable, value in single quotes: `export DOGS_FTP_PWD='…'`.
  A `'` inside the value is written `'\''`.
- If the file already has an `export NAME=` line, replace that line; never add a second one.
- Check for an existing line without printing the file, which holds other secrets:

  ```sh
  grep -c '^export DOGS_FTP_PWD=' ~/.zshenv
  ```

- Never `cat` or otherwise print `~/.zshenv`, and never echo a value back.
- Confirm a variable is set without showing it:

  ```sh
  zsh -c '[[ -n $DOGS_FTP_PWD ]] && echo set || echo missing'
  ```

### Windows: the system API

- Set user variables through `SetEnvironmentVariable`, which writes `HKCU\Environment` and tells running programs the environment changed.
  From PowerShell:

  ```powershell
  [Environment]::SetEnvironmentVariable('DOGS_FTP_PWD', '…', 'User')
  ```

- Remove one by setting it to `$null`.
- Not `setx`: it cuts values at 1024 characters.
- Confirm without showing the value:

  ```powershell
  if ([Environment]::GetEnvironmentVariable('DOGS_FTP_PWD', 'User')) { 'set' } else { 'missing' }
  ```

### After setting

- Programs already running keep their old environment: dev servers, terminals, other agents' shells.
- Tell Thomas which ones must restart to see the change.

## Reading them in code

- Read a variable in one place, at startup, and fail loudly when it is missing, naming the variable.
  Never fall back to a default for a secret.
- Never log, print or return a secret's value; report only whether it is set.
- SvelteKit 3 declares variables in `src/env.ts` and reads them from `$app/env/private` (see `kejser-web:sveltekit`).
