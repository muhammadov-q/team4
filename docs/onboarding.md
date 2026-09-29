# Onboarding

From a fresh clone to a running app.

## You need

| Tool                  | Version                          | For                         |
| --------------------- | -------------------------------- | --------------------------- |
| git and the `gh` CLI  | any recent                       | code, issues, pull requests |
| Node.js               | 24 (`.nvmrc`)                    | the web app                 |
| Python and `uv`       | 3.13 (`backend/.python-version`) | the backend                 |

## First run

1. Turn on the shared git hooks once: `bash scripts/install-hooks.sh`. What they do is in [[workflow/git-workflow]].
2. Start the backend from `backend/`: `uv sync`, then `uv run uvicorn app.main:app --reload`. It listens on port 8000. More in `backend/README.md`.
3. Start the web app from `frontend/`: `npm install`, then `npm run dev`, and open http://localhost:3000. More in `frontend/README.md`.
4. Upload a page image. The backend answers with a mock prediction for now.

Then pick an issue and follow [[workflow/git-workflow]].
