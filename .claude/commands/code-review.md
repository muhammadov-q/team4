---
description: Review the current diff (or a given PR) for real bugs + cleanup, and optionally post findings as plain-text inline PR comments
argument-hint: "[PR url/number or path] [--comment]"
---

Do a senior-dev code review of the change. Optional target/flags from the user: **$ARGUMENTS**

If `$ARGUMENTS` contains a PR url or number, review that PR. Otherwise review the current branch's diff. If it contains `--comment`, post the findings as inline PR comments (see the posting rules below).

## 1. Gather the diff
- PR target: `gh pr view <pr> --json headRefOid,baseRefName,url` for the head SHA and base, then `gh pr diff <pr>`. Read the linked issue too (`gh issue view <n>`): the Definition of Done is what the PR must deliver.
- No target: `git fetch origin main --quiet` then `git diff origin/main...HEAD`, plus `git diff` for any uncommitted work.

Read the changed files and enough of the surrounding code to actually understand behavior; don't review the hunks in isolation.

## 2. Find real issues
Look for correctness bugs, regressions from removed behavior, broken call sites, efficiency problems, and clear convention slips (see `CLAUDE.md` and `frontend/CLAUDE.md`). This project also checks for:
- Missing tests for new behavior (the Definition of Done requires them).
- Frontend calls that bypass `src/lib/api/*` or hand-write types the generated schema already has.
- Business logic in routes or UI components; DB access outside repositories.
- ML work that could leak the test split into training or tuning, or unseeded experiments.
- Secrets, datasets or weights in the diff.

Prioritize genuine bugs over nitpicks; skip pure style preferences. Rank most-severe first.

## 3. Post inline comments (only when `--comment` is passed)
Post one inline comment per finding on the PR.

**Comment style (REQUIRED):**
Write like the repo owner does: warm, brief, plain. Say what's good, say the thing, move on. The house voice looks like: "Well done. No blockers. Upload flow reads well. Couple of small things inline." Match that tone.

- **No dashes as connectors. None.** No em dashes (—), no en dashes (–), no double-hyphen "--" standing in for a dash. Use a period or a comma. Scan every comment before posting and rewrite any dash out.
- **Plain text only. No emojis.** Convey severity in words: `Blocker:`, `Major:`, `Minor:`, `Nit:`.
- **One or two short sentences.** Point at the problem, suggest the fix if it's obvious.
- Open with a quick bit of credit when it's warranted ("Nice cleanup."), then the note.
- **Cut the AI tells:** no hedging stacks ("worth confirming", "you may want to consider"), no parenthetical self-justification, no reassurance padding.
- Ask a direct question when you mean a question.
- The summary `body` follows the same voice: lead with credit, state blockers or "no blockers," keep it to a couple of lines.

**How to post (gh api):**
- Build a JSON file in a scratch dir (not the repo) with `commit_id` (the PR head SHA), `event: "COMMENT"`, a short `body`, and a `comments` array of `{ path, line, side: "RIGHT", body }`.
- `line` MUST be the real line number in the current source file (open the file and read it; do NOT use `git diff` output line numbers), and it must be an added/context line inside a diff hunk or GitHub returns `422 "Line could not be resolved"`.
- Post: `gh api repos/muhammadov-q/team4/pulls/<pr>/reviews --method POST --input <file>.json`
- On a 422 for one comment, re-anchor that comment to a nearby changed line and retry.
- Before posting, check existing PR comments and post only what's net-new.

If there's no PR target (posting isn't possible), print the findings to the terminal and note that `--comment` was ignored.

## 4. Report
Give the user the review URL (if posted) and a one-line summary per finding. Do not apply fixes; reviewing only.
