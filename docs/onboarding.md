# Onboarding

From a fresh clone to a running app. Terms you don't know are in [[glossary]]; what we're building is in [[requirements]].

## Prerequisites

| Tool              | Version                        | Used for                               |
| ----------------- | ------------------------------ | -------------------------------------- |
| git + `gh` CLI    | any recent                     | code, issues, pull requests            |
| Node.js           | 24 LTS (`.nvmrc` at the root)  | the web app                            |
| Python + `uv`     | 3.13 (`backend/.python-version`) | the backend                          |
| Docker            | optional                       | building images, later docker-compose  |
| Obsidian          | optional                       | reading this vault with its graph      |

## First run

1. Clone the repo and turn on the shared hooks once: `bash scripts/install-hooks.sh`. See [[workflow/git-workflow#Git hooks]] for what they do.
2. Start the backend (see `backend/README.md`): `uv sync`, then `uv run uvicorn app.main:app --reload` from `backend/`. It listens on port 8000.
3. Start the web app: `npm install` and `npm run dev` from `frontend/`, then open http://localhost:3000.
4. Upload a page image. The mock model answers through the proxy described in [[architecture/frontend]].

## Your first contribution

1. Pick or write an issue: [[workflow/issues]].
2. Branch, commit and open a PR: [[workflow/git-workflow]].
3. Check it against the [[workflow/definition-of-done]].

Before touching models or data, read [[ml/README|the ML rules]]. Breaking them costs grade points no matter how good the model is.
