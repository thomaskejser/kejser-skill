---
name: collaboration
description: How Thomas wants agents to work alongside him and other agents — pulling and rebasing at session start and after idling, staging and committing in shared trees, commit authorship trailers, shared dev servers, reporting findings honestly, and handling credentials and production systems. Use at the start of every session, when resuming after a pause, before any git commit, when several agents share a working tree, when reporting results or handing off work, and when touching credentials, clusters, or production.
---

# Collaboration

## Staying current

- When a session starts, and when it resumes after being idle for 30 minutes or more, pull and rebase the repo it is working in:

  ```sh
  git pull --rebase
  ```

- With uncommitted changes in the tree:
  - if they are all yours, use `git pull --rebase --autostash`;
  - if any came from Thomas or another session, never stash them: run `git fetch` instead and say how far behind the branch is.
- On a conflict, run `git rebase --abort` and report the conflicting files; don't resolve someone else's changes.
- A branch with no upstream, or a pull that fails on authentication, is reported, not worked around.

## Committing

- **Stage explicit file paths.** Never `git add -A`, `git add .`, `git add <dir>`, or `git commit -a`.
- Before every commit, read `git diff --cached --name-status` — including when you are certain what's in it.
- **One commit, one author.** If staged files came from two sessions, split the commit. Identify sessions with trailers: `Claude-Session: <url>`, plus `Claude-Author-Session: <url>` when the committer is not the author.
- **Don't explain a change you did not make.** If you don't know why a change exists, say what it does and keep the message short.
- History belongs in commit messages and design docs, not in code comments.
- Land large work as separable slices (e.g. definition, handler, integration) that still go in together.

## Shared working trees

When several agents work in one tree:

- Follow the repo's rule on who commits. If one session owns commits, others leave work in the tree and announce it is ready.
- When you declare work ready, **name files, not areas**. After editing a file again, re-declare it — a declaration describes a file at a moment.
- `git log` is not an ownership lookup; ask the session that is working on it.
- **Never start, stop, or kill a shared dev server or a port you didn't open.** Use a throwaway port with `--strictPort` and confirm the PID is yours before stopping it.
- Reading git is always fine.

## Reporting

- Send a **finding, not a patch**: what you measured, where (page, width, input), and the code or markup it hooks into.
- Label inference as inference. Give timestamps and exact supporting lines or messages for claims about incidents.
- State what you covered and what you deliberately left out.
- An admitted gap beats a plausible reconstruction.
- Don't ask what the code can answer — do the inventory yourself. Do ask before changing the behaviour of existing functions others depend on.

## Credentials and production

- Never print, persist, or echo credentials (tokens, PATs, JWTs, kubeconfigs). Refer to where they live.
  The one exception: when Thomas asks, an agent stores a value as an environment variable as `kejser-code:environment-variables` describes.
- Default to read-only commands unless a change is explicitly requested. Confirm the active context (kube context, account, cluster) first; never substitute a different one, and don't start an interactive SSO login on your own.
- Keep downloaded logs and captures outside the repo, and delete them when done.
- Time-bound every query or scan against a live system.
