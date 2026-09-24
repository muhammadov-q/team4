@AGENTS.md

# Frontend

Run in `frontend/`: `npm run dev` (:3000), `npm run pre-commit` (the full gate: lint, format,
type check, unit tests), `npm test`, `npm run e2e` (needs the backend on :8000),
`npm run api:types` / `npm run api:check`.

## Rules

- Backend calls go through `src/lib/api/*` (`apiRequest`), which hits the same-origin proxy
  `/api/*` (`src/app/api/[...path]/route.ts`). No raw `fetch()` to the backend, no hardcoded
  URLs. The proxy is transport only; business logic belongs in the backend.
- Request and response types come from `src/lib/api/schema.ts`, generated from the backend's
  OpenAPI schema. Never edit it by hand. Derive types from `paths[...]` like
  `src/lib/api/predict.ts` does; after a backend change, run `npm run api:types` and let the
  type check show what broke.
- Server state goes through TanStack Query hooks in `src/hooks/` (`useMutation` / `useQuery`),
  not fetches in effects.
- UI primitives are shadcn (radix-nova) in `src/components/ui/`, added with
  `npx shadcn@latest add <name>`. Class merging uses `cn` from the `cn` package.
- Loaders: `LoadingOrb` (`src/components/ui/loading-orb.tsx`, the only import of
  `thinking-orbs`) for waits the user watches; `Skeleton` (sheen, not pulse) shaped like the
  content it replaces; a route's `loading.tsx` mirrors its first paint.
- Both themes, always: tokens (`bg-background`, `bg-card`, `text-muted-foreground`,
  `text-primary`, `text-destructive`, `text-rubric`...), never raw hex, white or black. Check
  light and dark.
- Machine output is always labelled as machine-generated.
- UI copy: sentence case, plain verbs, no em dashes.
- React Compiler is on. Don't add `useMemo`/`useCallback` just for speed, and follow the
  react-hooks lint rules (no setState straight in effects, no ref reads during render).
- Tests live next to the code (`*.test.ts(x)`), Vitest + Testing Library, querying by role and
  label. `src/test/render.tsx` has `renderWithProviders`. E2E specs are in `e2e/`.
- Comments: default to none; keep short ones that explain a non-obvious why.
