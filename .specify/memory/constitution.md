<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0 (MAJOR — redefines/removes prior NON-NEGOTIABLE technology
  mandates: Decimal-only cost math, project-wide TypeScript, Redis caching, Prisma Migrate,
  React.lazy/Suspense lazy-loading, SendGrid. This is a deliberate pivot to a minimal-dependency,
  local-first architecture, not a clarification.)
- Modified principles:
  - I. Code Quality & Type Safety → reworded: TypeScript scope narrowed to backend-only,
    cost math changed from mandatory `Decimal` to `Number` with a documented rounding
    discipline.
  - II. Testing Standards (NON-NEGOTIABLE) → external dependency mock list updated
    (Redis/SendGrid → SQLite/SMTP).
  - IV. Performance Requirements (Hard Limits) → Redis caching mandate and
    React.lazy/Suspense mandate removed and replaced with stack-appropriate equivalents;
    numeric hard limits unchanged.
  - Data Management & Database Rules → Prisma Migrate replaced with plain SQL migration
    files; `EXPLAIN ANALYZE` (PostgreSQL) replaced with `EXPLAIN QUERY PLAN` (SQLite);
    date-range partitioning replaced with the index set the schema actually uses.
- Added sections:
  - Technology Constraints (NON-NEGOTIABLE) — documents the allowed/forbidden package list
    and the local-first, vanilla-JS architecture decision, so future plans and reviews have
    a single source of truth instead of re-deriving it from a chat message.
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (Constitution Check gate reads
    generically from this file)
  - .specify/templates/spec-template.md ✅ no changes needed (spec.md for the current feature
    was already written implementation-agnostic and needs no rework)
  - .specify/templates/tasks-template.md ✅ no changes needed (task scaffolding is stack-agnostic)
- Follow-up TODOs: none — no placeholders deferred
-->

# CostFlow Constitution

## Core Principles

### I. Code Quality & Type Safety

TypeScript strict mode MUST be enabled for all backend code; the `any` type MUST NOT be used,
and every backend function MUST declare explicit input and return types. Frontend code MUST be
vanilla JavaScript (ES2020+) delivered as native ES modules — it is exempt from the TypeScript
requirement by design, but MUST still avoid implicit, untyped contracts with the backend: every
fetch call MUST treat the API response shape as documented in the relevant contract, not
inferred ad hoc. Functions MUST stay under 20 lines and MUST have a single responsibility —
extract a helper rather than growing a function. Every async function MUST wrap its work in
try-catch and emit structured error logs containing `user_id`, `request_id`, and the error
message. The backend MUST maintain a strict controller (HTTP) / service (business logic) /
repository (database queries) separation — a controller MUST NOT contain business logic and a
service MUST NOT issue raw queries outside its repository. Prices, thresholds, and other
configuration MUST live in a single constants module, never as inline literals. Cost
calculations MUST use `Number`, computed in a fixed, consistent operation order, and MUST be
rounded to 4 decimal places with `toFixed(4)` only at the point of storage or display — never
mid-calculation — to keep floating-point drift from compounding; this is an accepted precision
tradeoff in exchange for a zero-extra-dependency backend, and it MUST be revisited if
sub-cent accuracy issues are ever observed in production data. Every exported function MUST
carry a JSDoc comment; comments in general MUST explain WHY code exists (a constraint, a
workaround, a non-obvious invariant), not WHAT it does.

**Rationale**: CostFlow's entire value proposition is an accurate dollar figure. A stray `any`
on the backend, business logic leaking into a controller, or an inconsistent rounding point in
the cost formula directly risks producing a wrong cost shown to a paying customer's customer.

### II. Testing Standards (NON-NEGOTIABLE)

Services and utilities MUST maintain at least 80% unit test coverage; cost calculation logic
MUST maintain at least 90% coverage. Every API endpoint MUST have at least one integration test
covering the happy path and at least one covering a failure path. End-to-end tests MUST cover
the full funnel: signup → create project → send event → view dashboard → export CSV. Tests
MUST be named `should [expected behavior] when [condition]` and MUST follow the
Arrange-Act-Assert pattern with one assertion per test. All external dependencies — the SQLite
database, the SMTP server — MUST be mocked or run against an isolated test database in unit and
integration tests; production data MUST NOT be touched by any test run. Test files MUST live
next to the source file they test (e.g., `cost.service.ts` → `cost.service.test.ts`).

**Rationale**: Cost calculation is billing-adjacent logic; an untested regression here produces
silently wrong invoicing data that customers will not discover until it's a support escalation
or a trust problem.

### III. User Experience Consistency

Every data-fetching action MUST show a loading skeleton or spinner within 100ms of being
triggered. Every button MUST show a loading state and be disabled while its request is
in-flight. Error messages MUST be plain language and actionable — raw status codes (e.g.
"Error 400") or generic fallbacks (e.g. "Something went wrong") MUST NOT reach the user. Every
user-initiated action MUST resolve to a toast — success (green), error (red), or warning
(yellow) — that auto-dismisses after 5 seconds. Form inputs MUST validate inline as the user
types, with errors rendered below the field, using native HTML form validation
(`checkValidity()`) as the first line of defense. Interactive elements MUST use semantic HTML
(`button`, `a`, `label`, `input`) — a `div` or `span` MUST NOT be used as a clickable element.
Every interactive element MUST have an `aria-label` and MUST be reachable and operable via
keyboard (Tab, Enter, Space). Color MUST NOT be the sole indicator of state — it MUST be paired
with an icon or text.

**Rationale**: Founders adopting CostFlow are trusting it with cost data that informs their own
pricing and margin decisions; a sluggish, ambiguous, or inaccessible interface undermines that
trust as much as an incorrect number would.

### IV. Performance Requirements (Hard Limits)

The following are hard limits, not aspirational targets — a release that violates any of them
MUST NOT ship: API response time p95 under 500ms; dashboard load time under 2 seconds including
data; Time to Interactive under 3 seconds; First Contentful Paint under 1 second; JavaScript
bundle size under 500KB gzipped; event ingestion endpoint latency under 100ms per event;
database query time under 100ms p95. Query performance MUST be enforced with indexes on
`(project_id, timestamp)`, `(project_id, customer_id)`, and `(project_id, feature)`, plus
`(provider, model, effective_date)` on the pricing table. Dashboard aggregate queries MUST be
served directly from these indexes on the local SQLite database — no external caching layer is
required or permitted to paper over an unindexed query. Routes and heavy client-side modules
MUST be lazy-loaded via native dynamic `import()`. N+1 query patterns MUST be eliminated — use
SQL JOINs or batched queries, never a database call inside a loop. Every release MUST be
load-tested by simulating 1,000 events/min for 1 hour without degradation before shipping.

**Rationale**: The event ingestion endpoint sits on the hot path of every API call a customer's
product makes to OpenAI; latency or degradation there compounds across every request their own
customers generate, making performance a correctness concern as much as a UX one.

## Technology Constraints (NON-NEGOTIABLE)

CostFlow is built as a minimal-dependency, local-first application: Vite is the only build
tool; the frontend MUST be vanilla HTML, CSS, and JavaScript — no frontend framework
(React/Vue/Svelte/Angular), no component library, no state management library, no CSS
framework or CSS-in-JS. The backend MAY use TypeScript and Node.js's native `http` module (or
Express only if routing complexity genuinely requires it). Data is stored in a single local
SQLite file via `better-sqlite3`, accessed with raw SQL — no ORM. The complete set of allowed
runtime npm packages is: `vite`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `nodemailer`. Any
addition to this list MUST be justified in the Complexity Tracking table of the relevant
`plan.md` before use. Charts, sparklines, toasts, skeletons, sortable tables, and pagination
MUST be hand-built (native SVG, vanilla CSS animation, vanilla JS) rather than pulled from a
library. IDs MUST use `crypto.randomUUID()`. This constraint exists independently of, and
takes precedence over, any general "use a well-known library" instinct elsewhere in this
document.

**Rationale**: Every dependency is a maintenance, security, and bundle-size liability for a
solo/small-team SaaS; a deliberately small, auditable dependency surface is a product decision,
not an oversight, and reviewers MUST treat an unnecessary new package as a constitution
violation, not a convenience.

## Security & Data Protection (NON-NEGOTIABLE)

API keys MUST NOT be logged or stored in plaintext — they MUST be hashed with bcrypt (via
`bcryptjs`) before storage. Passwords MUST be hashed with bcrypt before storage. User prompts
and AI responses MUST NOT be stored — only metadata (tokens, model, cost, `customer_id`) MUST
be persisted. All inputs MUST be validated for type, length, and format before processing.
Endpoints MUST be rate-limited to 1,000 requests/min per API key, and an IP MUST be locked out
for 15 minutes after 5 failed authentication attempts within a minute. Sessions MUST be issued
as JWTs (RS256) and MUST be stored only in cookies set `HttpOnly`, `Secure`, and
`SameSite=Strict`. All connections MUST use TLS 1.3 only.

## Data Management & Database Rules

All schema changes MUST be made through versioned, sequentially-numbered plain SQL migration
files (e.g. `migrations/001_create_users.sql`) applied in order — ad hoc, untracked SQL against
the live database MUST NOT be used. Queries MUST NOT perform full table scans; every query
MUST hit one of the indexes defined in the Performance Requirements principle, and
`EXPLAIN QUERY PLAN` MUST be used in code review to verify this before merge. Destructive
actions MUST use soft deletes (a `deleted_at` timestamp), with hard deletion occurring only
after a 7-day retention window.

## Development Workflow & Release Gates

All tests MUST pass before any merge to `main` — no exceptions. Every PR MUST receive at least
1 approval that explicitly checks logic, tests, performance, and security. Releases MUST follow
semantic versioning (`major.minor.patch`) and MUST ship with written release notes. The rollback
procedure MUST be tested before every production deployment. Load test results MUST be attached
to the launch approval gate before a release is approved.

## Governance

This constitution supersedes all other engineering practices and conventions when they
conflict. Amendments are made by editing this file, MUST include a rationale for the change,
and MUST bump the version according to semantic versioning: MAJOR for backward-incompatible
principle removals or redefinitions, MINOR for a new principle or materially expanded guidance,
PATCH for wording or clarification fixes. Amending this file MUST also trigger a check of
`.specify/templates/plan-template.md`, `.specify/templates/spec-template.md`, and
`.specify/templates/tasks-template.md` for consistency, and the Sync Impact Report at the top
of this file MUST be updated accordingly.

Every PR and code review MUST verify compliance with these principles. Any deviation — including
any new npm package outside the allowed list in Technology Constraints — MUST be explicitly
justified in the Complexity Tracking section of the relevant `plan.md`; an unjustified
violation MUST block merge. Compliance is reviewed continuously via CI (lint, type-check,
coverage, and test gates) and at each release via the load test and rollback rehearsal required
above.

**Version**: 2.0.0 | **Ratified**: 2026-07-19 | **Last Amended**: 2026-07-19
