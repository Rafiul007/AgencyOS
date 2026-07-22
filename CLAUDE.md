# CLAUDE.md — AgencyOS

Guidance for Claude Code when working in this repository. Read this before making changes.

See [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md) for the full product vision and feature list.

---

## What this is

**AgencyOS** — a multi-tenant SaaS platform for companies and marketing agencies. One workspace to
create digital memos & quotations, send promotional email, run a support ticketing system, and sell
tickets to marketing events. Confirmed additional modules: CRM Lite, Invoicing & Payments,
Team & Role Management, Templates Marketplace, Audit Log, and Calendar & Scheduling.

**Both the backend (NestJS) and frontend (React) live in this single repo** as a pnpm workspace.

---

## Scope & scale target

- Target for this phase: **~100–150 client organizations (tenants)**, not internet-scale.
- Therefore: **modular monolith**, not microservices. Keep clean module boundaries so a module
  _could_ be extracted later, but do not distribute the system now.
- **Build only what's needed.** Don't scaffold modules or infrastructure that aren't required yet.
  The goal is clean seams so heavier pieces can be added later — not to build them all upfront.

---

## Cost constraint (important)

This is a **low-cost trial**. When choosing libraries, hosting, or services:

- **Prefer free and open-source packages.** Avoid anything requiring a paid license.
- Prefer services with a **genuine free tier** (Neon/Supabase Postgres, Upstash Redis, Brevo/Resend
  email) over paid-by-default vendors.
- Before adding a **paid** dependency or SaaS, **flag it and ask**.
- Keep the stack self-hostable where practical to avoid vendor lock-in.

---

## Engineering principles (follow these)

These are non-negotiable for this project:

- **ACID** — treat data integrity as primary. Use PostgreSQL transactions for any multi-step write
  (e.g. quotation → invoice, payment → status update, ticket assignment). A partial write must never
  be visible. Wrap related Prisma writes in `prisma.$transaction`.
- **SOLID** — especially:
  - _Single Responsibility_: one reason to change per class/module.
  - _Dependency Inversion_: depend on interfaces, not vendors. Email, payments, storage, and the job
    queue each sit behind an interface (`EmailProvider`, `PaymentGateway`, `FileStorage`, `JobQueue`)
    so implementations swap without touching callers.
  - _Open/Closed_: extend via new modules/strategies, not by editing shared core.
- **DRY** — no duplicated logic or types. Shared types/DTOs live in `packages/shared`. But avoid
  premature abstraction: extract on the _third_ repetition, not the first.
- **Clean Code** — small focused functions, intention-revealing names, explicit over clever, minimal
  comments (say _why_, not _what_), consistent formatting enforced by ESLint + Prettier.

**Not doing yet (deliberately):**

- **No unit tests for now** — do not add a test suite/framework unless asked.
- **No CI for now** — no GitHub Actions or pipelines yet.
- These may be added later; keep code testable/portable so they're easy to introduce.

**Config validation (fail fast):**

- All configuration comes from **environment variables** — validated at boot via NestJS
  `ConfigModule` with a schema (Zod or Joi). If a required var is missing/invalid, the app **refuses
  to start with a clear message** rather than failing mysteriously later.
- Keep a committed **`.env.example`** listing every variable (no secrets); real values live in a
  git-ignored `.env`.

**Code style enforcement (local, no CI):**

- **Prettier + ESLint** configured at the repo root; style is auto-enforced, not argued in review.
- A **local pre-commit hook** (husky + lint-staged) formats and lints **staged files only** on every
  commit. This is the local stand-in for CI — free, no server, keeps Clean Code consistent.
  (Set up once the repo is initialized with git.)

---

## Error handling (must be solid)

- **Global exception filter** in NestJS produces a **consistent error envelope** for every failure:

  ```json
  {
    "code": "QUOTATION_NOT_FOUND",
    "message": "Quotation not found",
    "details": null,
    "timestamp": "..."
  }
  ```

- Use **typed domain exceptions** (e.g. `NotFoundException`, custom `BusinessRuleException`) — never
  leak raw errors or stack traces to clients.
- **Validate all input at the edge** with `class-validator` DTOs; reject invalid requests with 4xx +
  clear messages before any business logic runs.
- **Fail fast** on programmer errors; handle expected failures explicitly (don't swallow errors).
- **Structured logging** via `nestjs-pino` (JSON logs). Log the full error server-side; return only
  the safe envelope to the client. No external error-tracking service for now.
- **Transactions roll back** on error so failures never leave partial state (ties to ACID).
- External calls (email, payments) go through retry-capable jobs, not inline request handlers.

---

## Tech stack

| Layer          | Choice                                            | Notes                                                                                 |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Monorepo       | **pnpm workspaces**                               | `apps/*` and `packages/*`                                                             |
| Language       | **TypeScript** everywhere                         | strict mode, no implicit `any`                                                        |
| Backend        | **NestJS**                                        | modular monolith, REST API                                                            |
| Database       | **PostgreSQL**                                    | free tier: Neon or Supabase                                                           |
| ORM            | **Prisma**                                        | schema-first, migrations, type-safe client, `$transaction` for ACID                   |
| Auth           | **Self-hosted JWT (Passport)**                    | `@nestjs/passport`, access + refresh tokens; no paid auth vendor                      |
| Jobs/queue     | **BullMQ + Redis**, behind a `JobQueue` interface | Redis via Docker (dev) / Upstash free tier (prod). Free. Interface keeps it swappable |
| Logging        | **nestjs-pino**                                   | structured JSON logs                                                                  |
| Frontend build | **Vite**                                          | React + TypeScript                                                                    |
| UI library     | **MUI (Material UI)**                             | free core only — do not add paid MUI X Pro/Premium                                    |
| Data fetching  | **TanStack Query**                                | server state (no fetching in `useEffect`)                                             |
| Client state   | **Redux Toolkit**                                 | small — global client state only                                                      |
| Routing        | **React Router**                                  | lazy-loaded per-feature routes                                                        |
| Forms          | **React Hook Form + Zod**                         | reuse shared Zod schemas; always via RHF wrapper components                           |
| Tables         | **Material React Table**                          | use for every data table — do not hand-roll tables                                    |
| Icons          | **MUI icons**, re-exported from `iconHash.ts`     | never import icons directly from `@mui/icons-material` in features                    |
| File storage   | S3-compatible behind `FileStorage` interface      | prefer free/self-hosted (MinIO) in dev; defer real bucket until needed                |

**Email/payments (add when the module is built):** prefer free tiers — Brevo/Resend for email,
Stripe (pay-per-transaction, no monthly fee) for payments. Both behind interfaces. Confirm before wiring up.

---

## API conventions

- Version the API path: **`/api/v1/...`**. Breaking changes go to a new version, not a mutated one.
- **Consistent error envelope** (see Error handling) for all non-2xx responses.
- REST, resource-oriented routes; plural nouns (`/api/v1/quotations/:id`).
- Validate request bodies/queries with DTOs; never trust client input.
- Every request is **tenant-scoped and role-checked** (see Multi-tenancy).

---

## Frontend architecture

Decisions the React app must follow (scalability + maintainability):

**Structure — feature-based, not layer-based.**

- Organize by feature, mirroring backend `modules/`. Each feature owns its slice.
- Generic, reusable UI goes in `components/`; app-wide plumbing in `lib/`.

  ```text
  src/features/quotations/   # components, query hooks, api calls, routes
  src/features/tickets/
  src/components/            # shared, generic + RHF wrapper components
  src/interface/            # interfaces, enums, types (shared across app)
  src/constant/             # constant data (options, config, static maps)
  src/lib/                   # api client, api helpers, redux store, theme, router, iconHash.ts
  ```

  Each feature may also carry its own `interface/` and `constant/` folders; cross-feature ones live at `src/`.

**State ownership — one hard rule (most important decision):**

- **Server data → TanStack Query only.** Never copy API data into Redux.
- **Redux Toolkit → genuine global client state only** (session/current user, active tenant, theme,
  global UI like toasts/modals). Keep it small.
- **Local state → `useState`** for anything one component owns.
- **URL → filters, pagination, tabs, selected IDs** so views are shareable and refresh-safe.

**API layer — centralized and typed.**

- One API client (axios or fetch wrapper) targeting `/api/v1`; components never call `fetch` directly.
- Attaches the JWT; performs **transparent, single-flight token refresh** on 401.
- Maps the backend **error envelope** (`{ code, message, details }`) to a typed error the UI switches on.
- Every endpoint is wrapped in a typed query/mutation hook (`useQuotations()`, `useCreateTicket()`).

**Types — consume, don't redefine.**

- Import DTOs/validation from `packages/shared`. No duplicated frontend type definitions.

**Auth & RBAC on the client.**

- Access token in memory (short-lived); refresh handled by the API layer.
- `<ProtectedRoute>` guards authentication; `<Can role="...">` / `useHasRole()` gates role-specific UI
  (Owner, Admin, Manager, Agent, Read-only). UI hides what a role can't do — **backend still enforces authz**.

**Routing — lazy per-feature.**

- React Router with each feature's routes code-split via `React.lazy` + `Suspense` to keep bundles small.

**UI & theming — white-label ready.**

- Centralize a **MUI theme** driven by design tokens; structure it so a tenant's brand can override at runtime.
- Wrap MUI in a thin local component layer (`<Button>`, `<DataTable>`) so styling/library swaps stay local
  and the free-vs-paid MUI X boundary is contained.

**Forms — React Hook Form + Zod.**

- RHF for performance; Zod for validation, reusing the **same schema** the backend validates against.

**Async UI states + resilience.**

- Every data view handles **loading / error / empty / success** explicitly and consistently.
- **Error boundaries per route** so one feature crashing doesn't white-screen the app.

**Deliberately deferred** (don't build for the trial): micro-frontends/module federation, SSR/Next.js,
list virtualization (add when a list is actually long), Storybook/tests, i18n.

---

## Frontend coding conventions (strict)

### Naming

- **Interfaces are prefixed with `I`** — `IProduct`, `IQuotation`, `ITicket`.
- **Enum members are UPPER_CASE**; enum and type names are `PascalCase`.

  ```ts
  export interface IProduct {
    id: string;
    name: string;
  }

  export enum OrderStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    APPROVED = 'APPROVED',
  }

  export type QuotationStatus = OrderStatus;
  ```

- Components `PascalCase`, hooks `useCamelCase`, helper functions descriptive `camelCase`.

### Where things live

- **Interfaces, enums, and types** go in an `interface/` folder — not scattered inside components.
- **Constant / static data** (select options, config maps, label lookups) go in a `constant/` folder.

### Icons — single registry (`iconHash.ts`)

- Import MUI icons **once** in `src/lib/iconHash.ts`, re-export them with clear semantic names, and
  import from there everywhere else. **Never** import from `@mui/icons-material` inside features.

  ```ts
  // src/lib/iconHash.ts
  import AddIcon from '@mui/icons-material/Add';
  import DeleteIcon from '@mui/icons-material/DeleteOutline';

  export const Icons = { Add: AddIcon, Delete: DeleteIcon } as const;
  ```

### Forms — always RHF wrapper components + a field config object

- Build reusable **RHF-wrapped MUI components** (`RhfTextField`, `RhfSelect`, `RhfDatePicker`, …) in
  `src/components/`. Forms use these — **never a raw MUI input**.
- Define each form as a **config object/array** (e.g. `signupFormFields`) holding every field's name,
  label, type, validation, and options; **render the form by mapping over it**, not by hand-writing
  each field.

  ```ts
  export const signupFormFields = [
    { name: 'email', label: 'Email', component: 'RhfTextField', type: 'email' },
    { name: 'password', label: 'Password', component: 'RhfTextField', type: 'password' },
  ] as const;
  ```

### Tables — always Material React Table

- Every data table uses **Material React Table**. Do not hand-roll `<table>` or build custom grids.

### Component decomposition

- **Extract reusable pieces into their own components.** Keep files small and focused — if a chunk
  can be reduced or reused as a component, make it one. No large multi-responsibility files.

### API optimization

- Optimize API usage: dedupe/cache with TanStack Query, avoid redundant refetches, batch where sensible,
  paginate lists. Wrap calls in **named helper functions** (`fetchQuotationById`, `createTicket`) with
  descriptive names — no anonymous inline fetches in components.

---

## Intended repo structure

> Target layout. Parts may not exist yet — create them as modules are built.

```text
AgencyOS/
├── apps/
│   ├── backend/            # NestJS API
│   │   ├── src/
│   │   │   ├── modules/    # feature modules (auth, tenants, quotations, tickets, events, ...)
│   │   │   ├── common/     # guards, interceptors, filters (global exception filter), decorators
│   │   │   ├── infra/      # interface impls: jobs (BullMQ), mail, storage, payments
│   │   │   └── main.ts
│   │   └── prisma/
│   │       └── schema.prisma
│   └── frontend/           # React + Vite + MUI
│       └── src/
│           ├── features/   # feature folders mirroring backend modules
│           ├── components/ # shared UI
│           ├── lib/        # api client, query hooks, redux store
│           └── main.tsx
├── packages/
│   └── shared/             # shared TS types / DTOs / validation used by both apps
├── docker-compose.yml      # postgres + redis for local dev
├── pnpm-workspace.yaml
├── package.json
├── CLAUDE.md
└── PRODUCT_OVERVIEW.md
```

Keep frontend `features/` names matching backend `modules/` so the mapping stays obvious.

---

## Commands

> Fill in / adjust once scaffolding exists. Use pnpm, never npm/yarn.

```bash
pnpm install                          # install all workspace deps
docker compose up -d                  # local postgres + redis

# Backend (apps/backend)
pnpm --filter backend start:dev       # run API in watch mode
pnpm --filter backend prisma migrate dev   # create/apply a migration
pnpm --filter backend prisma studio   # inspect the DB

# Frontend (apps/frontend)
pnpm --filter frontend dev            # Vite dev server
pnpm --filter frontend build          # production build

# Whole repo
pnpm -r lint                          # lint all packages
pnpm -r build                         # build all packages
```

---

## Conventions

- **TypeScript strict**; no `any` unless justified with a comment.
- **Shared types live in `packages/shared`** — never duplicate DTOs across backend/frontend.
- Backend follows **NestJS module conventions**: one folder per feature with
  `*.module.ts`, `*.controller.ts`, `*.service.ts`, and DTOs.
- External integrations (mail, payments, storage, jobs) go through **interfaces in `infra/`** —
  business code never imports a vendor SDK directly.
- Frontend: **TanStack Query for all server data**; **Redux Toolkit** only for genuine client state.
- Prisma is the single source of truth for the schema — change the DB via **migrations**, never by hand.
- Money is stored as **integer minor units** (or `Decimal`), never floats.
- Follow existing formatting/lint config; run lint before considering a change done.

---

## Multi-tenancy (build this in from the start)

- **Workspace = tenant.** Nearly every table carries a `tenantId`.
- All queries must be **scoped to the current tenant** — enforce via a guard/interceptor and Prisma
  middleware so a request can never read another tenant's data. This is the highest-severity bug class.
- Auth tokens carry the user's `tenantId` and role; authorize on **both**.
- Roles: **Owner, Admin, Manager, Agent, Read-only**.
- The **Audit Log** captures who/what/when for sensitive actions — wire it in as modules land.

---

## Hosting

Not decided yet. Keep the app **12-factor / portable**: config via environment variables, stateless
API processes, backing services (Postgres, Redis) as attachable resources. This keeps any target
(single VPS + Docker Compose, Railway/Render, or split hosting) open without a rewrite.

---

## Working agreements for Claude

- **Ask before adding a paid dependency or external SaaS** (see cost constraint).
- Uphold the engineering principles above (ACID, SOLID, DRY, Clean Code) and strong error handling
  in every change.
- Prefer extending existing modules/patterns over introducing new libraries.
- Don't add tests or CI unless asked (deliberately deferred).
- Keep changes scoped; don't scaffold modules that weren't requested.
- When a decision isn't obvious (schema shape, third-party choice), ask rather than guess.
- Update this file when structure/commands/decisions drift.

---

## Status

Early stage — product overview defined, stack and principles chosen. Scaffolding and modules to be built.
Update this file as the project takes shape.

# DB Rules

- always run migration after DB table changes. and tell me other instruction for that.
- maintainin normalization in the DB table.

-always write form validation for every form.
