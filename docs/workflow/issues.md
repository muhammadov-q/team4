# Issues

All work is tracked as GitHub issues on `muhammadov-q/team4`, grouped into milestones. Every PR closes one issue ([[workflow/git-workflow]]).

## Shape

The issue form (`.github/ISSUE_TEMPLATE/task.yml`) has three parts:

- **What**: what exists or changes when it's done. For a user story: "As a <user>, I want <goal> so that <benefit>."
- **Why**: the problem it solves, or which milestone needs it. One or two sentences.
- **Definition of Done**: observable checks, starting with the acceptance criteria. See [[workflow/definition-of-done]].

Keep issues short: about 15 lines. If one doesn't fit, it's two issues.

## User stories

Each story in [[requirements]] (section 4, A1 to E2) becomes one issue. Keep the story ID in the title and its acceptance criteria in the Definition of Done.

## Tooling gotcha

`gh issue edit` and `gh pr edit` fail on this repository with a GraphQL error about Projects (classic). Edit through the REST API instead:

```bash
gh api -X PATCH repos/muhammadov-q/team4/issues/<n> -F body=@body.md
```
