# AgencyOS

Multi-tenant SaaS for companies and marketing agencies — quotations, promotional email, support
ticketing, and event ticketing in one workspace.

See [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md) for the product vision and [CLAUDE.md](CLAUDE.md) for
architecture, conventions, and engineering principles.

## Stack

- **Monorepo:** pnpm workspaces (`apps/*`, `packages/*`)
- **Backend:** NestJS + Prisma + PostgreSQL, self-hosted JWT auth, BullMQ + Redis
- **Frontend:** React + Vite + MUI, TanStack Query + Redux Toolkit, React Router, RHF + Zod
- **Shared:** `@agencyos/shared` — types, enums, and zod schemas used by both apps

## Layout

```text
apps/
  backend/    # NestJS API
  frontend/   # React + Vite + MUI
packages/
  shared/     # shared types / DTOs / zod schemas
```

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env files and fill in values
cp .env.example apps/backend/.env        # backend reads apps/backend/.env
#   set VITE_API_BASE_URL for the frontend (see .env.example)

# 3. Start local Postgres + Redis
pnpm db:up            # docker compose up -d

# 4. Generate Prisma client + run the first migration
pnpm --filter @agencyos/backend prisma:generate
pnpm --filter @agencyos/backend prisma:migrate

# 5. Run the apps (separate terminals)
pnpm backend:dev      # http://localhost:4000/api/v1/health
pnpm frontend:dev     # http://localhost:5173
```

## Common scripts

| Command                       | Description                   |
| ----------------------------- | ----------------------------- |
| `pnpm build`                  | Build all workspace packages  |
| `pnpm lint`                   | Lint all packages             |
| `pnpm format`                 | Prettier-format the repo      |
| `pnpm db:up` / `pnpm db:down` | Start / stop Postgres + Redis |
| `pnpm backend:dev`            | Run the API in watch mode     |
| `pnpm frontend:dev`           | Run the Vite dev server       |

## Notes

- This is an early scaffold — no feature modules yet.
- No unit tests or CI are set up yet (deliberately deferred; see CLAUDE.md).
