# CLAUDE.md

## Project Overview

Feedaka is a personal RSS/Atom feed reader. Monorepo with a Go backend and React/TypeScript frontend, communicating via REST API.

## Tech Stack

- **Backend:** Go 1.24+, Echo v4, oapi-codegen (OpenAPI server stubs), SQLite with sqlc
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, openapi-fetch (REST client), wouter (routing)
- **API Schema:** TypeSpec → OpenAPI 3.x → oapi-codegen (Go) + openapi-typescript (TS)
- **Task Runner:** [just](https://github.com/casey/just) (justfiles at root and `backend/`)
- **Linting/Formatting:** Biome (frontend), go fmt (backend)
- **Code Generation:** TypeSpec + oapi-codegen + openapi-typescript + sqlc

## Common Commands

### Build & Dev

```sh
just build       # Build both frontend and backend
just dev         # Start dev servers (frontend + backend)
just fmt         # Format all code
just check       # Type-check all code
just generate    # Regenerate API and DB code (TypeSpec → OpenAPI → Go/TS)
```

### Frontend (run from `frontend/`)

```sh
npm run build    # Build with TypeScript + Vite
npm run dev      # Start Vite dev server
npm run check    # Run Biome checks
npm run fix      # Auto-fix with Biome
npm run generate # Generate TypeScript types from OpenAPI
```

### Backend (run from `backend/`)

```sh
just build       # Compile Go binary
just fmt         # go fmt
just check       # Verify build compiles
just generate    # Run go generate (oapi-codegen + sqlc)
```

## Code Generation

Generated files — do not edit by hand:

- `openapi/openapi.yaml` — TypeSpec output (OpenAPI 3.x)
- `backend/api/generated.go` — oapi-codegen output (Echo server stubs + models)
- `backend/db/users.sql.go`, `backend/db/articles.sql.go`, `backend/db/feeds.sql.go` — sqlc output
- `frontend/src/api/generated.d.ts` — openapi-typescript output

Regenerate with `just generate` from the repo root.

## Project Structure

```
typespec/
  main.tsp                # API schema definition (source of truth)
  tspconfig.yaml          # TypeSpec compiler config
openapi/
  openapi.yaml            # Generated OpenAPI 3.x spec
backend/
  cmd/                    # CLI commands (serve, migrate, create-user)
  api/                    # REST API handlers + generated server stubs
  db/                     # Database layer, migrations, sqlc queries
  feed/                   # Feed fetching logic
  auth/                   # Authentication
  config/                 # Configuration
  context/                # Context helpers
  sqlc.yaml               # sqlc config
frontend/
  src/
    api/                  # Generated TypeScript types
    components/           # React components
    pages/                # Page components
    contexts/             # React contexts (auth)
    hooks/                # Custom hooks
    services/             # API client setup
  biome.json              # Biome config
```

## CI

CI (`just check`, `just build`, `just fmt`) runs on pushes and PRs to main. Formatting changes must be committed before pushing — CI fails if `just fmt` produces uncommitted changes.
