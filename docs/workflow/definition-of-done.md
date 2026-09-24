# Definition of Done

A story is done when all of these hold. From [[requirements]] (section 13); the PR template repeats it as a checklist ([[workflow/git-workflow]]).

- The acceptance criteria in the issue are met ([[workflow/issues]]).
- Tests are written with the code and pass locally and in CI ([[architecture/testing]]).
- Types and lint are clean.
- Docs are updated where relevant: the app's README, [[architecture/api-contract]], a model card in [[models/README|models]], or a new ADR in [[adr/README|adr]].
- The PR is reviewed by a teammate and merged.

## Frontend specifics

- Backend calls go through `frontend/src/lib/api/` with generated types, never raw `fetch` or hand-written response types.
- UI works in light and dark mode, uses theme tokens only, and labels machine output as machine-generated.
- UI copy is sentence case with no em dashes.

## ML specifics

- Test-set metrics only, logged to MLflow, compared against the baseline ([[ml/README]]).
