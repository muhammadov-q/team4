# Git workflow

`develop` is where work comes together. `main` only gets releases: when the whole team agrees `develop` is in good shape, it's merged into `main`. Work starts from an issue ([[workflow/issues]]) and ends at the [[workflow/definition-of-done]].

## Branches and commits

- Branch off `develop`: `feat/<issue>-short-name`, or `fix/`, `test/`, `docs/`, `chore/`.
- Commits follow Conventional Commits: `feat(frontend): ...`, `fix(backend): ...`, `docs: ...`.

## Pull requests

- Open the PR to `develop`. The body follows `.github/pull_request_template.md` and starts with `Closes #<issue>`.
- Merging needs green checks and one approving review.
- Keep PRs small, so everyone's work stays visible.

## Git hooks

Turn them on once per clone with `bash scripts/install-hooks.sh`.

- pre-commit fixes and lints the staged frontend files (ESLint and Prettier) and stops the commit on errors it can't fix.
- pre-push runs the `check.sh` of each area the push changes and stops the push if one fails. Today that's `frontend/check.sh` and `docs/check.sh`; the backend joins when it has one.
- Skip a hook once with `--no-verify`.

## CI

`.github/workflows/ci.yml` runs the same `check.sh` scripts on every pull request and on pushes to `develop` and `main`.
