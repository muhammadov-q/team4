---
description: Commit current local changes to the current branch with a concise one-line conventional commit and push (updates the open PR if there is one)
argument-hint: "[optional message or hint]"
---

Quickly commit the current local changes to the **current branch** and push. Optional message/hint from the user: **$ARGUMENTS**

Invoking `/commit` IS the user authorizing commit + push in this turn. Keep it fast: this is the lightweight path (no branch, no PR, no cleanup). For the full flow use `/pr`; to tidy first use `/tidy`.

## 1. Preflight
`git status`. If there's nothing to commit (clean tree), say so and stop.

## 2. Branch guard
`git branch --show-current`. If it's **`main`**, STOP: never commit to the trunk directly. Tell the user to use `/pr` (which branches off main first), or offer to create a `feat/<issue>-<name>` branch for them. Otherwise continue on the current branch.

## 3. Message: one line, short, on point
A single Conventional Commit line, **`type(scope): description`**: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`, `perf`; scope is the area (`frontend`, `backend`, `ml`, `inference`, `worker`, `docs`, `ci`), omitted when there's no single one. Imperative, lower-case description, no trailing period, **no body**. Infer it from the actual diff (`git diff`, staged changes, new files). If `$ARGUMENTS` is given, use it as the message (normalized to the style) or as a strong hint.

## 4. Commit
Stage the relevant changes (`git add` the paths involved; never `.env` files, datasets or model weights) and commit with just that one-line message. The pre-commit hook runs lint-staged on staged frontend files; if it fails, fix the reported problem and retry, never `--no-verify` unless the user asks.
- **No watermarks**: no "Generated with…" line and no `Co-Authored-By: Claude…` (or any AI) trailer.

## 5. Push
`git push` if the branch already tracks a remote, else `git push -u origin <branch>`. The pre-push hook runs the check suite of each touched area; if it goes red, stop and report.

## 6. Report
One line: the commit hash + message, and that it's pushed to `<branch>`. If the branch has an open PR, note that the PR is now updated. Do not merge.
