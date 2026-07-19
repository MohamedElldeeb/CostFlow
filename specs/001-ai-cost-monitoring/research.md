# Phase 0 Research: AI API Cost Monitoring

No `[NEEDS CLARIFICATION]` markers were left in the Technical Context, but several
implementation-strategy decisions were required to reconcile the stack description with the
constitution's Testing Standards and Security principles. Each is recorded below so the
reasoning is auditable rather than implicit in code.

## 1. Test tooling under a 5-package runtime allowlist

**Decision**: Use Node.js's built-in test runner (`node:test`) and assertion module
(`node:assert/strict`) for all backend unit and integration tests. Use Playwright, installed as
a devDependency only, for the single mandated end-to-end funnel test.

**Rationale**: The constitution's Technology Constraints section scopes the five-package
allowlist to *runtime* npm packages; Playwright and any TypeScript tooling never ship to
production, matching the treatment already given to Vite itself. Node 22 ships a test runner
and assertion library out of the box, so backend testing needs zero additional packages at all.
This satisfies the Testing Standards principle (coverage thresholds, AAA pattern, colocated
`*.test.ts` files) without expanding the dependency surface the Technology Constraints section
exists to protect.

**Alternatives considered**: Vitest/Jest — rejected as unnecessary; `node:test` already
provides everything required (describe/test, mocking via `node:test`'s `mock`, coverage via
`node --experimental-test-coverage`). No E2E library — rejected because the constitution's
Testing Standards principle explicitly mandates a full-funnel E2E test, which cannot be done
without browser automation.

## 2. JWT RS256 key management

**Decision**: On first server startup, generate an RSA keypair with Node's built-in `crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })` if one does not already exist, and persist it as `data/jwt-private.pem` / `data/jwt-public.pem` (gitignored, alongside `costflow.db`). The private key signs sessions; the public key verifies them. The `JWT_SECRET` variable from the original `.env.example` sketch is dropped — RS256 is an asymmetric algorithm and cannot be driven by a single shared secret.

**Rationale**: The constitution requires RS256 specifically (not HS256), and a single-process
monolith can still benefit from asymmetric signing (e.g., a future read-only service could
verify tokens with only the public key). Generating the keypair with built-in `crypto` keeps
this at zero additional npm packages, consistent with Technology Constraints.

**Alternatives considered**: HS256 with a single `JWT_SECRET` — rejected because it contradicts
the constitution's explicit RS256 requirement, even though it would have matched the original
`.env.example` sketch more literally; flagging this mismatch rather than silently picking HS256
respects the NON-NEGOTIABLE tag on that requirement. Storing keys only in `.env` as PEM strings
— rejected as needlessly awkward to manage compared to two files next to the database that are
already gitignored by convention.

## 3. Pricing lookup for cost calculation

**Decision**: For a given event, select the pricing row where `provider` and `model` match and
`effective_date <= event.timestamp`, ordered by `effective_date` descending, limit 1 (the most
recent rate at or before the event's own time).

**Rationale**: Directly implements FR-015 and the mid-month pricing-change edge case — an
event's cost must reflect the rate in force when it happened, not the current rate or an exact
calendar-date match (pricing does not necessarily change on the same day every event occurs).

**Alternatives considered**: Exact-date match — rejected, would leave most events uncosted since
they won't fall exactly on a pricing row's effective date. Always using the latest price —
rejected, violates FR-015 and would retroactively misprice historical events after a price
change.

## 4. Duplicate event handling

**Decision**: A `UNIQUE(project_id, request_id)` constraint (partial, only enforced when
`request_id IS NOT NULL`) on the `events` table. Insert attempts that violate it are caught and
treated as a silent success (HTTP 202), per FR-016.

**Rationale**: Pushes deduplication into the database's own integrity guarantee rather than a
read-then-write race in application code, which matters because `better-sqlite3` is
synchronous but the ingestion endpoint may receive concurrent batches.

**Alternatives considered**: Application-level "check then insert" — rejected, race-prone under
concurrent requests for the same `request_id`.

## 5. Rate limiting implementation

**Decision**: An in-memory `Map<apiKey, { count, windowStart }>` fixed-window counter, reset
every 60 seconds, enforcing the 1,000 events/minute limit from FR-018.

**Rationale**: No Redis is available (Technology Constraints), and the Scale/Scope section
confirms this is explicitly a single-process, single-machine deployment — an in-memory limiter
is accurate under that assumption. The tradeoff (counter resets on process restart, not shared
across instances) is acceptable because there are no other instances to share state with.

**Alternatives considered**: `express-rate-limit` / Redis-backed limiter — both forbidden by
Technology Constraints and unnecessary at this scale.

## 6. Large CSV export delivery (>50,000 rows)

**Decision**: A background export writes the CSV to `data/exports/<id>.csv` using a streamed,
paginated SQLite read (avoiding loading all rows into memory at once), then emails the download
link via `nodemailer`. An `expires_at` timestamp is checked on download; a periodic in-process
sweep (`setInterval`) deletes expired files.

**Rationale**: FR-036 requires background generation with an emailed link within 5 minutes and
24-hour expiry, but Technology Constraints forbid an external job queue. A single Node process
can run this as a non-blocking background task since `better-sqlite3` reads are fast and the
export itself does not need to block the HTTP response.

**Alternatives considered**: A dedicated job queue (BullMQ + Redis) — rejected, forbidden by
Technology Constraints and unnecessary for this scale.

## 7. Budget alert check cadence

**Decision**: An in-process `setInterval` scheduler runs hourly, querying all projects with
`budgets.enabled = 1` and comparing current spend against `monthly_limit`/`daily_limit`.

**Rationale**: Directly implements the spec's "system checks spending every hour" behavior
(FR-031) without an external scheduler/cron dependency.

**Alternatives considered**: OS-level cron calling an HTTP endpoint — rejected as an
unnecessary operational dependency for a single-process app; an in-process interval is simpler
to run, test, and reason about.

## 8. SQLite concurrency mode

**Decision**: Enable WAL mode (`PRAGMA journal_mode = WAL`) on database initialization.

**Rationale**: The ingestion endpoint (writes) and dashboard endpoints (reads) run concurrently
within the same process; WAL mode allows readers to proceed without blocking on a writer,
which matters for the p95 latency hard limits in the constitution's Performance Requirements.

**Alternatives considered**: Default rollback-journal mode — rejected, serializes readers behind
writers more aggressively, risking the 500ms p95 API and 100ms ingestion limits under load.

## 9. Password / API key hashing cost factor

**Decision**: `bcryptjs` with 10 salt rounds for both passwords and API keys.

**Rationale**: Industry-standard default balancing brute-force resistance against the
synchronous, single-threaded nature of `better-sqlite3` request handling — higher round counts
would risk the 500ms API p95 hard limit on auth endpoints.

**Alternatives considered**: 12+ rounds — rejected as unnecessarily slow for a
request-per-thread Node process with a hard latency ceiling; 10 rounds is still well above the
minimum commonly considered secure in 2026.
