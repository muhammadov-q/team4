# Glossary

Words we use in the code and the notes. Add a term when it first shows up in a PR.

| Term       | Meaning                                                                                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Predictor  | A backend class that takes an image and returns a prediction. Each one implements `AbstractPredictor`; `DummyPredictor` is the mock we run today. See [[architecture/design-patterns]]. |
| Proxy      | The Next.js route that forwards the browser's `/api/*` calls to the backend. See [[architecture/frontend]].                                                                             |
| API types  | `frontend/src/lib/api/schema.ts`, generated from the backend's OpenAPI schema. See [[architecture/api-contract]].                                                                       |
| `check.sh` | An app's check script (lint, types, tests). The pre-push hook and CI run it. See [[workflow/git-workflow]].                                                                             |
