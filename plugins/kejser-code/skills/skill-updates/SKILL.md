---
name: skill-updates
description: Who may change Thomas's skills and how to route a change. Only the skill agents edit the kejser-skill repo: the session named "Skills" (another machine) and the session named "kejser-skill" (Thomas's Windows machine). They coordinate with each other; every other agent sends the change to one of them or asks Thomas to start one. Use whenever you want to add, change or remove a skill, when Thomas states a general preference that belongs in a skill, or before touching ~/source/kejser-skill or the installed kejser-web / kejser-code plugins.
---

# Skill updates

Thomas's skills live in the `kejser-skill` repo (`~/source/kejser-skill`, github.com/thomaskejser/kejser-skill).
Two skill agents own it, one per machine, so changes stay consistent and every other session gets told to refresh.

## The rule

- Only the skill agents change the skill repo:
  - **`Skills`**, running on another machine;
  - **`kejser-skill`**, running on Thomas's Windows machine (`C:\Source\kejser-skill`).
- That covers editing, committing and pushing the repo, and changing the installed plugin copies under `~/.claude/plugins/`.
- No other agent makes those changes, even small ones.

## If you are not a skill agent

- Run `ListAgents` and look for a session named exactly `Skills` or `kejser-skill`.
- **If one is listed and not offline:** send it the change with `SendMessage`.
  - Prefer the one on your own machine; either will do.
  - Send each change to one skill agent only, not both.
  - Quote Thomas's own words for the preference.
  - Say which skill it belongs in, if you know.
  - Say which repo or task it came up in.
- **If both are missing or offline:** don't edit the skills yourself.
  Ask Thomas to start one, e.g. run `claude` in `~/source/kejser-skill`, then `/rename Skills`.
  Once it's running, send it the change.
- Either way, apply the preference to your current task right away.
  Waiting for the skill update shouldn't block your work.
- Repo-specific facts (build commands, paths, architecture) are not skill changes.
  They stay in that repo's `CLAUDE.md`/`AGENTS.md`.

## If you are a skill agent

- Commit and push every change straight away, without asking; other agents need the latest version.
- Run `git pull --rebase` right before every edit, not just at session start.
- Edit the skill, and follow `kejser-code:markdown` for the file itself.
- Bump `version` in the plugin's `plugin.json` and in `.claude-plugin/marketplace.json`, starting from the versions just pulled, then run `claude plugin validate .`.
- Stage explicit paths, commit, and push.
- If the push is rejected, `git pull --rebase`.
  On a version conflict, take the other agent's versions and bump again on top of them; never lower a version.
- Refresh this machine's install:
  `claude plugin marketplace update kejser-skill`, then `claude plugin update <plugin>@kejser-skill`.
- `ListAgents`, then `SendMessage` each live peer: what changed, the new versions, and to run `/reload-plugins`.
  Always include the other skill agent, so it knows `main` has moved.
- When the other skill agent announces a release, pull and refresh this machine's install.
- Tell Thomas which peers were offline and still need a refresh.
