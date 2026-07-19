# Implementation Plan: AI API Cost Monitoring

**Branch**: `001-ai-cost-monitoring` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ai-cost-monitoring/spec.md`

## Summary

CostFlow ingests AI usage events (customer, feature, provider, model, tokens) over an
API-key-authenticated endpoint, costs each event against a versioned pricing table, and
surfaces the result as customer- and feature-ranked dashboards with drill-down, budget
alerts, and CSV export. The implementation is a single Node.js/TypeScript server (native
`http`, no framework unless routing requires Express) backed by a local SQLite database
(`better-sqlite3`, raw SQL, file-based migrations) and a Vite-built vanilla HTML/CSS/JS
frontend with zero UI framework or component library. The only runtime npm dependencies are
`vite`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, and `nodemailer`, per the project's
Technology Constraints.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22.12+ (backend); vanilla JavaScript (ES2020+),
native ES modules, no transpilation beyond what Vite does for bundling (frontend)

**Primary Dependencies**: Runtime — `vite` (build/dev server), `better-sqlite3` (SQLite
driver), `bcryptjs` (password + API key hashing), `jsonwebtoken` (JWT RS256 sessions),
`nodemailer` (SMTP email). Dev-only, not shipped to production — TypeScript compiler, Node's
built-in test runner (no package required), Playwright (E2E browser automation only; see
research.md for why this is a devDependency exception rather than a Technology Constraints
violation)

**Storage**: SQLite, single local file at `./data/costflow.db`, accessed synchronously via
`better-sqlite3`, no ORM, schema owned by sequentially-numbered plain SQL files in
`./migrations/`

**Testing**: Node.js built-in test runner (`node:test`, `node:assert/strict`) for backend
unit and integration tests; Playwright for the end-to-end funnel (signup → create project →
send event → view dashboard → export CSV) specified as NON-NEGOTIABLE by the constitution

**Target Platform**: Single Node.js 22.12+ process serving both the JSON API and the Vite-built
static frontend; designed to run on one machine (developer laptop in dev, one server/container
in production) — no distributed or multi-instance assumptions

**Project Type**: Web application (one repo, one backend process, one static frontend build —
not a separate mobile or CLI target)

**Performance Goals**: API p95 < 500ms; event ingestion < 100ms; dashboard load < 2s;
sustained 1,000 events/min per project without degradation (per constitution Performance
Requirements)

**Constraints**: Zero runtime dependencies beyond the five-package allowlist; no external
database server or cache (SQLite file only, no Redis); no frontend framework or component
library; synchronous DB access model (`better-sqlite3` blocks the event loop per call, so
handlers must stay short and queries must stay indexed); JWT sessions in `HttpOnly`,
`Secure`, `SameSite=Strict` cookies; TLS 1.3 only

**Scale/Scope**: Single-owner accounts, up to 3 projects per account, one local SQLite file —
not designed for horizontal scaling or multi-instance deployment in this phase; 5 user
stories (account/API key setup, cost-by-customer ingestion, cost-by-feature, budget alerts,
CSV export) covering 37 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Checked against constitution v2.0.0:

- **I. Code Quality & Type Safety** — PASS. Backend is TypeScript strict mode; frontend is
  vanilla JS by explicit constitutional carve-out. Cost math uses `Number` with `toFixed(4)`
  applied only at storage/display boundaries, matching the documented precision tradeoff.
  Controller/service/repository separation and a single constants module are planned in
  Project Structure below.
- **II. Testing Standards (NON-NEGOTIABLE)** — PASS. Node's built-in test runner covers
  unit/integration (80%/90% coverage targets, AAA, `should X when Y` naming, colocated
  `*.test.ts` files); Playwright covers the mandated full-funnel E2E. SQLite tests run against
  an isolated file, never the dev/prod `.db`.
- **III. User Experience Consistency** — PASS. Skeletons, toasts, inline validation, semantic
  HTML, `aria-label`/keyboard nav, and color-plus-icon state are all hand-buildable in vanilla
  CSS/JS as specified (`toast.js`, `skeleton.css`, native `checkValidity()`), with no framework
  needed to satisfy any of these rules.
- **IV. Performance Requirements (Hard Limits)** — PASS. The four required indexes
  (`(project_id, timestamp)`, `(project_id, customer_id)`, `(project_id, feature)`,
  `(provider, model, effective_date)`) are defined in the schema below. No caching layer is
  introduced (constitution permits this since SQLite reads are local). Routes/heavy modules
  lazy-load via dynamic `import()`.
- **Technology Constraints (NON-NEGOTIABLE)** — PASS. Exactly the five allowed runtime
  packages are used; no framework, ORM, HTTP client library, chart library, utility library,
  UUID library, or auth library is introduced. `crypto.randomUUID()` is used for all IDs.
- **Security & Data Protection (NON-NEGOTIABLE)** — PASS. `bcryptjs` hashes passwords and API
  keys; prompts/responses are never stored; JWT RS256 in `HttpOnly`/`Secure`/`SameSite=Strict`
  cookies; TLS 1.3; rate limiting and login lockout as specified.
- **Data Management & Database Rules** — PASS. Schema changes go through numbered files in
  `./migrations/`; `EXPLAIN QUERY PLAN` (SQLite's equivalent to the constitution's
  `EXPLAIN ANALYZE` requirement) is used in review; soft deletes with 7-day retention are
  planned for projects.
- **Development Workflow & Release Gates** — Applies at PR/release time, not plan time; no
  gate violated by this plan.

No violations identified. Complexity Tracking table below is empty by design.

**Post-Phase 1 re-check**: data-model.md, contracts/api.md, and quickstart.md introduce no new
dependencies, endpoints, or storage beyond what this gate already evaluated — the export
download link (`/api/v1/exports/:exportId?token=...`) and hourly budget scheduler are both
in-process, zero-dependency mechanisms (see research.md §6–7). Gate still PASSES.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-cost-monitoring/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
costflow/
├── data/
│   └── costflow.db              # SQLite database file (gitignored)
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_projects.sql
│   ├── 003_create_events.sql
│   ├── 004_create_pricing.sql
│   └── 005_create_budgets_alerts.sql
├── src/
│   ├── config/
│   │   └── constants.ts         # Rate limits, thresholds, pagination size — no hardcoded literals
│   ├── server/
│   │   ├── index.ts             # Entry point, starts HTTP server
│   │   ├── router.ts            # Route definitions
│   │   ├── db.ts                # SQLite connection and migration runner
│   │   ├── auth.ts              # JWT issuing/verification, bcrypt helpers, session middleware
│   │   ├── rate-limit.ts        # In-memory Map-based rate limiter
│   │   ├── handlers/            # Controllers: HTTP in/out only, no business logic
│   │   │   ├── auth.ts
│   │   │   ├── auth.test.ts
│   │   │   ├── projects.ts
│   │   │   ├── projects.test.ts
│   │   │   ├── events.ts
│   │   │   ├── events.test.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── dashboard.test.ts
│   │   │   ├── budgets.ts
│   │   │   ├── budgets.test.ts
│   │   │   └── export.ts
│   │   │       export.test.ts
│   │   ├── services/            # Business logic: cost calculation, budget evaluation, dedup
│   │   │   ├── cost.service.ts
│   │   │   ├── cost.service.test.ts
│   │   │   ├── budget.service.ts
│   │   │   ├── budget.service.test.ts
│   │   │   ├── alert.service.ts
│   │   │   └── alert.service.test.ts
│   │   └── repositories/        # Only place raw SQL is issued
│   │       ├── user.repository.ts
│   │       ├── project.repository.ts
│   │       ├── event.repository.ts
│   │       ├── pricing.repository.ts
│   │       └── budget.repository.ts
│   └── client/
│       ├── api.js               # Shared fetch wrapper with auth header + error handling
│       ├── auth.js              # Login/signup form logic
│       ├── projects.js          # Project list/create/delete logic
│       ├── dashboard.js         # Table rendering, sorting, pagination, filtering
│       ├── charts.js            # Native SVG sparkline renderer
│       ├── export.js            # CSV download trigger (Blob + URL.createObjectURL)
│       ├── alerts.js            # Alert history fetch/render
│       ├── toast.js             # Toast notification system
│       └── styles/
│           ├── base.css         # Reset, typography, CSS variables
│           ├── layout.css
│           ├── tables.css
│           ├── forms.css
│           ├── toast.css
│           ├── skeleton.css
│           └── charts.css
├── public/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── projects.html
│   ├── project.html
│   ├── settings.html
│   └── alerts.html
├── e2e/                          # Playwright specs — the constitution's mandated funnel test
│   └── funnel.spec.ts
├── vite.config.js
├── package.json
└── .env.example
```

**Structure Decision**: A single repository with `src/server` (TypeScript, layered into
`handlers/` → `services/` → `repositories/` per the Code Quality principle) and `src/client`
(vanilla JS ES modules) sharing one Vite build and one Node process. This is a variant of the
template's "web application" option collapsed into one project rather than separate
`backend/`/`frontend/` roots, matching the concrete tree the stack decision specified. Unit and
integration test files sit next to the source they test (constitution requirement); Playwright
E2E specs get their own `e2e/` directory since they exercise a full flow across many files
rather than one module.

## Complexity Tracking

> No Constitution Check violations were identified — this table is intentionally empty.
