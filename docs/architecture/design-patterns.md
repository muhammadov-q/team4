# Design patterns

The spec grades design patterns, so we use them on purpose and write down where. The list comes from [[requirements]] (section 6.3). Each row says where the pattern lives, or will live.

| Pattern                         | Where                                                                                      | Story        |
| ------------------------------- | ------------------------------------------------------------------------------------------ | ------------ |
| Strategy                        | `Recognizer` interface with `TrOCRRecognizer` and `CTCRecognizer` (planned, backend).      | B2           |
| Pipeline / Chain of Responsibility | `PipelineStep` chain run by the worker ([[architecture/overview#Recognition pipeline]]). | B1-B5        |
| Adapter                         | Ultralytics, Kraken and Hugging Face behind our own interfaces (planned). On the frontend, `LoadingOrb` adapts `thinking-orbs`, and the `/api` proxy adapts the backend to one origin. | B1, B2 |
| Repository                      | All database access in repository classes; routes never touch the ORM (planned).          | all          |
| Factory                         | Picks a recognizer from the script class or config (planned).                              | B5           |
| Observer                        | Job status pushed to the frontend over SSE or WebSocket (planned).                         | B4           |

## Principles we hold to

- **SOLID.** Small interfaces, dependencies pointing inward.
- **Dependency injection** through FastAPI `Depends`, so tests swap real models for fakes.
- **Configuration from the environment** through pydantic-settings, with a committed `.env.example`.
- **Thin edges.** Routes and UI components delegate; services hold the logic. On the frontend, `frontend/src/lib/api/` and `frontend/src/hooks/` play that role.

When a pattern lands in code, replace "planned" with the real file and symbol.
