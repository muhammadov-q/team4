# Testing

Tests are written with the code, in the same PR ([[workflow/definition-of-done]]).

| What                          | Tool                    | Where                                                | How it runs                                                |
| ----------------------------- | ----------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Frontend units and components | Vitest, Testing Library | next to the code, `*.test.ts(x)`                     | `frontend/check.sh`, so on pre-push and in CI              |
| Frontend types vs the backend | generated types, `tsc`  | [[architecture/api-contract]]                        | `frontend/check.sh`                                        |
| Backend units and endpoints   | pytest                  | `backend/src/app/tests/` and `backend/src/ml/tests/` | `uv run pytest` in `backend/`, by hand for now             |
| Backend API                   | Bruno                   | `backend/bruno/`                                     | `bru run --env local` in `backend/bruno/`, backend running |
| End to end                    | Playwright              | `frontend/e2e/`                                      | `npm run e2e` in `frontend/`, backend on port 8000         |

The backend has no `check.sh` yet, so its tests don't run on pre-push or in CI.

## Frontend conventions

- Query by role and label (`getByRole`, `getByLabelText`), not by class names.
- `renderWithProviders` in `frontend/src/test/render.tsx` gives each test a fresh query client.
- Stub the network with `vi.stubGlobal('fetch', ...)`. Unit tests never call a real backend.
