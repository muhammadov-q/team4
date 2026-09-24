---
name: architecture
description: Codex Lens system-architecture guidance for design decisions grounded in the spec and this codebase. Use when designing a new feature, service, pipeline step, or model integration, when weighing a structural choice (where logic lives, sync vs async job, which pattern), when reviewing a design, or when the user asks for an architecture proposal or "how should we build X".
---

# Codex Lens architecture decisions

The goal: decisions that fit the spec and what already exists, and that score on the grading criteria (SOTA models used correctly, software quality, visible team effort). The failure mode is designing in a vacuum or adding a feature that serves none of those.

## Step 1: read before deciding

- `docs/requirements.md` is the source of truth: user stories (section 4), ML rules (5), architecture and patterns (6), stack (7), repo layout (8), quality bar (9).
- `docs/adr/` holds decisions already made (0001 covers the web frontend stack). Don't relitigate one without new information; supersede it with a new ADR if you must.
- Check open issues and branches (`gh issue list`, `git branch -r`) for in-flight work before proposing anything that overlaps. The backend lives on `Backend-initialisation` until merged.

## The system in one paragraph

Docker Compose runs: a Next.js frontend (App Router, TypeScript) that only talks to the backend through its same-origin `/api` proxy; `api` (FastAPI: business logic, auth, CRUD); `inference` (FastAPI, stateless model serving, loads models from the MLflow registry); `worker` (Celery: pipeline jobs and retraining); Postgres 16 + pgvector; Redis (broker); MinIO (images); MLflow (experiments and registry). A page goes upload → preprocess → segment lines → classify script → recognize lines → word embeddings → store → notify frontend, each step a `PipelineStep`.

## House rules

1. **Patterns are graded, so use them on purpose and name them.** Strategy (`Recognizer`: TrOCR vs CTC), Pipeline / Chain of Responsibility (`PipelineStep`), Adapter (wrap Ultralytics, Kraken, Hugging Face behind our interfaces), Repository (all DB access), Factory (pick a recognizer from script class or config), Observer (job status pushed to the frontend via SSE or WebSocket). Dependency injection through FastAPI `Depends`, config through pydantic-settings.
2. **Layering.** Routes are thin; services hold logic; repositories hold DB access; no ORM calls in routes. The frontend holds no business logic and its Route Handlers are transport only.
3. **Slow work is async.** Anything that runs a model goes through a Celery job with a `Job` row (queued, running, done, failed) and status events; request handlers never block on inference. Target: a page in under 60 s on GPU, under 5 min on CPU.
4. **ML correctness is non-negotiable.** Fixed page-level train/val/test splits stored as ID lists in `ml/splits/`; the test set is never used for training or tuning; seeds set, versions pinned; every run logged to MLflow; each model has a card in `docs/models/`; the SOTA model is compared against its baseline in a results table. A new model version is promoted only if its test CER is lower.
5. **One contract, generated.** The backend's OpenAPI schema is the contract. The frontend generates its types from it (`npm run api:types`) and derives request and response types from `paths[...]`. Changing an endpoint means regenerating and fixing what the type check flags, in the same PR.
6. **Small, visible slices.** One user story per PR, each with its tests and docs, so every teammate's contribution shows in the history. Big changes get a phase plan first, smallest safe slice first, each phase shippable.

## Deliverable shape for an architecture proposal

Write it like a teammate would: what exists today (with file refs), the recommendation and why (trade-offs in prose, not a matrix of every option), which pattern it uses and where, the data and contract sketch (tables from the data model in the spec, endpoints, job types), which user story it serves, and a short "Done when" list. If it's a real decision, record it as an ADR in `docs/adr/NNNN-kebab-title.md` (Context, Decision, Consequences). If the outcome is work to schedule, file it as GitHub issues using the `github-issues` skill, one issue per shippable slice.
