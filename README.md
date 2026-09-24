# Codex Lens

A web app for recognizing, analyzing and understanding historical manuscripts. The model
proposes, the user corrects, and the system learns. Built for the Advanced Software Engineering
course (MSc, University of Bern).

The full spec is [docs/requirements.md](docs/requirements.md).

## Repository

| Path        | What                                                              |
| ----------- | ----------------------------------------------------------------- |
| `frontend/` | Next.js web app ([README](frontend/README.md))                    |
| `backend/`  | FastAPI service (on `Backend-initialisation` until it's merged)   |
| `docs/`     | Spec, architecture decisions (`docs/adr/`)                        |
| `.github/`  | Issue and pull request templates                                  |

## Working on it

1. Once after cloning, turn on the shared git hooks:
   ```bash
   bash scripts/install-hooks.sh
   ```
   `pre-commit` fixes and lints the staged frontend files; `pre-push` runs the `check.sh` of each
   app you changed. Each app's README has its own setup.
2. Pick an issue, then branch off `main`: `feat/<issue>-short-name`.
3. Commit with [Conventional Commits](https://www.conventionalcommits.org): `feat(frontend): ...`,
   `fix(backend): ...`, `docs: ...`.
4. Open a PR to `main` that starts with `Closes #<issue>`. It needs green checks and one review.
