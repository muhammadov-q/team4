# Codex Lens — Project Requirements

> Context file for AI coding agents. Read fully before writing code.
> University course project: Advanced Software Engineering (MSc, University of Bern).
> Placeholders to fill in: `[TEAM_SIZE]`, `[DEADLINE]`, `[REPO_URL]`.

---

## 1. Goal

Build a **web-based application for recognizing, analyzing, and understanding historical manuscripts** using **state-of-the-art pattern recognition models**, with a human-in-the-loop correction workflow.

Core idea: **the model proposes, the user corrects, and the system learns.**

## 2. Grading Criteria (optimize for these)

The team grade is split into three equal parts:

1. **Pattern recognition quality (33%)**: SOTA models, used correctly (proper splits, metrics, no data leakage), and well-designed user interaction with model output.
2. **Software quality (33%)**: user stories, continuous integration, design principles and patterns, testing, and documentation.
3. **Team effort and presentations (33%)**: visible contributions from every member, plus demos.

Every feature must contribute to at least one of these criteria. Prefer fewer features done properly over many half-done ones.

## 3. Users

- **Historian / scholar**: transcribes and studies manuscripts and needs accurate text plus search.
- **Student**: reads manuscripts with help (expansion and translation).
- **Admin / ML engineer**: manages models, triggers retraining, and views metrics.

## 4. User Stories

Format: *As a [user], I want [goal] so that [benefit].* Each story needs acceptance criteria (AC) and becomes one GitHub Issue.

### Epic A — Manuscript management
- **A1.** As a historian, I want to upload page images (JPG/PNG/TIFF) so that I can process them.
  - AC: The upload is validated for type and size (≤ 50 MB), stored in object storage, and shows a thumbnail.
- **A2.** As a historian, I want to import a page via an IIIF manifest URL (e.g., e-codices) so that I don't need to download images.
  - AC: The manifest is parsed and pages are listed and importable.
- **A3.** As a user, I want to organize pages into manuscripts (collections) so that related pages stay together.

### Epic B — Recognition pipeline
- **B1.** As a historian, I want text lines detected automatically so that I don't have to mark them by hand.
  - AC: Polygons are overlaid on the viewer, and the user can add, delete, or adjust lines.
- **B2.** As a historian, I want each line transcribed automatically so that I get a draft text.
  - AC: The text is shown next to the line image, with per-character confidence stored.
- **B3.** As a historian, I want low-confidence characters highlighted so that I know what to check.
  - AC: Characters below a configurable threshold are shown in red.
- **B4.** As a user, I want to see processing progress so that I know when results are ready.
  - AC: The job status (queued, running, done, failed) updates without a page reload.
- **B5.** As a user, I want the script type and language detected so that the right model is used.
  - AC: Classes are Latin/Carolingian and Middle High German/Gothic, shown with a confidence score.

### Epic C — Correction and learning
- **C1.** As a historian, I want to edit transcriptions line by line so that I can fix errors.
  - AC: Edits autosave, and the history of each line is kept.
- **C2.** As an admin, I want corrected lines exported as a training set so that models can be retrained.
- **C3.** As an admin, I want to trigger retraining and compare model versions so that I promote only better models.
  - AC: A new model is evaluated on a fixed test set and promoted only if its CER is lower.
- **C4.** As a user, I want a dashboard of model metrics over versions so that improvement is visible.

### Epic D — Search and analysis
- **D1.** As a historian, I want to select a word image and find visually similar words across a collection (keyword spotting) so that I can search without a full transcription.
  - AC: Results are ranked by similarity, and clicking a result jumps to its location on the page.
- **D2.** As a user, I want full-text search over transcriptions.
- **D3.** As a student, I want abbreviations expanded (e.g., "dñs" → "dominus") and an optional modern translation so that I can understand the text.
  - AC: Output is clearly marked as machine-generated.
- **D4.** As a user, I want clicking a word in the text to highlight it on the image (and vice versa).

### Epic E — Users and access
- **E1.** As a user, I want to register and log in so that my work is saved.
- **E2.** As an admin, I want role-based access (user/admin) so that only admins can retrain models.

## 5. Pattern Recognition Requirements

### 5.1 Models

| Task | Primary (SOTA) | Baseline / comparison | Metric |
|---|---|---|---|
| Line segmentation | YOLOv8/v11-seg (Ultralytics), fine-tuned | Kraken segmenter (pretrained) | mAP@0.5, IoU |
| Line recognition (HTR) | TrOCR, fine-tuned (Hugging Face) | CNN-BiLSTM-CTC trained from scratch | CER, WER |
| Script/language classification | EfficientNet / ResNet, fine-tuned | — | Accuracy, F1, confusion matrix |
| Keyword spotting | PHOCNet or DINOv2 embeddings + pgvector | Simple CNN embeddings | mAP |
| Abbreviation expansion / translation (optional) | LLM API | — | Qualitative examples |

### 5.2 Datasets
- **Saint Gall**: Latin, Carolingian minuscule.
- **Parzival**: Middle High German, Gothic script.
- **Washington**: English, used as an optional benchmark.
- Verify each dataset's license and usage terms before use. Do not commit datasets to git; track them with DVC.

### 5.3 "Used correctly" rules (mandatory)
- Use fixed train/val/test splits, stored in the repo as ID lists. Split at the **page level** so lines from one page never appear in two splits.
- The test set is never used for training or hyperparameter tuning.
- Report metrics on the test set only, for every model version.
- Log all experiments (params, metrics, artifacts) to MLflow.
- Set seeds for reproducibility, and pin library versions.
- Each model has a **model card** (`docs/models/<name>.md`) covering data, training setup, metrics, limitations, and intended use.
- Compare the SOTA model against the baseline in a results table.

### 5.4 Target metrics (initial, adjust after baseline)
- HTR CER < 10% on the Saint Gall test set.
- Segmentation mAP@0.5 > 0.85.
- Classifier accuracy > 95%.

## 6. Architecture

### 6.1 Services (docker-compose)
```
frontend    Next.js (App Router, TypeScript)
api         FastAPI: business logic, auth, CRUD
inference   FastAPI: model serving only (stateless, loads models from MLflow registry)
worker      Celery: pipeline jobs + retraining
postgres    PostgreSQL 16 + pgvector
redis       Celery broker + result backend
minio       S3-compatible image storage
mlflow      Experiment tracking + model registry
```

### 6.2 Processing pipeline
```
upload → preprocess → segment lines → classify script → recognize lines
       → compute word embeddings → store results → notify frontend
```
Each step is an independent, testable class implementing a common `PipelineStep` interface.

### 6.3 Design patterns (use and document explicitly)
- **Strategy**: interchangeable recognizers (`TrOCRRecognizer`, `CTCRecognizer`) behind a `Recognizer` interface.
- **Pipeline / Chain of Responsibility**: `PipelineStep` chain.
- **Adapter**: wrap third-party libraries (Ultralytics, Kraken, Hugging Face) behind project interfaces.
- **Repository**: all DB access goes through repository classes. No ORM calls in routes.
- **Factory**: create models or recognizers based on script classification or config.
- **Observer**: job status events are pushed to the frontend (SSE or WebSocket).
- Apply SOLID principles, dependency injection via FastAPI `Depends`, and configuration via environment variables (pydantic-settings).

### 6.4 Core data model
- `User`(id, email, password_hash, role)
- `Manuscript`(id, title, owner_id, source, iiif_manifest_url?)
- `Page`(id, manuscript_id, image_key, width, height, status)
- `Line`(id, page_id, polygon, order_index)
- `Transcription`(id, line_id, text, char_confidences, model_version, is_corrected, updated_by, updated_at)
- `WordRegion`(id, line_id, bbox, embedding vector)
- `Job`(id, page_id, type, status, error, created_at, finished_at)
- `ModelVersion`(id, task, mlflow_run_id, metrics, is_active)

## 7. Tech Stack

- **Frontend**: Next.js + TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, OpenSeadragon (load with `dynamic(..., { ssr: false })`), Recharts. The frontend calls the FastAPI backend only; business logic stays out of Next.js route handlers.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, Celery, Redis.
- **ML**: PyTorch, Hugging Face Transformers, Ultralytics, torchvision, OpenCV, jiwer, torchmetrics.
- **Storage**: PostgreSQL + pgvector, MinIO.
- **MLOps**: MLflow, DVC.
- **Tooling**: uv or Poetry, Ruff, mypy, pytest, ESLint, Prettier, Vitest, Playwright, pre-commit.

## 8. Repository Structure

```
/
├── frontend/                 Next.js app
├── backend/
│   ├── app/
│   │   ├── api/              routes (thin)
│   │   ├── services/         business logic
│   │   ├── repositories/     DB access
│   │   ├── models/           SQLAlchemy models
│   │   ├── schemas/          Pydantic schemas
│   │   └── core/             config, auth, DI
│   ├── alembic/
│   └── tests/
├── inference/                model-serving service
├── ml/
│   ├── pipeline/             PipelineStep implementations
│   ├── training/             training scripts per task
│   ├── evaluation/           metric scripts
│   └── splits/               train/val/test ID lists
├── worker/                   Celery tasks
├── docs/
│   ├── architecture.md       + diagrams (Mermaid)
│   ├── models/               model cards
│   ├── adr/                  architecture decision records
│   └── meetings/             meeting notes
├── docker-compose.yml
├── .github/workflows/
└── README.md
```

## 9. Software Quality Requirements

### 9.1 Continuous integration (GitHub Actions, on every PR)
- Lint and format checks: Ruff, ESLint, Prettier.
- Type checks: mypy, `tsc --noEmit`.
- Backend tests with pytest, against a real Postgres service container.
- Frontend unit tests with Vitest.
- Docker images build successfully.
- **ML regression check**: run evaluation on a small fixed sample, and fail if CER exceeds the threshold.
- Merging to `main` requires green CI and one approving review.

### 9.2 Testing
- Unit tests for every service, repository, and pipeline step, with models mocked where needed.
- Integration tests for API endpoints.
- Contract tests for inference service inputs and outputs.
- At least one Playwright end-to-end test: upload → process → correct → search.
- Coverage target: backend ≥ 70%.

### 9.3 Documentation
- A README with a one-command setup (`docker compose up`), plus screenshots.
- An architecture diagram and a pipeline diagram (Mermaid).
- An OpenAPI spec (auto-generated) with example requests.
- Model cards for every deployed model.
- ADRs for major decisions (e.g., "Next.js vs Vite", "pgvector vs a separate vector DB").

### 9.4 Git workflow
- Trunk-based development with short-lived feature branches: `feat/<issue-id>-short-name`.
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`).
- Every PR links an issue and is reviewed by a teammate.

## 10. Non-Functional Requirements

- **Performance**: a single page is processed in under 60 s on a GPU and under 5 min on a CPU. The UI stays responsive because processing is async.
- **Security**: passwords hashed with argon2/bcrypt, JWT auth, file-type validation, no secrets in the repo (use `.env` with a committed `.env.example`).
- **Usability**: deep zoom with overlays, keyboard navigation in the editor, and a clear distinction between machine and human text.
- **Reproducibility**: pinned dependencies, seeded training, DVC-tracked data.
- **Portability**: the whole system runs locally with Docker Compose. A GPU is optional for inference.

## 11. Out of Scope

- Mobile app.
- Real-time multi-user co-editing (basic ownership is enough).
- Training on datasets with unclear licenses.
- Production cloud deployment (a local or university server is sufficient).

## 12. Milestones

| Phase | Deliverable |
|---|---|
| M1: Setup | Repo, CI, docker-compose skeleton, user stories on the board, dataset splits |
| M2: Baseline | Upload + viewer, Kraken segmentation, CTC baseline, first CER numbers |
| M3: SOTA | Fine-tuned YOLO-seg + TrOCR, classifier, results table vs baseline → **Presentation 1** |
| M4: Interaction | Correction editor, confidence highlighting, word ↔ image linking |
| M5: Learning + search | Retraining loop, metrics dashboard, keyword spotting |
| M6: Polish | E2E tests, docs, model cards, demo script → **Presentation 2** |

## 13. Definition of Done (per story)

- The acceptance criteria are met.
- Tests are written and passing in CI.
- Types and lint are clean.
- Docs are updated (README, API, or model card as relevant).
- The PR is reviewed and merged.

## 14. Instructions for AI Agents

- Implement **one user story per task**. Reference the story ID in commits and PRs.
- Follow the repository structure and design patterns above. Don't put business logic in routes or UI components.
- Write tests together with the code, not afterwards.
- Never use the test split for training or tuning. Never commit datasets, model weights, or secrets.
- Prefer existing, well-maintained libraries over custom implementations, except for the from-scratch baseline model.
- When a requirement is ambiguous, ask rather than guess, or state the assumption in the PR description.
- Keep changes small and reviewable, so that each teammate's contribution stays visible.

---

Related notes: [[architecture/overview]], [[ml/README|ML rules]], [[workflow/definition-of-done]], [[glossary]].
