# Team4

A web app for recognizing, analyzing and understanding historical manuscripts. Built for the
Advanced Software Engineering course (MSc) at the University of Fribourg.

The full spec is [docs/requirements.md](docs/requirements.md).

## Repository

| Path        | What                                                                              |
| ----------- | --------------------------------------------------------------------------------- |
| `frontend/` | Next.js web app ([README](frontend/README.md))                                    |
| `backend/`  | FastAPI service ([README](backend/README.md))                                     |
| `docs/`     | Obsidian vault: spec, architecture, workflow, ADRs ([start here](docs/README.md)) |
| `.github/`  | Issue and pull request templates                                                  |

## Working on it

1. Once after cloning, turn on the shared git hooks. A git hook is a script that git runs on its
   own at a set moment. Ours run before each commit and each push, so lint, type and test
   failures show up on your machine before they reach CI or a reviewer.
   ```bash
   bash scripts/install-hooks.sh
   ```
   `pre-commit` fixes and lints the staged frontend files; `pre-push` runs the `check.sh` of each
   app you changed and stops the push if one fails. Skip a hook once with `--no-verify`. Each
   app's README has its own setup.
2. Pick an issue, then branch off `develop`: `feat/<issue>-short-name`.
3. Commit with [Conventional Commits](https://www.conventionalcommits.org): `feat(frontend): ...`,
   `fix(backend): ...`, `docs: ...`.
4. Open a PR to `develop` that starts with `Closes #<issue>`. It needs green checks and one review.
5. When the whole team agrees `develop` is in good shape, it goes to `main` as a release.
