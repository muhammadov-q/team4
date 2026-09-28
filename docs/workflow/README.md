# Workflow

How work moves from an idea to `main`. The spec's rules are in [[requirements]] (section 9.4).

```mermaid
flowchart LR
    Issue["Issue<br/>What / Why / DoD"] --> Branch["Branch<br/>feat/7-name"] --> Commits["Conventional commits"]
    Commits --> Hooks["Hooks<br/>pre-commit, pre-push"] --> PR["PR to main<br/>Closes #7"]
    PR --> Review["Review + CI"] --> Main["main"]
```

| Note                              | What it covers                                                  |
| --------------------------------- | --------------------------------------------------------------- |
| [[workflow/issues]]               | Writing issues and user stories, milestones.                    |
| [[workflow/git-workflow]]         | Branches, commits, pull requests, git hooks.                    |
| [[workflow/definition-of-done]]   | What "done" means for every story.                              |
