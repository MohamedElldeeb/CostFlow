# Phase 1 Data Model: AI API Cost Monitoring

Schema is SQLite, owned by the numbered migration files in `./migrations/`. All timestamps are
stored as Unix epoch integers (seconds). All IDs are `crypto.randomUUID()` strings. This model
implements the Key Entities from [spec.md](./spec.md) and the constitution's index requirements.

## users

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | `crypto.randomUUID()` |
| `email` | TEXT UNIQUE NOT NULL | Validated format + length before insert (FR-001) |
| `password_hash` | TEXT NOT NULL | bcrypt, 10 rounds — never the raw password (FR-005) |
| `created_at` | INTEGER NOT NULL | Epoch seconds |
| `email_verified` | INTEGER NOT NULL DEFAULT 0 | 0/1 boolean; login blocked while 0 (FR-001) |

**Validation rules**: email must match a standard email format and be unique account-wide.
Password strength is enforced at the handler layer before hashing (minimum length; exact policy
is a UI-layer concern, not schema-enforced).

## projects

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `user_id` | TEXT NOT NULL | FK → `users.id` |
| `name` | TEXT NOT NULL | 1–100 chars, unique per `user_id` (FR-007) — enforced via `UNIQUE(user_id, name)` |
| `api_key_hash` | TEXT NOT NULL | bcrypt hash of a 32+ char random key; plaintext shown once at creation/regeneration only (FR-008, FR-009) |
| `created_at` | INTEGER NOT NULL | |
| `deleted_at` | INTEGER NULL | Soft delete marker; NULL = active (FR-011) |

**Validation rules**: a user may have at most 3 rows with `deleted_at IS NULL` (FR-007,
enforced at the service layer, not a DB constraint, since SQLite cannot express a
conditional-count check declaratively). Rows with `deleted_at` older than 7 days are purged by
a periodic sweep (FR-011).

**State transitions**: `active` (`deleted_at IS NULL`) → `soft-deleted` (`deleted_at` set) →
purged (row removed) after 7 days. API key: `active` → `regenerated` (old hash replaced,
immediately invalid) with `events` rows untouched.

## events

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `project_id` | TEXT NOT NULL | FK → `projects.id` |
| `customer_id` | TEXT NOT NULL | Free-form identifier from the integrating app (FR-013) |
| `feature` | TEXT NOT NULL | Free-form identifier from the integrating app |
| `provider` | TEXT NOT NULL | e.g. `openai` |
| `model` | TEXT NOT NULL | e.g. `gpt-4o` |
| `input_tokens` | INTEGER NOT NULL | ≥ 0 |
| `output_tokens` | INTEGER NOT NULL | ≥ 0 |
| `cost` | REAL NULL | NULL when no pricing match exists yet (FR-017); otherwise `Number`, rounded to 4 decimals at write time |
| `request_id` | TEXT NULL | Dedup key (FR-016) |
| `timestamp` | INTEGER NOT NULL | Epoch seconds — the event's own occurrence time, used for pricing lookup (FR-015) |
| `metadata` | TEXT NULL | Opaque JSON string; never prompt/response content (FR-020) |

**Indexes**: `idx_events_project_timestamp (project_id, timestamp)`,
`idx_events_project_customer (project_id, customer_id)`,
`idx_events_project_feature (project_id, feature)`,
`UNIQUE INDEX idx_events_dedup (project_id, request_id) WHERE request_id IS NOT NULL`.

**Validation rules**: `input_tokens`/`output_tokens` must be non-negative integers; `provider`,
`model`, `customer_id`, `feature` must be non-empty strings within a bounded length (reject
oversized payloads per FR edge case "malformed values"). `cost` is computed server-side and is
never accepted from the caller.

## pricing

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `provider` | TEXT NOT NULL | |
| `model` | TEXT NOT NULL | |
| `input_price` | REAL NOT NULL | Price per 1,000 input tokens, USD |
| `output_price` | REAL NOT NULL | Price per 1,000 output tokens, USD |
| `effective_date` | INTEGER NOT NULL | Epoch seconds; the rate in force from this date until superseded |

**Indexes**: `idx_pricing_model_date (provider, model, effective_date)`.

**Relationship**: not a foreign key from `events` — looked up at write time by
`(provider, model, effective_date <= events.timestamp)`, most recent match wins (see
[research.md](./research.md) §3). Maintained centrally by CostFlow, not by end users (spec
Assumptions).

## budgets

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `project_id` | TEXT UNIQUE NOT NULL | One budget config per project — FK → `projects.id` |
| `monthly_limit` | REAL NULL | USD; NULL = not set (FR-029) |
| `daily_limit` | REAL NULL | USD; NULL = not set |
| `thresholds` | TEXT NOT NULL DEFAULT '[50,75,90,100]' | JSON array of the enabled percentages (FR-030) |
| `enabled` | INTEGER NOT NULL DEFAULT 1 | 0/1 — master on/off switch (FR-030) |

## alerts

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `project_id` | TEXT NOT NULL | FK → `projects.id` |
| `type` | TEXT NOT NULL | `monthly` \| `daily` |
| `threshold` | REAL NOT NULL | Which percentage fired (50/75/90/100) |
| `amount_at_trigger` | REAL NOT NULL | Spend at the moment of firing (FR-033) |
| `sent_at` | INTEGER NOT NULL | Epoch seconds |

**Validation rules**: at most one row per `(project_id, type, threshold, calendar day of
sent_at)` — enforced at the service layer when the hourly check runs, implementing the
once-per-threshold-per-day rule (FR-031, spec edge case).

## Entity relationships

```text
users 1──* projects 1──* events
                  │
                  ├──1 budgets 1──* alerts
                  │
pricing (looked up by provider+model+effective_date, not FK-linked)
```
