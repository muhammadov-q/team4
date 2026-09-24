---
name: github-issues
description: Manage Codex Lens work items as GitHub issues on muhammadov-q/team4: list milestones and issues, view, create, edit bodies, assign, comment, close. Use whenever the user mentions issues, tickets, user stories, milestones, or asks to file or update a ticket.
---

# GitHub issues (muhammadov-q/team4)

All work items for Codex Lens are GitHub issues on `muhammadov-q/team4`. Each user story from `docs/requirements.md` becomes one issue, and every PR closes one.

## Commands

Reads work with plain `gh`:
```
gh issue list --repo muhammadov-q/team4 --state open
gh issue list --repo muhammadov-q/team4 --assignee @me
gh issue list --repo muhammadov-q/team4 --milestone "Milestone 1"
gh issue view 7 --repo muhammadov-q/team4
gh api repos/muhammadov-q/team4/milestones --jq '.[] | "\(.number) \(.title) due \(.due_on) open=\(.open_issues)"'
```

Writes: `gh issue edit` fails on this repo with a GraphQL error about Projects (classic) being deprecated (it's a field `gh` requests internally, not the edit itself). Use REST for edits; `gh issue create` and `gh issue comment` work:
```
gh issue create --repo muhammadov-q/team4 --title "..." --body-file /tmp/body.md --assignee <login> --milestone "Milestone 1"
gh api -X PATCH repos/muhammadov-q/team4/issues/7 -F body=@/tmp/body.md
gh api -X PATCH repos/muhammadov-q/team4/issues/7 -f title="..." -f state=closed
gh api -X POST repos/muhammadov-q/team4/issues/7/assignees -f 'assignees[]=<login>'
gh issue comment 7 --repo muhammadov-q/team4 --body "..."
```
Write bodies to a scratch file (never the repo) and pass the file. Before overwriting an existing body, read it and keep everything it says that still holds.

## Issue shape: What / Why / Definition of Done

This matches `.github/ISSUE_TEMPLATE/task.yml`, so issues made by hand and from the form look the same:

```
### What

<1-3 sentences or a few bullets: what exists or changes when this is done.
For a user story: As a <user>, I want <goal> so that <benefit>.>

### Why

<1-2 sentences: the problem it solves, who it helps, or which milestone needs it.>

### Definition of Done

- [ ] <acceptance criterion, observable>
- [ ] <acceptance criterion, observable>
- [ ] Tests written with the code and passing in CI
```

## Writing issues that read human

- **Title**: one plain line, outcome first ("Create web frontend", "Detect text lines on upload"). No emojis, no em dashes.
- **Short.** A normal issue fits in about 15 lines. If it won't, it's two issues.
- **Definition of Done items are checks someone can see**: "Characters below the threshold show in red", not "Implement highlighting". 2-5 items plus the quality defaults that apply.
- **Metadata goes in fields**: assignee, milestone and labels are set on the issue, not restated in prose.
- Keep the spec's acceptance criteria when an issue implements a user story (A1, B3, ...), and name the story in the title or the What.
- **Never**: "This ticket tracks...", heading pyramids on a 5-line issue, ALL CAPS urgency, severity emojis, em dashes, or pasted AI-report structure.

Before creating an issue from analysis or review output, rewrite it in this voice; don't paste raw findings.
