# CLAUDE.md

## Project Overview

Feedaka is a personal RSS/Atom feed reader. Monorepo with a Go backend and React/TypeScript frontend, communicating via GraphQL.

## Tech Stack

- **Backend:** Go 1.24+, Echo v4, gqlgen (GraphQL), SQLite with sqlc
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, urql (GraphQL client), wouter (routing)
- **Task Runner:** [just](https://github.com/casey/just) (justfiles at root and `backend/`)
- **Linting/Formatting:** Biome (frontend), go fmt (backend)
- **Code Generation:** gqlgen + sqlc (backend), graphql-codegen (frontend)

## Common Commands

### Build & Dev

```sh
just build       # Build both frontend and backend
just dev         # Start dev servers (frontend + backend)
just fmt         # Format all code
just check       # Type-check all code
just generate    # Regenerate GraphQL and DB code
```

### Frontend (run from `frontend/`)

```sh
npm run build    # Build with TypeScript + Vite
npm run dev      # Start Vite dev server
npm run check    # Run Biome checks
npm run fix      # Auto-fix with Biome
npm run generate # Generate GraphQL types
```

### Backend (run from `backend/`)

```sh
just build       # Compile Go binary
just fmt         # go fmt
just check       # Verify build compiles
just generate    # Run go generate (gqlgen + sqlc)
```

## Code Generation

Generated files — do not edit by hand:

- `backend/graphql/generated.go` — gqlgen output
- `backend/graphql/model/generated.go` — gqlgen models
- `backend/db/users.sql.go`, `backend/db/articles.sql.go`, `backend/db/feeds.sql.go` — sqlc output
- `frontend/src/graphql/generated/` — graphql-codegen output

Regenerate with `just generate` from the repo root.

## Project Structure

```
graphql/schema.graphql    # Shared GraphQL schema (source of truth)
backend/
  cmd/                    # CLI commands (serve, migrate, create-user)
  db/                     # Database layer, migrations, sqlc queries
  graphql/resolver/       # GraphQL resolvers (edit these for backend logic)
  feed/                   # Feed fetching logic
  auth/                   # Authentication
  config/                 # Configuration
  gqlgen.yml              # gqlgen config
  sqlc.yaml               # sqlc config
frontend/
  src/
    components/           # React components
    pages/                # Page components
    contexts/             # React contexts (auth)
    graphql/              # GraphQL queries/mutations
    services/             # GraphQL client setup
  biome.json              # Biome config
```

## CI

CI (`just check`, `just build`, `just fmt`) runs on pushes and PRs to main. Formatting changes must be committed before pushing — CI fails if `just fmt` produces uncommitted changes.
