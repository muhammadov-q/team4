---
description: Boot the app if needed (frontend + backend) and run the qa agent to click through a feature and report functional + design/UX findings
argument-hint: "[feature or route to test, omit to infer from the git diff]"
---

Run the browser-driven **qa** agent against the running app. Optional target from the user: **$ARGUMENTS**

## 1. Make sure both servers are up

The qa agent needs the frontend on http://localhost:3000 and the backend on http://localhost:8000 (reached through the `/api` proxy). Check first, start only what's down.

- **Frontend check:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`. Any HTTP code means it's running; a connection failure means it's down.
  - Start if down (background): `cd frontend && npm run dev`
- **Backend check:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs`.
  - Start if down (background): `cd backend && uv run uvicorn app.main:app --reload`
  - If `backend/` doesn't exist on this branch yet (it lives on `Backend-initialisation` until merged), run it from a worktree instead: `git worktree add ../team4-backend origin/Backend-initialisation`, then start it from `../team4-backend/backend`. Tell the user you did this.

Start each down server with `run_in_background: true`. If you started either, poll its URL in a short until-loop until it responds before continuing. Leave servers running when the agent finishes; the user may want them up.

## 2. Run the qa agent

Launch the **qa** agent (subagent_type: `qa`), synchronously (`run_in_background: false`), with a prompt that:
- Passes the user's target if `$ARGUMENTS` is non-empty ("Test: $ARGUMENTS"); otherwise tells it to infer the feature from the current git branch/diff.
- Asks for the fix-ready ranked findings list (functional + visual + ux + a11y + copy) with file:line, measured evidence, and suggested fixes, checked in both light and dark mode.

## 3. Relay the report

Present the agent's findings as-is (ranked, most severe first). Do not start fixing anything; this command only tests and reports. Note at the end that fixes weren't applied and the user can ask for any of them.
