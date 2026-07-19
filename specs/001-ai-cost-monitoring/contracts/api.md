# API Contract: AI API Cost Monitoring

All endpoints return JSON (except CSV export/download). Authenticated user-facing endpoints
read the session from the `HttpOnly` JWT cookie; the ingestion endpoint authenticates via
`Authorization: Bearer <API_KEY>` instead. All error responses share the shape
`{ "error": { "code": string, "message": string } }`, where `message` is the plain-language,
actionable text required by the constitution's UX principle — never a bare status code.

## Auth

### `POST /api/v1/auth/signup`
- Body: `{ email, password }`
- 201: account created, confirmation email queued (FR-001)
- 400: invalid email/password format
- 409: email already registered

### `POST /api/v1/auth/login`
- Body: `{ email, password }`
- 200: sets session cookie, returns `{ user: { id, email } }`
- 401: invalid credentials, or email not yet confirmed
- 429: locked out (5 failed attempts/min from this source — FR-004)

### `POST /api/v1/auth/logout`
- 200: clears session cookie

### `POST /api/v1/auth/reset-password`
- Body (request): `{ email }` → 200 always (no user enumeration)
- Body (confirm): `{ token, newPassword }` → 200 on success, 400 on invalid/expired token

### `GET /api/v1/auth/verify-email?token=...`
- 200: marks `email_verified = 1`, redirects to login
- 400: invalid/expired token

## Projects

### `GET /api/v1/projects`
- 200: `{ projects: [{ id, name, createdAt, lastActiveAt, eventCount }] }` (FR-012)

### `POST /api/v1/projects`
- Body: `{ name }`
- 201: `{ id, name, apiKey }` — `apiKey` is the **only** time the plaintext key is returned (FR-008)
- 400: name invalid/duplicate
- 403: user already has 3 active projects (FR-007)

### `GET /api/v1/projects/:id`
- 200: project detail (no `apiKey`, ever, after creation)
- 403: project not owned by caller (FR-006)
- 404: not found or soft-deleted

### `PUT /api/v1/projects/:id`
- Body: `{ name }` — rename (FR-010)

### `DELETE /api/v1/projects/:id`
- 200: soft-deletes; recoverable for 7 days (FR-010, FR-011)

### `POST /api/v1/projects/:id/regenerate-key`
- 200: `{ apiKey }` — new plaintext key, old key invalid immediately (FR-009)

## Event Ingestion

### `POST /api/v1/events`
- Auth: `Authorization: Bearer <API_KEY>`
- Body: a single event object or `{ events: [...] }` for batch (FR-014)
  - Required: `customer_id`, `feature`, `provider`, `model`, `input_tokens`, `output_tokens`
  - Optional: `request_id`, `timestamp` (defaults to receipt time), `metadata`
- 202: accepted (including silently-deduplicated repeats — FR-016)
- 400: missing/malformed required field
- 401: invalid or revoked API key
- 429: rate limit exceeded — response includes `Retry-After` (seconds) (FR-018)

## Dashboards

### `GET /api/v1/projects/:id/customers?range=7d|30d|90d|custom&from=&to=&sort=&page=`
- 200: `{ customers: [{ customerId, totalCost, requestCount, trend: number[] }], page, totalPages }` (FR-021, FR-022)

### `GET /api/v1/projects/:id/customers/:customerId?range=...`
- 200: feature breakdown for that customer (FR-023)

### `GET /api/v1/projects/:id/features?range=...&sort=&page=`
- 200: `{ features: [{ feature, totalCost, requestCount, avgCostPerRequest, trend: number[] }], page, totalPages }` (FR-025, FR-026)

### `GET /api/v1/projects/:id/features/:featureName?range=...`
- 200: customer breakdown for that feature (FR-027)

## Budgets & Alerts

### `GET /api/v1/projects/:id/budgets`
- 200: `{ monthlyLimit, dailyLimit, thresholds, enabled }`

### `PUT /api/v1/projects/:id/budgets`
- Body: `{ monthlyLimit?, dailyLimit?, thresholds, enabled }` (FR-029, FR-030)

### `GET /api/v1/projects/:id/alerts`
- 200: `{ alerts: [{ type, threshold, amountAtTrigger, sentAt }] }` (FR-033)

## Export

### `POST /api/v1/projects/:id/export`
- Body: `{ scope: "customers"|"features", from, to }`
- 200 (≤50,000 rows): `text/csv` streamed immediately, filename `costflow_export_YYYY-MM-DD.csv` (FR-036, FR-037)
- 202 (>50,000 rows): `{ estimatedRows, message: "emailed within 5 minutes" }`, background job emails a link (FR-036)

### `GET /api/v1/exports/:exportId?token=...`
- 200: `text/csv` download of a background-generated export
- 410: link expired (>24h) (FR-036)
