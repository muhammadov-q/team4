# Backend for ASE project

Small FastAPI service exposing a mock `/predict` endpoint, taking in parameter an image and answering something.

## Structure

```bash
backend/
├── pyproject.toml
├── uv.lock
├── src/app/main.py          # FastAPI app
├── tests/                   # pytest tests
│   ├── conftest.py
│   └── integration/
└── bruno/                   # Bruno API tests
    ├── bruno.json
    ├── environments/local.bru
    └── predict/
```

## Setup

Install `uv` on the system the way you prefer. If you use nixos, you may use the `shell.nix` file to setup.

## Install dependencies

```bash
cd backend
uv sync
```

This create `.venv` and add everything in `uv.lock`.

## Install Bruno-cli

Via npm

```bash
npm install -g @usebruno/cli
bru --version
```

On nixos, you may found it on the packages.

## Train the k-NN

> [!IMPORTANT]
> You must train the k-nn **before** starting the API with the knn predictor. Skipping this step will result in a `FileNotFoundError`. You only need to do it once (and when you want to retrain the model).

Training take around 20 seconds on a Lenovo IdeaPad Pro 5.

```bash
cd backend
uv run src/ml/train_knn.py
```

## Run the API

Start the API with the knn predictor (requires the training step above),

```bash
cd backend
ML_PREDICTOR="knn" uv run uvicorn app.main:app --reload
```

## Run the tests

### pytest (no server needed)

```bash
cd backend
uv run pytest
```

### Bruno (needs the API)

```bash
# terminal 1
cd backend
ML_PREDICTOR="knn" uv run uvicorn app.main:app --reload

# terminal 2
cd backend/bruno
bru run --env local
```

## Database

The backend stores accounts in SQLite at `data/team4.db` (not committed). It creates the file and runs any pending migrations when it starts, so there's no setup step. Set `DATABASE_URL` to use another file; delete `data/` to start over.

After changing a model in `src/app/auth/models.py`, add a migration and read it before committing. The command compares the models with your local database, so start the backend once first:

```bash
cd backend
uv run alembic revision --autogenerate -m "describe the change"
```

More in `docs/architecture/database.md`.

## Phone capture sessions

`/capture-sessions` lets a phone send photos to the web app (the "Use your phone" QR code). Sessions
and their last photo are kept in memory, so a restart drops them, and they end 30 minutes after the
last photo. The code is in `src/app/capture/`.

## API Documentation

After running the server,

```bash
# terminal 1
cd backend
ML_PREDICTOR="knn" uv run uvicorn app.main:app --reload
```

you may find the Swagger documentation at the adress: [http://localhost:8000/docs](http://localhost:8000/docs).
