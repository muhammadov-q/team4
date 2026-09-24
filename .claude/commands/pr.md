---
description: Clean up comments in the diff, run local checks, then branch, commit, push, and open a PR to main that closes its GitHub issue
argument-hint: "[optional issue number and/or title hint, e.g. #7 feat(frontend) upload flow]"
---

You are opening a pull request for this change the way Codex Lens does it. Optional hint from the user: **$ARGUMENTS**

Invoking `/pr` IS the user authorizing commit + push + PR in this turn. Do the whole flow; stop before merging (merges need a teammate's approving review and green CI).

## Step 1: comment and docstring pass (REQUIRED, before anything else)
Look at exactly what this change touches: `git status`, `git diff` (unstaged + staged) and any new files. Review **only the comments and docstrings inside the diff**.

The standard: **default to no comments; keep only short, load-bearing ones.**
- **Remove** comments that restate the code, narrate the obvious, or are leftover scaffolding/TODOs.
- **Keep / tighten** comments that carry non-obvious context: *why* a thing is done, a subtle invariant, a gotcha. Trim them to the load-bearing sentence.
- Match the surrounding file's comment density and voice.

Make the edits directly. Briefly note what you trimmed.

## Step 2: docs
Documentation is graded here, so check whether this change needs any:
- A major or hard-to-reverse decision (a library, a pattern, a service boundary) gets an ADR in `docs/adr/NNNN-kebab-title.md` (Context / Decision / Consequences, short).
- A new or changed model gets its model card in `docs/models/<name>.md` (data, training setup, test-set metrics, limitations, intended use).
- Setup or commands changed: update the app's README (`frontend/README.md`, `backend/README.md`) or the root README.
- One doc per concept, never a changelog-style "this PR did X" file. A plain bug fix or refactor usually needs no doc; say so and move on.

## Step 3: local checks (stop on red)
Run the suite for each area this change touches:
- **Frontend** → `cd frontend && npm run pre-commit` (lint, format, type check, unit tests).
- **Backend** → `cd backend && bash check.sh` once it exists; until then `cd backend && uv run pytest`.
- Any other area with a `check.sh` → run it from that directory.

If a check fails, **stop and report**; don't push red.

## Step 4: issue, type, scope, title
- **Issue**: every PR closes one GitHub issue. Get the number from `$ARGUMENTS`, the conversation, the branch name (`feat/7-...`) or the commits. If you can't tell which issue this is, ask before opening the PR. Only write "No issue" for a pure chore nobody filed.
- **Title**: a Conventional Commit, `type(scope): description` (`feat(frontend): upload a page and show the model response`). Imperative, lower-case description, no trailing period.

## Step 5: branch
- On `main`: `git fetch origin main` then `git checkout -b <type>/<issue>-<short-kebab> origin/main` (e.g. `feat/7-web-frontend`), carrying the working-tree changes over.
- Already on a feature branch: stay on it.

## Step 6: commit
Stage the change (`git add` the relevant paths; never `.env` files, datasets or weights) and commit with a **single-line** Conventional Commit, **no body**. For a multi-commit PR, give each commit its own one-line title.
- **No watermarks**: no "🤖 Generated with…" line and no `Co-Authored-By: Claude…` (or any AI) trailer, in the commit OR the PR body.

## Step 7: push and open the PR
Write the body to a scratch file (not the repo), then:
```
git push -u origin <branch>
gh pr create --base main --head <branch> --assignee @me --title "<title>" --body-file <file>
```
**Always pass `--assignee @me`.**

`gh pr edit` and `gh issue edit` fail on this repo with a GraphQL error about Projects (classic) being deprecated. That error is about a field `gh` requests internally, not about the edit, so use REST:
```
gh api -X POST  repos/muhammadov-q/team4/issues/<number>/assignees -f 'assignees[]=<login>'
gh api -X PATCH repos/muhammadov-q/team4/pulls/<number> -F body=@/path/to/body.md
```
Get `<login>` from `gh api user --jq .login`.

**PR body**: follow `.github/pull_request_template.md`. `Closes #<issue>` is the first line, always. Then, with **no question marks** in the headings:

`## What` · `## Why` · `## How` · `## Testing` · `## Screenshots` · `## Definition of Done`

- **Short bullets, not paragraphs.** If a bullet runs past two lines, split it or cut it.
- **Delete any section that doesn't apply** rather than writing "N/A". How and Screenshots are empty on most PRs.
- **What**: one bullet per change. **Why**: the problem this solves. **How**: only decisions the diff doesn't show.
- **Testing**: what you ran and what you saw, facts only. List what you ran, never what you didn't.
- **Screenshots**: UI changes only, light and dark.
- **Definition of Done**: tick only the boxes that are actually true.

### Voice: write like a person, in simple English
This applies to the PR body **and** to what you report back in chat.
- Plain words over impressive ones (`use` not `utilise`, `check` not `validate`).
- Short sentences, one idea each.
- No consultant filler: "worth calling out", "it's worth noting", "as noted above".
- Say what you did, not how thorough you were.

Then report the PR link and a one-line summary of the comment cleanup + check results. **Do not merge.**
