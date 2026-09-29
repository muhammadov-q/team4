# API contract

The backend's OpenAPI schema is the contract between the apps. FastAPI generates it, and the frontend generates its types from it. With the backend running, Swagger UI is at http://localhost:8000/docs.

## `POST /predict` (as of 2026-09)

Takes one image as the multipart field `image`. The model behind it is a mock.

| Status | Body                                                 | When                                              |
| ------ | ---------------------------------------------------- | ------------------------------------------------- |
| 200    | `{ "prediction": number, "model_version": string }`  | The image was accepted.                           |
| 400    | `{ "detail": "Empty file" }`                         | The file has no bytes.                            |
| 413    | `{ "detail": "File too large. Max size is 30 MB." }` | The file is over 30 MB.                           |
| 415    | `{ "detail": "File must be an image" }`              | The content type isn't `image/*`.                 |
| 422    | `{ "detail": [{ "msg": ..., "loc": ... }] }`         | FastAPI validation, e.g. the field is missing.    |
| 502    | `{ "detail": "..." }`                                | From the frontend proxy when the backend is down. |

## Keeping the frontend in sync

- `frontend/src/lib/api/schema.ts` is generated with `npm run api:types`. Never edit it by hand.
- Endpoint modules derive their types from `paths[...]` (see `frontend/src/lib/api/predict.ts`), so a renamed route, field or response key fails `npm run type-check` instead of failing at runtime.
- `npm run api:check` fails when the committed types don't match a running backend. It isn't in `check.sh` because it needs the backend up.
