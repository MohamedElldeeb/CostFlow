# Quickstart: AI API Cost Monitoring

Validates the feature end-to-end once implemented. See [data-model.md](./data-model.md) for
schema and [contracts/api.md](./contracts/api.md) for request/response shapes — not repeated
here.

## Prerequisites

- Node.js 22.12+
- No external services: no PostgreSQL, no Redis — SQLite is a local file, email uses SMTP
  credentials in `.env` (a real SMTP account, or a local dev catcher like MailHog on
  `localhost:1025`)

## Setup

```bash
npm install                # installs only vite, better-sqlite3, bcryptjs, jsonwebtoken, nodemailer + devDeps
cp .env.example .env       # fill in SMTP_* and DB_PATH; JWT keys auto-generate on first run
npm run migrate            # applies migrations/*.sql in order against ./data/costflow.db
npm run seed               # inserts sample OpenAI pricing rows + one demo project
npm run dev                # starts Vite dev server + Node backend
```

## Scenario 1 — Account, Project & API Key Setup (User Story 1)

1. Open `/signup.html`, submit a valid email + password → confirmation email received (or
   visible in the SMTP dev catcher).
2. Follow the confirmation link → `GET /api/v1/auth/verify-email` returns 200.
3. Log in at `/login.html` → redirected to `/projects.html`, empty list.
4. Create a project named "Demo App" → API key shown once; copy it.
5. Reload `/projects.html` → the key is never shown again, project appears in the list.
6. Call `POST /projects/:id/regenerate-key` → old key now returns 401 on `/api/v1/events`; new
   key works; existing event history (if any) is untouched.
7. Attempt a 4th project → 403 with an explanatory message.

**Expected**: matches spec.md User Story 1 acceptance scenarios 1–6.

## Scenario 2 — Ingest Events & Cost by Customer (User Story 2)

1. Send a batch of events via `curl` or a small script against `POST /api/v1/events` using the
   API key from Scenario 1, covering at least 2 distinct `customer_id` values and 2 `feature`
   values, using a model present in the seeded pricing table.
2. Re-send one event with the same `request_id` → still 202, but `SELECT COUNT(*)` on `events`
   for that `request_id` stays at 1 (dedup — FR-016).
3. Send one event with an unknown `model` → stored with `cost IS NULL`.
4. Open `/project.html?id=...`, Cost by Customer tab → within 60 seconds, both customers
   appear, sorted by cost descending by default.
5. Click a customer row → feature breakdown drill-down loads.
6. Change the date range filter → totals update.

**Expected**: matches spec.md User Story 2 acceptance scenarios 1–8; SC-002, SC-003, SC-007.

## Scenario 3 — Cost by Feature (User Story 3)

1. On the same project, switch to the Cost by Feature tab → features ranked by cost descending.
2. Click a feature row → customer breakdown for that feature loads.

**Expected**: matches spec.md User Story 3.

## Scenario 4 — Budget Alerts (User Story 4)

1. In Project Settings, set a monthly limit low enough that the events already sent exceed 50%
   of it, enable the 50% threshold.
2. Trigger (or wait for) the hourly budget check — for local validation, this can be invoked
   directly rather than waiting an hour.
3. Confirm exactly one alert email is received containing current spend, limit, percentage, and
   top customers/features.
4. Re-trigger the check the same day → no duplicate email.
5. Open `/alerts.html?id=...` → the alert appears with correct threshold and amount.

**Expected**: matches spec.md User Story 4 acceptance scenarios 1–5.

## Scenario 5 — CSV Export (User Story 5)

1. From Cost by Customer, choose "last 30 days" and request an export → estimated row count
   shown before confirming.
2. Confirm → CSV downloads immediately (event count is well under 50,000 in this local test),
   named `costflow_export_YYYY-MM-DD.csv`, cost values to 4 decimal places.
3. (Optional, if simulating the large-export path) insert >50,000 synthetic rows via the seed
   script, repeat the export → response is 202 with an estimate, and a download link arrives by
   email within 5 minutes; confirm the link 410s after the 24-hour expiry window (can be
   verified by inspecting the stored `expires_at` rather than waiting 24 hours).

**Expected**: matches spec.md User Story 5 acceptance scenarios 1–3; SC-006.

## Non-functional checks

- `npm run build` produces a `/dist` bundle under 500KB gzipped (constitution Performance
  Requirements).
- Run `EXPLAIN QUERY PLAN` against the Cost by Customer and Cost by Feature queries — confirm
  each uses one of the four required indexes, not a full table scan.
- Load test: replay 1,000 events/min against `/api/v1/events` for 1 hour — no valid event
  rejected, ingestion latency stays under 100ms (SC-007, constitution load-test gate).
