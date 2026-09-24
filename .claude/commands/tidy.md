---
description: Review the current PR/diff for redundant & dead code, naming, clarity, and comment hygiene, then apply quality-only cleanups (no behavior change)
argument-hint: "[optional path/area to focus, e.g. frontend/src/components/recognition]"
---

You are doing a **code-quality cleanup pass over the current PR** so the codebase stays clean and maintainable. Optional focus from the user: **$ARGUMENTS**

This is **quality only: never change behavior.** No bug fixes, no logic changes, no new features. If you spot a real bug, **note it for the user and leave it** (suggest `/code-review`).

## Scope: only this PR's changes
```
git status
git fetch origin main --quiet
git diff origin/main...HEAD        # committed on this branch
git diff                           # plus uncommitted working-tree edits
```
Consider changed and new files together. If `$ARGUMENTS` names a path, narrow to that. If the branch has no diff against main, say there's nothing to clean and stop.

## What to check, and fix in place

1. **Comments & docstrings.** Keep them only when they carry the *why*, a subtle invariant, or a gotcha. Otherwise remove them. Trim survivors to the load-bearing sentence. Touch only comments inside the diff.
2. **Redundant code.** Collapse duplication, repeated sub-expressions, redundant guards, needless intermediate variables, and re-implementations of something that already exists. Prefer the repo's existing helpers (`src/lib/*`, `src/hooks/*`, backend services and repositories).
3. **Dead / unused code.** Remove unused imports, variables, parameters, functions and unreachable branches introduced by this change. Grep before deleting anything exported; if unsure, flag it instead.
4. **Naming.** Match the surrounding conventions (Python `snake_case`, TS `camelCase`, `PascalCase` components, kebab-case file names). Keep renames within the PR's files; propose cross-repo renames instead of doing them.
5. **Clarity.** Early returns over nesting, simpler expressions, no dead abstraction. The code should read like the rest of the file.
6. **Consistency.** Align with the idioms, error handling, and patterns already used nearby (see `CLAUDE.md` and `frontend/CLAUDE.md`).
7. **Em dashes in UI copy.** Replace `—` in user-visible text (JSX text, `label`, `placeholder`, `title`, `aria-label`, `alt`, toast and error messages) with a period, comma, or parentheses. Leave comments, the lone `—` empty-value cell glyph, and parsed strings alone.
8. **File size & decomposition.** For files this PR adds or grows, judge cohesion, not raw line count. When a component passes ~300 lines or a module mixes routes, logic and data access, **propose** the split (target files, what moves) in your report rather than doing it.

Linters flag dead code too: `npm run lint` (frontend) and ruff (backend, once configured).

## After applying
- Run the relevant gate: `cd frontend && npm run pre-commit` for frontend changes; `cd backend && uv run pytest` (or its `check.sh` once it exists) for backend. If it goes red, fix or revert that cleanup. **Never leave the tree broken.**
- **Do not commit or push.** Tell the user to run `/pr` or `/commit`.

## Report
Summarize tightly by category (comments / redundancy / dead code / naming / clarity) with file:line refs for the notable ones. Put **decomposition proposals** in their own section. List anything you **deliberately did not change** and why (suspected bugs, risky renames, code you couldn't prove unused).
