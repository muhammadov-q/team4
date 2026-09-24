# Testing

Tests are written with the code, not after ([[workflow/definition-of-done]]). The requirements are in [[requirements]] (section 9.2).

## Layers

| Layer        | Tool                          | Where                                  | Runs in                  |
| ------------ | ----------------------------- | -------------------------------------- | ------------------------ |
| Unit         | Vitest + Testing Library      | next to the code, `*.test.ts(x)`       | `frontend/check.sh`      |
| Unit         | pytest                        | `backend/` tests                       | backend check (planned)  |
| Integration  | pytest + a real Postgres      | backend API tests (planned)            | CI (#5)                  |
| Contract     | generated types + `tsc`       | [[architecture/api-contract]]          | `frontend/check.sh`      |
| End-to-end   | Playwright                    | `frontend/e2e/`                        | on demand, needs backend |

## Frontend conventions

- Test behaviour through roles and labels (`getByRole`, `getByLabelText`), not class names or internals.
- `renderWithProviders` in `frontend/src/test/render.tsx` gives each test a fresh query client.
- Stub the network with `vi.stubGlobal('fetch', ...)`; never call a real backend from a unit test.
- `frontend/vitest.setup.ts` mocks `thinking-orbs` (jsdom has no canvas) and object URLs.
- The route handler tests run in the Node environment (`@vitest-environment node`).

## Commands

- `npm test` (or `npm run test:coverage`) in `frontend/`.
- `npm run e2e` in `frontend/` with the backend on port 8000. Playwright starts the dev server itself.

## Targets

Backend coverage at least 70%. At least one end-to-end test covering upload, process, correct and search once those stories exist; today's spec covers upload and response.
