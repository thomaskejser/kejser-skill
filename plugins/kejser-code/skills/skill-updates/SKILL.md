---
name: skill-updates
description: Who may change Thomas's skills and how to route a change. Only the running agent session named "Skills" edits the kejser-skill repo; every other agent sends the change to it or asks Thomas to start it. Use whenever you want to add, change or remove a skill, when Thomas states a general preference that belongs in a skill, or before touching ~/source/kejser-skill or the installed kejser-web / kejser-code plugins.
---

# Skill updates

Thomas's skills live in the `kejser-skill` repo (`~/source/kejser-skill`, github.com/thomaskejser/kejser-skill).
One agent owns it, so changes stay consistent and every other session gets told to refresh.

## The rule

- Only the running agent session named **`Skills`** changes the skill repo.
- That covers editing, committing and pushing the repo, and changing the installed plugin copies under `~/.claude/plugins/`.
- No other agent makes those changes, even small ones.

## If you are not the Skills agent

- Run `ListAgents` and look for a session named exactly `Skills`.
- **If it is listed and not offline:** send it the change with `SendMessage`.
  - Quote Thomas's own words for the preference.
  - Say which skill it belongs in, if you know.
  - Say which repo or task it came up in.
- **If it is missing or offline:** don't edit the skills yourself.
  Ask Thomas to start it, e.g. run `claude` in `~/source/kejser-skill`, then `/rename Skills`.
  Once it's running, send it the change.
- Either way, apply the preference to your current task right away.
  Waiting for the skill update shouldn't block your work.
- Repo-specific facts (build commands, paths, architecture) are not skill changes.
  They stay in that repo's `CLAUDE.md`/`AGENTS.md`.

## If you are the Skills agent

- Edit the skill, and follow `kejser-code:markdown` for the file itself.
- Bump `version` in the plugin's `plugin.json` and in `.claude-plugin/marketplace.json`, then run `claude plugin validate .`.
- Stage explicit paths, commit, and push.
- Refresh this machine's install:
  `claude plugin marketplace update kejser-skill`, then `claude plugin update <plugin>@kejser-skill`.
- `ListAgents`, then `SendMessage` each live peer: what changed, and to run `/reload-plugins`.
- Tell Thomas which peers were offline and still need a refresh.
