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

## Run the API

```bash
cd backend
uv run uvicorn app.main:app --reload
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
uv run uvicorn app.main:app --reload

# terminal 2
cd backend/bruno
bru run --env local
```

## API Documentation

After running the server, 

```bash
# terminal 1
cd backend
uv run uvicorn app.main:app --reload
```

you may find the Swagger documentation at the adress: [http://localhost:8000/docs](http://localhost:8000/docs).
