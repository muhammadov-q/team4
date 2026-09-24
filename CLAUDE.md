# Codex Lens

Web app for recognizing, analyzing and understanding historical manuscripts, with a
human-in-the-loop workflow: the model proposes, the user corrects, the system learns.
MSc course project (Advanced Software Engineering, University of Bern).

The full spec (user stories, models, architecture, grading) is
[docs/requirements.md](docs/requirements.md). Read the relevant sections before feature work.

## Repo map

- `frontend/` Next.js 16 web app. Its own [CLAUDE.md](frontend/CLAUDE.md) has the frontend rules.
- `backend/` FastAPI service (branch `Backend-initialisation` until merged). `POST /predict`
  takes the multipart field `image` and returns `{prediction, model_version}`, mocked for now.
- `docs/` spec, ADRs (`docs/adr/`), later model cards (`docs/models/`).
- `.githooks/` + `scripts/install-hooks.sh` shared git hooks; each app's gate is `<app>/check.sh`.
- `.claude/` project agents, commands and skills (committed); `settings.local.json` stays personal.

## Grading decides scope

Three equal parts: pattern recognition quality (SOTA models used correctly), software quality
(user stories, CI, design patterns, tests, docs), team effort and demos. Every change should
serve at least one. Fewer features done properly beats many half-done ones.

## Workflow

- Work starts from a GitHub issue on `muhammadov-q/team4`, written as What / Why / Definition
  of Done (`.github/ISSUE_TEMPLATE/task.yml`). One issue per PR.
- Branch off `main`: `feat/<issue>-short-name` (or `fix/`, `test/`, `docs/`, `chore/`).
  Trunk-based, short-lived.
- Conventional commits: `feat(frontend): ...`, `fix(backend): ...`, `test: ...`, `docs: ...`.
- PRs to `main` follow `.github/pull_request_template.md`, `Closes #N` first. Merging needs green
  CI and one approving review. Keep PRs small so each teammate's work stays visible.
- `gh issue edit` and `gh pr edit` fail here with a Projects (classic) GraphQL error. Use REST:
  `gh api -X PATCH repos/muhammadov-q/team4/issues/<n> -F body=@file.md`.
- Slash commands: `/pr`, `/commit`, `/tidy`, `/code-review`, `/qa`, `/fable`.

## Hard rules from the spec

- Never train or tune on the test split; splits are fixed and page-level. Never commit
  datasets, model weights or secrets (`.env` stays local, `.env.example` is committed).
- No business logic in routes or UI components. Routes are thin, services hold the logic,
  repositories hold all DB access.
- Tests are written with the code, not after.
- When a requirement is ambiguous, ask, or state the assumption in the PR.
