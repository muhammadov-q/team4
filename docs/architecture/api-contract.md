# API contract

The backend's OpenAPI schema is the contract between the apps. FastAPI generates it, and the frontend generates its types from it. With the backend running, Swagger UI is at http://localhost:8000/docs.

Check on the Swagger documentation or on the bruno test to have updated infos about the return value of the routes.

## Keeping the frontend in sync

- `frontend/src/lib/api/schema.ts` is generated with `npm run api:types`. Never edit it by hand.
- Endpoint modules derive their types from `paths[...]` (see `frontend/src/lib/api/predict.ts`), so a renamed route, field or response key fails `npm run type-check` instead of failing at runtime.
- `npm run api:check` fails when the committed types don't match a running backend. It isn't in `check.sh` because it needs the backend up.
