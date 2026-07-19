---

description: "Task list for AI API Cost Monitoring"
---

# Tasks: AI API Cost Monitoring

**Input**: Design documents from `/specs/001-ai-cost-monitoring/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: Included. The constitution's Testing Standards principle is NON-NEGOTIABLE
(coverage thresholds, integration test per endpoint, mandatory E2E funnel), so every user
story below includes its test tasks even though the spec itself didn't separately request them.

**Organization**: Tasks are grouped by user story (spec.md priorities P1–P3) so each story can
be implemented and independently tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to US1–US5 from spec.md
- File paths are relative to the repository root and match plan.md's Project Structure

## Path Conventions

Single repo, backend at `src/server/` (TypeScript), frontend at `src/client/` + `public/`
(vanilla JS/HTML/CSS), per [plan.md](./plan.md) Project Structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repository scaffolding and tooling — no feature logic yet.

- [X] T001 Create the directory tree from plan.md's Project Structure: `data/`, `migrations/`,
      `src/config/`, `src/server/{handlers,services,repositories}/`, `src/client/styles/`,
      `public/`, `e2e/`
- [X] T002 Initialize `package.json` with the five allowed runtime dependencies (`vite`,
      `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `nodemailer`), TypeScript and Playwright as
      devDependencies only, and scripts: `dev` (run `tsc --watch` for the backend and `vite`
      for the frontend as two concurrent processes — no `concurrently` package, document
      running them in two terminals or via a two-line shell script), `migrate`, `seed`,
      `build` (`tsc` + `vite build`), `start` (`node --watch dist-server/server/index.js` in
      dev, plain `node` in prod), `test` (`node --test`), `test:e2e` (`playwright test`)
- [X] T003 [P] Configure `tsconfig.json` for backend strict mode (`strict: true`,
      `noImplicitAny: true`, outputs to `dist-server/`), scoped to `src/server/` and
      `src/config/` only
- [X] T004 [P] Configure `vite.config.js` with one HTML entry point per page under `public/`
- [X] T005 [P] Create `.env.example` (`PORT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
      `SMTP_PASS`, `SMTP_FROM`, `DB_PATH` — no `JWT_SECRET`, per research.md §2) and
      `.gitignore` (`data/`, `node_modules/`, `dist/`, `dist-server/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, core server utilities, and shared frontend primitives every user
story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 [P] Write `migrations/001_create_users.sql` (per data-model.md `users` table)
- [ ] T007 [P] Write `migrations/002_create_projects.sql` (per data-model.md `projects` table,
      incl. `UNIQUE(user_id, name)`)
- [ ] T008 [P] Write `migrations/003_create_events.sql` (per data-model.md `events` table,
      including `idx_events_project_timestamp`, `idx_events_project_customer`,
      `idx_events_project_feature`, and the partial unique dedup index
      `idx_events_dedup ON events(project_id, request_id) WHERE request_id IS NOT NULL`)
- [ ] T009 [P] Write `migrations/004_create_pricing.sql` (per data-model.md `pricing` table,
      including `idx_pricing_model_date`)
- [ ] T010 [P] Write `migrations/005_create_budgets_alerts.sql` (per data-model.md `budgets`
      and `alerts` tables)
- [ ] T011 Implement `src/server/db.ts` — opens the SQLite connection at `DB_PATH`, sets
      `PRAGMA journal_mode = WAL` (research.md §8), and runs pending files from `migrations/`
      in order on startup
- [ ] T012 Implement `src/config/constants.ts` — rate limit (1000/min), login lockout
      (5/min → 15min), bcrypt rounds (10), project limit (3), pagination size (50), budget
      check interval (1h), export row threshold (50000), export link expiry (24h) — no
      hardcoded literals elsewhere (Code Quality principle)
- [ ] T013 Implement `src/server/auth.ts` — RS256 keypair generation/load from
      `data/jwt-private.pem` / `data/jwt-public.pem` via `crypto.generateKeyPairSync`
      (research.md §2), JWT sign/verify helpers, bcrypt password/API-key hash+verify helpers,
      and `HttpOnly`/`Secure`/`SameSite=Strict` session cookie constants
- [ ] T014 Implement `src/server/rate-limit.ts` — in-memory `Map`-based fixed-window limiter
      keyed by API key (research.md §5)
- [ ] T015 Implement `src/server/email.ts` — `nodemailer` SMTP transport wrapper with a single
      `sendEmail(to, subject, body)` function
- [ ] T016 Implement `src/server/router.ts` — route table and request dispatch over native
      `http`
- [ ] T017 Implement `src/server/index.ts` — entry point; runs migrations, starts the HTTP
      server, and (later) the alert scheduler
- [ ] T018 Implement `scripts/seed.ts` — inserts sample OpenAI pricing rows and one demo
      project, wired to `npm run seed`
- [ ] T019 [P] Implement `src/client/api.js` — shared `fetch` wrapper with auth header and
      centralized error handling (never surfaces raw status codes to the UI)
- [ ] T020 [P] Implement `src/client/toast.js` — vanilla JS toast notifications (success/
      error/warning, 5s auto-dismiss, manual close)
- [ ] T021 [P] Implement `src/client/styles/base.css` — reset, typography, CSS variables
- [ ] T022 [P] Implement `src/client/styles/skeleton.css` — pure CSS skeleton pulse animation
- [ ] T023 [P] Implement `src/client/styles/toast.css` — toast slide-in/fade-out animation
- [ ] T024 [P] Implement `src/client/styles/layout.css` — page/sidebar/content layout
- [ ] T025 [P] Implement `src/client/styles/forms.css` — inputs, labels, inline validation
      error states, buttons (incl. disabled + spinner state)
- [ ] T026 [P] Implement `src/client/styles/tables.css` — sortable table, pagination, row
      hover states
- [ ] T027 [P] Implement `src/client/styles/charts.css` — SVG sparkline sizing/colors

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Account, Project & API Key Setup (Priority: P1) 🎯 MVP

**Goal**: Founder can sign up, confirm email, log in, create a project, and receive an API key.

**Independent Test**: Sign up → confirm → log in → create project → confirm a usable API key
is issued (spec.md US1 acceptance scenarios 1–6).

### Tests for User Story 1

- [ ] T028 [P] [US1] Unit tests for JWT + bcrypt helpers in `src/server/auth.test.ts`
- [ ] T029 [P] [US1] Integration tests for signup, login (incl. 5-attempts/min lockout),
      logout, password reset, and email verification in `src/server/handlers/auth.test.ts`
- [ ] T030 [P] [US1] Integration tests for project create/list/get/rename/delete, the
      3-project cap, and API key regenerate (old key 401s immediately, history preserved) in
      `src/server/handlers/projects.test.ts`

### Implementation for User Story 1

- [ ] T031 [US1] Implement `src/server/repositories/user.repository.ts` (create, findByEmail,
      markEmailVerified)
- [ ] T032 [US1] Implement `src/server/repositories/project.repository.ts` (create, list,
      get, rename, softDelete, regenerateKeyHash, countActiveByUser)
- [ ] T033 [US1] Implement `src/server/services/auth.service.ts` — signup, login (incl.
      lockout tracking), logout, password reset flow, email verification (depends on T031,
      T013, T015)
- [ ] T034 [US1] Implement `src/server/services/project.service.ts` — create (enforcing the
      3-project cap), list, rename, soft-delete, regenerate key, and the 7-day hard-purge
      sweep for soft-deleted projects (depends on T032, T013)
- [ ] T035 [US1] Implement `src/server/handlers/auth.ts` — thin controllers for
      `POST /api/v1/auth/{signup,login,logout,reset-password}` and
      `GET /api/v1/auth/verify-email` (depends on T033)
- [ ] T036 [US1] Implement `src/server/handlers/projects.ts` — thin controllers for the
      `/api/v1/projects` CRUD routes and `POST /api/v1/projects/:id/regenerate-key` (depends
      on T034)
- [ ] T037 [US1] Wire auth and project routes into `src/server/router.ts` (depends on T035,
      T036)
- [ ] T038 [P] [US1] Build `public/signup.html` and signup form logic in `src/client/auth.js`
      (inline validation, disabled/spinner submit button, toast on result)
- [ ] T039 [P] [US1] Build `public/login.html` and login form logic in `src/client/auth.js`
- [ ] T040 [P] [US1] Build `public/projects.html` and `src/client/projects.js` — project
      list, create dialog with one-time API key display + copy button, rename, delete,
      regenerate-key

**Checkpoint**: User Story 1 fully functional and testable independently.

---

## Phase 4: User Story 2 - Ingest Usage Events & View Cost by Customer (Priority: P1) 🎯 MVP

**Goal**: Founder's app sends usage events; founder sees a cost-by-customer dashboard.

**Independent Test**: Send events for a project, confirm they appear correctly costed and
ranked in the customer view (spec.md US2 acceptance scenarios 1–8).

### Tests for User Story 2

- [ ] T041 [P] [US2] Unit tests for pricing lookup by provider+model+effective_date, incl.
      mid-month price change, in `src/server/services/cost.service.test.ts`
- [ ] T042 [P] [US2] Unit tests for event validation, batch handling, and dedup logic in
      `src/server/services/event.service.test.ts`
- [ ] T043 [P] [US2] Integration tests for `POST /api/v1/events` — happy path, batch, missing/
      malformed fields (400), bad key (401), rate limit (429 with `Retry-After`), unknown
      model (stored with `cost = null`), duplicate `request_id` (202, no double-count) in
      `src/server/handlers/events.test.ts`
- [ ] T044 [P] [US2] Integration tests for customer dashboard endpoints — default sort,
      re-sort, pagination, date-range filter, drill-down, empty state in
      `src/server/handlers/dashboard.test.ts`

### Implementation for User Story 2

- [ ] T045 [US2] Implement `src/server/repositories/pricing.repository.ts` (findRate by
      provider+model+effective_date, most-recent-match-wins per research.md §3)
- [ ] T046 [US2] Implement `src/server/repositories/event.repository.ts` (insert with dedup
      constraint handling, customer-level cost/count/trend aggregation queries)
- [ ] T047 [US2] Implement `src/server/services/cost.service.ts` — pricing lookup + cost
      formula, `Number` arithmetic rounded to 4 decimals only at the storage boundary (depends
      on T045)
- [ ] T048 [US2] Implement `src/server/services/event.service.ts` — validates required
      fields, handles single/batch submissions, catches the dedup unique-constraint violation
      as a silent 202, flags unknown-model events with `cost = null` (depends on T046, T047)
- [ ] T049 [US2] Implement `src/server/services/dashboard.service.ts` — customer cost
      aggregation, sorting, pagination, date-range filtering, customer→feature drill-down
      (depends on T046)
- [ ] T050 [US2] Implement `src/server/handlers/events.ts` — `POST /api/v1/events`, applying
      the rate limiter from T014 (depends on T048, T014)
- [ ] T051 [US2] Implement `src/server/handlers/dashboard.ts` — `GET /api/v1/projects/:id/
      customers` and `GET /api/v1/projects/:id/customers/:customerId` (depends on T049)
- [ ] T052 [US2] Wire events and customer-dashboard routes into `src/server/router.ts`
      (depends on T050, T051)
- [ ] T053 [P] [US2] Implement `src/client/charts.js` — native SVG sparkline renderer (no
      charting library)
- [ ] T054 [US2] Build the Cost by Customer tab in `public/project.html` and
      `src/client/dashboard.js` — skeleton-loading table, default cost-descending sort,
      re-sort, pagination, date-range filter, drill-down, empty state with setup snippet
      (depends on T053)

**Checkpoint**: User Stories 1 AND 2 both work independently — this is the MVP.

---

## Phase 5: User Story 3 - View Cost by Feature (Priority: P2)

**Goal**: Founder sees a cost-by-feature dashboard with customer drill-down.

**Independent Test**: Send events tagged with multiple features, confirm the feature-ranked
table and drill-down are correct (spec.md US3 acceptance scenarios 1–4).

### Tests for User Story 3

- [ ] T055 [US3] Add integration tests for feature dashboard endpoints — default sort,
      re-sort, pagination, date-range filter, drill-down, empty state to
      `src/server/handlers/dashboard.test.ts`

### Implementation for User Story 3

- [ ] T056 [US3] Extend `src/server/repositories/event.repository.ts` with feature-level
      cost/count/average-cost aggregation queries
- [ ] T057 [US3] Extend `src/server/services/dashboard.service.ts` with feature cost
      aggregation, sorting, pagination, date-range filtering, and feature→customer drill-down
      (depends on T056)
- [ ] T058 [US3] Extend `src/server/handlers/dashboard.ts` with `GET /api/v1/projects/:id/
      features` and `GET /api/v1/projects/:id/features/:featureName` (depends on T057)
- [ ] T059 [US3] Wire feature-dashboard routes into `src/server/router.ts` (depends on T058)
- [ ] T060 [US3] Build the Cost by Feature tab in `public/project.html`, extending
      `src/client/dashboard.js` (depends on T059)

**Checkpoint**: User Stories 1–3 all work independently.

---

## Phase 6: User Story 4 - Budget Alerts (Priority: P2)

**Goal**: Founder sets a budget and threshold, and gets emailed before overspending.

**Independent Test**: Configure a low budget/threshold, generate enough cost to cross it,
confirm exactly one alert email (spec.md US4 acceptance scenarios 1–5).

### Tests for User Story 4

- [ ] T061 [P] [US4] Unit tests for threshold-crossing detection and once-per-threshold-
      per-day dedup in `src/server/services/alert.service.test.ts`
- [ ] T062 [P] [US4] Integration tests for `GET`/`PUT /api/v1/projects/:id/budgets` and
      `GET /api/v1/projects/:id/alerts` in `src/server/handlers/budgets.test.ts`

### Implementation for User Story 4

- [ ] T063 [US4] Implement `src/server/repositories/budget.repository.ts` (get/upsert budget
      config per project)
- [ ] T064 [US4] Implement `src/server/repositories/alert.repository.ts` (insert alert, list
      history, check-already-sent-today-for-threshold)
- [ ] T065 [US4] Implement `src/server/services/budget.service.ts` — get/set monthly/daily
      limits, active thresholds, enabled flag (depends on T063)
- [ ] T066 [US4] Implement `src/server/services/alert.service.ts` — computes current
      monthly/daily spend from event aggregates, detects newly-crossed active thresholds,
      composes and sends the alert email (current spend, limit, percentage, top
      customers/features) via `email.ts`, records the alert (depends on T064, T046, T015)
- [ ] T067 [US4] Implement `src/server/scheduler.ts` — hourly `setInterval` invoking the
      alert-service check across all enabled budgets (research.md §7) (depends on T066)
- [ ] T068 [US4] Start the scheduler from `src/server/index.ts` (depends on T067)
- [ ] T069 [US4] Implement `src/server/handlers/budgets.ts` — `GET`/`PUT` budgets and
      `GET` alerts (depends on T065, T064)
- [ ] T070 [US4] Wire budget and alert routes into `src/server/router.ts` (depends on T069)
- [ ] T071 [P] [US4] Build `public/settings.html` and `src/client/settings.js` — API key
      display (monospace, copy button), visual threshold selector (not plain number inputs),
      budget limit form
- [ ] T072 [P] [US4] Build `public/alerts.html` and `src/client/alerts.js` — alert history
      table

**Checkpoint**: User Stories 1–4 all work independently.

---

## Phase 7: User Story 5 - CSV Export (Priority: P3)

**Goal**: Founder exports cost data as CSV, immediately or via emailed link for large exports.

**Independent Test**: Request an export for a date range, confirm a correctly formatted CSV
is delivered (spec.md US5 acceptance scenarios 1–3).

### Tests for User Story 5

- [ ] T073 [P] [US5] Unit tests for CSV field escaping, 4-decimal cost formatting, and
      row-count estimation in `src/server/services/export.service.test.ts`
- [ ] T074 [P] [US5] Integration tests for export endpoints — immediate download (≤50,000
      rows), background job response + emailed link (>50,000 rows), and 410 on an expired
      link in `src/server/handlers/export.test.ts`

### Implementation for User Story 5

- [ ] T075 [US5] Extend `src/server/repositories/event.repository.ts` with a paginated,
      streamable export-row query (date, customer, feature, model, tokens, cost)
- [ ] T076 [US5] Implement `src/server/services/export.service.ts` — CSV generation with
      proper escaping and 4-decimal cost formatting; immediate response at or under 50,000
      rows; background generation to `data/exports/`, emailed link, and an expiry sweep above
      that (research.md §6) (depends on T075, T015)
- [ ] T077 [US5] Implement `src/server/handlers/export.ts` — `POST /api/v1/projects/:id/
      export` and `GET /api/v1/exports/:exportId` (depends on T076)
- [ ] T078 [US5] Wire export routes into `src/server/router.ts` (depends on T077)
- [ ] T079 [P] [US5] Implement `src/client/export.js` — `Blob` + `URL.createObjectURL`
      download trigger and estimated-row-count confirmation UI
- [ ] T080 [US5] Add the Export action to the Cost by Customer and Cost by Feature views in
      `src/client/dashboard.js` (depends on T079)

**Checkpoint**: All five user stories independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Constitution-mandated checks that span multiple stories.

- [ ] T081 [P] E2E Playwright test covering the full funnel — signup → create project → send
      event → view dashboard → export CSV — in `e2e/funnel.spec.ts`
- [ ] T082 [P] Convert heavy client entry points (`dashboard.js`, `charts.js`) to native
      dynamic `import()` for lazy-loading, per the Performance principle
- [ ] T083 [P] Accessibility pass across all pages — verify every interactive element has an
      `aria-label` and is Tab/Enter/Space operable, and that color is always paired with an
      icon or text
- [ ] T084 Verify `npm run build` output is under 500KB gzipped; record the result in
      quickstart.md's non-functional checks
- [ ] T085 Run `EXPLAIN QUERY PLAN` against every dashboard and export query to confirm index
      usage with no full table scans (Data Management & Database Rules)
- [ ] T086 Write and run a load test simulating 1,000 events/min against
      `POST /api/v1/events` for 1 hour with zero valid-event rejections, per the constitution's
      release gate
- [ ] T087 Write `README.md` covering setup, npm scripts, and an architecture overview

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–7)**: All depend on Foundational. US1 and US2 are both P1 (the MVP);
  US3 and US4 depend only on Foundational, not on each other, but US4's spend calculations
  read the same event aggregates US2 introduces, so building US2 first is strongly
  recommended even though it isn't a hard code dependency. US5 similarly reads event data
  established by US2.
- **Polish (Phase 8)**: Depends on all desired user stories being complete (T081 in particular
  needs every story implemented to exercise the full funnel)

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — needed first because every other story
  requires an authenticated user, a project, and an API key to test against
- **US2 (P1)**: Independently testable once Foundational is done, but requires a project + API
  key from US1 to exercise in practice
- **US3 (P2)**: Independently testable; shares `event.repository.ts` and
  `dashboard.service.ts` with US2 (extends rather than duplicates them)
- **US4 (P2)**: Independently testable; reads cost aggregates that US2 populates
- **US5 (P3)**: Independently testable; reads cost data that US2/US3 populate

### Within Each User Story

- Tests are written first and MUST fail before implementation begins
- Repositories before services; services before handlers; handlers before route wiring;
  backend before the frontend page that calls it
- Story complete and checkpointed before moving to the next priority

### Parallel Opportunities

- All Setup tasks marked [P] (T003–T005) run in parallel
- All Foundational migration files (T006–T010) run in parallel; all Foundational CSS/client
  primitives (T019–T027) run in parallel
- Within a story, [P]-marked test tasks run in parallel with each other; [P]-marked frontend
  page tasks run in parallel with each other once their backend routes exist
- US3, US4, and US5 implementation can proceed in parallel by different developers once
  Foundational and US2 are both complete, since none of them modify the same files
  concurrently with each other (US3 and US2 do share files, so US3 must follow US2)

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests together:
Task: "Unit tests for JWT + bcrypt helpers in src/server/auth.test.ts"
Task: "Integration tests for auth endpoints in src/server/handlers/auth.test.ts"
Task: "Integration tests for project endpoints in src/server/handlers/projects.test.ts"

# Launch US1 frontend pages together (after backend routes are wired):
Task: "Build public/signup.html and src/client/auth.js signup logic"
Task: "Build public/login.html and src/client/auth.js login logic"
Task: "Build public/projects.html and src/client/projects.js"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 (account/project/API key)
4. Complete Phase 4: US2 (ingest events, cost by customer) — this is the point CostFlow
   delivers its core promise
5. **STOP and VALIDATE**: run quickstart.md Scenarios 1–2 end-to-end
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → founders can create an account, project, and API key
3. US2 → founders see who's costing them money (MVP complete)
4. US3 → founders see which features are costing them money
5. US4 → founders get proactive budget warnings
6. US5 → founders can export data for finance/co-founders
7. Polish → E2E coverage, performance verification, accessibility, load test, docs

### Parallel Team Strategy

With multiple developers: complete Setup + Foundational together, then one developer takes
US1 while a second stages US2's backend against a stubbed auth layer (US2's handlers need
`req.user`/API-key auth from US1, so full integration still waits on US1's completion). Once
US1 and US2 land, US3/US4/US5 can be split across developers in parallel, since none of the
three touch the same files as each other.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to its user story for traceability
- Verify each story's tests fail before implementing that story
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
- Total: 87 tasks across Setup, Foundational, 5 user stories, and Polish
