---
name: code-style
description: Thomas's language-agnostic code conventions — minimal comments (contract only, rationale in docs), comments and docs describe the code as it is now (never its history), guard clauses, fail loudly, no silently-ignored input, DRY, minimal local changes, how to test and verify, and revisiting changed code against the rules after every feature or rework. Use whenever writing, editing, or reviewing code in any language, writing code comments, deciding where design rationale goes, or finishing a feature or rework.
---

# Code style

Applies in every language. Language-specific rules (e.g. `kejser-code:cpp`, `kejser-web:sveltekit`) build on this. Where a repo's own `CLAUDE.md`/`AGENTS.md` is stricter, the repo wins.

## Comments: default to none

Let the code speak. Write a comment only for what the code cannot say:

- the **contract** a caller must know — preconditions, invariants, ownership, what a return value means
- an **external constraint** — a licence obligation, a protocol or API quirk, a bug in a dependency
- a **non-obvious invariant** between two places in the code
- a **deliberate choice that looks like a mistake**, so nobody "fixes" it

Never:

- restate the code (`// Returns the schema` above `Schema()`)
- section banners (`// ---- Helpers ----`)
- history or narration — what changed, why an alternative was rejected, task or ticket cross-references (see below)
- prose written to convince a reviewer. Tests and assertions carry that burden.
- a comment longer than the code it documents

If a block needs a comment to explain its role, extract it into a well-named function instead. If an explanation needs a paragraph, it belongs in `docs/<TOPIC>.md` (or the README that owns the area), with at most a one-line pointer from the code. If it isn't worth a doc, it goes nowhere.

## Describe the code as it is now

Comments and Markdown files (READMEs, `docs/`, `CLAUDE.md`, `SKILL.md`) describe what the code does **now**.
They never tell the story of how it got here.

- No "previously", "now uses", "was changed to", "after the refactor", "we tried X first", "new:" or "fixed:".
- No changelog sections, dated notes or "update" paragraphs in docs.
- When behaviour changes, rewrite the affected text so it reads as if it had always been this way.
- History lives in git: commit messages, and `git log`/`git blame` for whoever needs it.
- A rejected alternative may be documented only as a present-tense constraint, e.g. "X is not used because it fails under Y."

## Shape

- **Guard clauses and early returns.** Handle a case and return; don't wrap the rest of the function in an `else`. Keep nesting shallow.
- Each branch of a `switch`/`match` produces its complete result; no shared epilogue that every case falls into.
- **Keep changes minimal and local.** No generic abstraction until the operation is genuinely needed in several places.
- **DRY.** Reuse existing helpers, clients and dispatchers before writing new ones. Never create two code paths for the same thing.
- When editing someone else's code, match its idioms, even where you would do it differently.

## Errors

- **Fail loudly on an unmet precondition.** Never degrade around it — a program running half-configured reports success while doing the wrong thing.
- **Never silently accept input that is then ignored.** Reject syntax, flags, or filters you can't honour, with a clear error.
- Don't add an option whose output a downstream component will reject.
- **Optimisations must never cause failures.** A cache miss, a skipped fast path, or an unavailable accelerator falls back; it never fails the operation.
- Handle errors close to the statement that can fail, not in one large block around everything.

## Tests and verification

- Build and run the relevant tests locally before reporting a result. Never claim something works without having run it.
- Write **negative tests**: prove the rewrite does *not* fire, the parser *rejects* what is out of scope, the handler fails correctly downstream.
- Cover every branch: success, each option, absence, conflict, downstream failure.
- Beware tests that pass by not running — "no tests ran" often exits 0; a stale server can answer on the port you meant to test. Check that what you think ran actually ran.
- Measure instead of assuming; read the value back.
- Don't disable build or compilation caches to "be safe".

## Review after a feature

After finishing a new feature or reworking one, go back over every file the work changed and bring it in line with Thomas's coding rules.

- Check the changed code against each skill that applies: this one, the language skill, and any others such as `kejser-web:css` or `kejser-code:ux-design`.
- Do this on your own initiative, before reporting the work as done.
- If the review can't happen now, for example because the cleanup would be large or touches code others depend on, prompt Thomas to schedule it.
  Don't leave it unmentioned.
- Report what the review changed.

## Docs

- Rationale and design live in `docs/` (or `doc/`) as one file per topic, not in source.
- When you hit a constraint, write it down where the next author will read it (e.g. `docs/LIMITATIONS.md`) rather than leaving it to be rediscovered.
- Keep command examples generic — no personal usernames, local credential paths, or secrets.
