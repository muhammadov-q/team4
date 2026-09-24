# 1. Web frontend stack

- Status: accepted
- Date: 2026-09-23
- Issue: #7
- Related: [[architecture/frontend]], [[architecture/api-contract]], [[architecture/testing]]

## Context

Team4 needs a web app for uploading manuscript pages, viewing them with overlays, correcting
transcriptions and showing model metrics (spec sections 4, 7 and 10). It talks to a FastAPI
backend that is still being built, so the contract between them will change often. The team
is graded on software quality, so the setup has to be testable, typed and documented from day one.

## Decision

- **Next.js 16 (App Router) + TypeScript** over a Vite SPA. File-based routing, a built-in
  server for the backend proxy, and first-class support for the stack the spec names (shadcn/ui,
  TanStack Query, OpenSeadragon via `dynamic(..., { ssr: false })`). React Compiler and typed
  routes are on.
- **Same-origin proxy** (`src/app/api/[...path]/route.ts`) instead of calling the backend from the
  browser. The browser only ever sees `/api/*`, so the backend needs no CORS, the backend URL is
  a runtime setting (`API_INTERNAL_URL`), and cookie auth (story E1) stays same-origin. A Route
  Handler rather than a `next.config` rewrite: rewrites pass FastAPI's redirects through to the
  browser, which then leaves the origin. The proxy is transport only.
- **Types generated from the backend's OpenAPI schema** (`openapi-typescript`, `npm run api:types`).
  Code derives request and response types from `paths[...]`, so a backend change that breaks the
  frontend fails `npm run type-check` instead of failing at runtime.
- **TanStack Query** for all server state; **Tailwind CSS 4 + shadcn/ui (radix-nova)** for UI,
  with theme tokens for light and dark mode.
- **Vitest + Testing Library** for unit and component tests, **Playwright** for end-to-end tests.
- **ESLint (eslint-config-next) + Prettier** with the Tailwind plugin, enforced by
  `frontend/check.sh`, which runs from a pre-push hook today and from CI later (#5).
- **npm** and **Node 24 LTS** (`.nvmrc`); a multi-stage Docker image built from Next's
  `standalone` output for docker-compose.

## Consequences

- Every backend call pays one extra hop through the Next.js server. It's negligible locally,
  and it's the price of no CORS and a runtime-configurable backend URL.
- `src/lib/api/schema.ts` is generated and committed. Whoever changes an endpoint regenerates it
  and fixes what the type check flags in the same PR; `npm run api:check` catches drift.
- Uploads are buffered in the proxy (up to 50 MB per page). If pages ever get much larger,
  switch the proxy to streaming, which means redirects can't be followed server-side anymore.
- ESLint stays on major version 9 until eslint-config-next's plugins support 10.
