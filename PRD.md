# CostFlow — Product Requirements Document

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | CostFlow |
| **Project ID** | PRD-001 |
| **Version** | v1.0 |
| **Status** | Draft |
| **Priority** | High |
| **Created Date** | July 18, 2026 |
| **Last Updated** | July 18, 2026 |
| **Owner** | Mohamed Eldeeb |
| **Team Members** | Frontend Developer, Backend Developer, Designer, QA Engineer |
| **Tech Stack** | React 18 + TypeScript + Tailwind CSS (Frontend); Node.js + Express + TypeScript + Prisma (Backend); PostgreSQL + Redis (Database) |
| **Repository** | [TBD] |
| **Git Branch Prefix** | PRD-feature-name |
| **PRD File Path** | docs/PRD.md |

---

## 2. Problem & Purpose

### Problem Statement
SaaS founders using AI APIs (OpenAI, Anthropic, etc.) cannot see which customers or features are driving costs. They only see total monthly bills, causing them to miss unprofitable accounts, waste money on expensive features, and fail to forecast spending. For example, a customer paying $20/month may cost $35/month in API usage, appearing as revenue while creating a loss.

### Project Purpose
CostFlow provides AI SaaS founders with granular visibility into API costs by customer and feature, enabling them to identify and eliminate unprofitable accounts, optimize expensive features, and forecast next month's bill.

### Business Value
- **Protects margins** by identifying customers who cost more than they pay
- **Enables profitable scaling** by showing which features and customers drive profitability
- **Forecasts spending** to prevent bill surprises
- **Reduces operational waste** by pinpointing expensive, inefficient features

### Opportunity
The AI SaaS market is growing rapidly, and API costs are the largest variable expense for these companies. Current solutions (provider dashboards, basic analytics) lack business context and profitability insight. CostFlow fills this gap by combining usage data with revenue and subscription information.

---

## 3. Goals & Objectives

### Primary Goal
Deliver a working MVP by September 30, 2026 that lets AI SaaS founders track API costs by customer and feature, identify unprofitable accounts, and set spending alerts.

### Objectives
1. Enable developers to integrate CostFlow with a simple SDK or REST API in under 10 minutes
2. Provide a dashboard that shows cost by customer, feature, and date with zero manual configuration
3. Send budget alerts when spending exceeds defined thresholds
4. Allow founders to export spending data in CSV format for further analysis
5. Support OpenAI API pricing models and auto-update pricing as rates change

### Success Definition
- **Launch:** MVP deployed and available for beta signups
- **Adoption:** 50+ beta users within 30 days of launch
- **Activation:** 30+ active projects tracking real API spending
- **Engagement:** Average 3+ logins per week per user
- **Retention:** 60%+ of beta users active after 30 days

### Non-Goals
- Multi-provider support in v1 (deferred to v2)
- Cost forecasting and predictive analytics
- Model recommendations or optimization suggestions
- Team collaboration features or role-based access
- Custom dashboard builder
- Webhook integrations or external automation

---

## 4. Scope

### In Scope — v1 MVP
- User authentication (email/password)
- Project creation and API key management
- OpenAI API event ingestion via REST endpoint or SDK
- Cost calculation based on real-time OpenAI pricing
- Dashboard: Cost by customer (daily and monthly)
- Dashboard: Cost by feature (daily and monthly)
- Dashboard: Total spending and trends
- Budget alerts via email
- CSV export of spending data
- Seven days of historical data retention
- Basic error handling and retry logic

### Out of Scope — Deferred to v2
- Anthropic, Gemini, ElevenLabs, and other provider integrations
- Profitability analysis (revenue vs. cost per customer)
- Real-time alerts via Slack or Discord
- Anomaly detection (spike alerts)
- Cost forecasting and predictions
- Model recommendations engine
- Team access and role-based permissions
- Custom reporting and dashboard builder
- Webhooks and third-party integrations
- Advanced security features (SAML, SSO)
- Mobile app or native clients

### Assumptions
- AI SaaS founders use OpenAI as their primary API provider
- Integration friction is the biggest barrier to adoption; developers will prefer an SDK
- Email alerts are sufficient for MVP; Slack integration can wait
- Profitability analysis requires revenue data that most customers don't want to share initially
- Historical pricing data and current rate cards are available from OpenAI's public documentation

### Constraints
- No budget for marketing or paid customer acquisition in v1
- Team size is lean; feature set must be achievable in 8 weeks
- Must avoid storing sensitive customer prompts or private data
- Pricing database must be kept current without manual updates
- Infrastructure costs must scale with customer usage

### Dependencies
- OpenAI API and pricing rate card stability
- Third-party email service (SendGrid, AWS SES)
- PostgreSQL and Redis hosting (Vercel Postgres, Railway, or similar)
- GitHub for repository and CI/CD
- Staging environment must mirror production

---

## 5. Users & Personas

### Primary User — AI SaaS Founder

| Attribute | Details |
|-----------|---------|
| **Name** | Alex (AI SaaS Founder) |
| **Role** | Technical founder or VP of Product |
| **Goal** | Understand which customers and features are profitable so they can make pricing, optimization, and feature decisions |
| **Pain Point** | API bills are exploding but they can't see which customers or features are causing the cost — only the total monthly amount |
| **Tech Level** | High (can read API documentation, integrate SDKs) |
| **Frequency** | Daily or weekly spending checks |
| **Success Definition** | Can identify top 5 most expensive customers and features within 2 minutes; receives alerts before overspending occurs |

### Secondary User — Finance/Operations Lead

| Attribute | Details |
|-----------|---------|
| **Name** | Jordan (Finance Lead) |
| **Role** | CFO, Finance Manager, or Operations Manager |
| **Goal** | Get visibility into current and forecasted API costs to improve financial planning and margin forecasts |
| **Pain Point** | Cannot allocate costs to projects or customers; surprises from overspending harm profitability |
| **Tech Level** | Low to Medium (prefers dashboards over APIs) |
| **Frequency** | Weekly or monthly review |
| **Success Definition** | Can export spending reports and understand which customers are profitable without asking the founder |

---

## 6. MoSCoW Feature Prioritization

### Must Have — P0 (Critical for MVP)

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---------|--------|-------------|------------|--------|
| P0-F001 | User Authentication | TODO | Email/password signup and login with session management | Backend Dev | Phase 1 |
| P0-F002 | Project Management | TODO | Create, list, and delete projects; generate and manage API keys | Backend Dev | Phase 1 |
| P0-F003 | OpenAI Event Ingestion | TODO | REST endpoint to receive usage events (customer, feature, model, tokens, cost) | Backend Dev | Phase 1 |
| P0-F004 | Cost Calculation Engine | TODO | Parse events and calculate estimated cost based on current OpenAI pricing | Backend Dev | Phase 1 |
| P0-F005 | Cost by Customer Dashboard | TODO | Display total cost, revenue, margin, and trends per customer (daily/monthly) | Frontend Dev | Phase 2 |
| P0-F006 | Cost by Feature Dashboard | TODO | Display total cost and usage per feature (daily/monthly) | Frontend Dev | Phase 2 |
| P0-F007 | Budget Alerts | TODO | Send email when spending exceeds user-defined daily or monthly limit | Backend Dev | Phase 3 |
| P0-F008 | CSV Export | TODO | Export spending data by customer and feature for external analysis | Backend Dev | Phase 3 |

### Should Have — P1 (Important for Usability)

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---------|--------|-------------|------------|--------|
| P1-F001 | Cost by Provider/Model | TODO | Breakdown of spending by OpenAI model and token usage | Frontend Dev | Phase 2 |
| P1-F002 | Profitability Analysis | TODO | Compare API cost vs. subscription revenue per customer; show gross margin | Backend Dev + Frontend Dev | Phase 3 |
| P1-F003 | Slack/Discord Alerts | TODO | Send real-time budget and spending alerts to Slack or Discord | Backend Dev | Phase 3 |
| P1-F004 | Anomaly Detection | TODO | Alert on sudden token spikes, unusual customer behavior, or cost increases | Backend Dev | Phase 4 |
| P1-F005 | Spending Trends Graph | TODO | Visualize cost trends over time (7-day, 30-day view) | Frontend Dev | Phase 3 |

### Could Have — P2 (Nice to Have)

| ID | Feature | Status | Description | Assigned To | Sprint |
|---|---------|--------|-------------|------------|--------|
| P2-F001 | Dark Mode | TODO | Toggle dark/light theme in dashboard | Frontend Dev | Phase 4 |
| P2-F002 | Keyboard Shortcuts | TODO | Quick navigation and export via keyboard | Frontend Dev | Phase 4 |
| P2-F003 | Bulk Actions | TODO | Bulk import events or update multiple budgets at once | Backend Dev | Phase 4 |

### Won't Have — P3 (Deferred to v2)

| ID | Feature | Status | Description | Reason |
|---|---------|--------|-------------|--------|
| P3-F001 | Multi-Provider Integration | DEFERRED | Support Anthropic, Gemini, ElevenLabs, and other providers | Out of scope for v1; requires separate pricing integrations and testing |
| P3-F002 | Cost Forecasting | DEFERRED | Predict end-of-month spending and future costs | Requires historical data and ML; can be added after v1 validation |
| P3-F003 | Model Recommendations | DEFERRED | Suggest cheaper models or prompt optimizations | Requires domain expertise and user feedback; v2 feature |
| P3-F004 | Team Access | DEFERRED | Multi-user support, roles, and permissions | Adds complexity; single-user MVP is sufficient for testing |
| P3-F005 | Custom Reports | DEFERRED | Build and schedule custom reports | Dashboard + CSV export is sufficient for v1 |
| P3-F006 | Webhooks | DEFERRED | Send events to external systems | Out of scope; consider in v2 based on customer requests |

---

## 7. Functional Requirements

### P0-F001: User Authentication

**Description**  
Users can create an account with email and password, log in securely, and maintain authenticated sessions.

**User Story**  
As an AI SaaS founder, I want to sign up for CostFlow with my email and password so that I can access my project dashboard securely.

**Trigger**  
User navigates to signup page or login page.

**Pre-conditions**
- User has a valid email address
- Email has not been registered before (for signup)
- User is not already logged in

**Post-conditions**
- User is authenticated and can access their dashboard
- Session token is created and stored securely
- User is redirected to project list or dashboard

**Main Flow**
1. User clicks "Sign Up" or "Log In"
2. User enters email and password
3. System validates email format and password strength (minimum 8 characters, no weak passwords)
4. System checks if email exists (signup) or if credentials match (login)
5. On success, system creates session token (JWT with 7-day expiration)
6. User is redirected to projects dashboard
7. Session cookie is set (HttpOnly, Secure, SameSite=Strict)

**Alternate Flows**
- **Invalid email format:** System shows inline error; user corrects and resubmits
- **Password too weak:** System rejects and suggests requirements
- **Email already registered (signup):** System prompts user to log in instead
- **Credentials not found (login):** System shows generic error "Email or password incorrect"
- **Session expired:** User is redirected to login; message "Session expired, please log in again"

**Acceptance Criteria**
- [ ] Users can sign up with email and password
- [ ] Password must be at least 8 characters long
- [ ] Passwords are hashed using bcrypt (salt rounds ≥ 10)
- [ ] Users can log in with correct credentials
- [ ] Users receive error message for incorrect credentials (no account enumeration)
- [ ] Sessions expire after 7 days of inactivity
- [ ] Session tokens are JWT-based and cryptographically signed
- [ ] Cookies use HttpOnly and Secure flags
- [ ] Signup confirms email (link sent to inbox)
- [ ] Password reset flow works end-to-end
- [ ] Failed login attempts are rate-limited (max 5 per minute per IP)

---

### P0-F002: Project Management

**Description**  
Users can create multiple projects, each with a unique API key and name. Projects organize customer and feature data.

**User Story**  
As a founder with multiple AI products, I want to create separate projects in CostFlow so that I can track costs for each product independently.

**Trigger**  
User clicks "Create Project" or views project list.

**Pre-conditions**
- User is logged in
- User has not reached project limit (3 projects for v1)

**Post-conditions**
- New project is created with unique API key
- Project appears in user's project list
- API key is displayed once and can be regenerated
- User is redirected to project dashboard

**Main Flow**
1. User clicks "Create Project"
2. User enters project name (e.g., "My AI Assistant")
3. System validates name (non-empty, unique per user, max 100 characters)
4. System generates unique API key (32+ character random string)
5. System creates project and stores in database
6. System displays API key with warning "Copy this key now; we won't show it again"
7. User can copy to clipboard or regenerate key
8. User is redirected to project dashboard

**Alternate Flows**
- **Project limit reached:** System shows error "You have reached the 3-project limit"; suggest upgrading plan
- **Regenerate key:** User clicks "Regenerate API Key"; system generates new key and invalidates old one (existing events still valid)
- **Delete project:** User clicks "Delete Project"; system prompts for confirmation; if confirmed, project and all data are deleted after 7-day retention period

**Acceptance Criteria**
- [ ] Users can create up to 3 projects in v1
- [ ] Each project has a unique, randomly generated API key
- [ ] Project names are unique per user and between 1–100 characters
- [ ] API keys are not displayed in project list; only in creation or regeneration
- [ ] Users can regenerate API keys without losing historical data
- [ ] Deleted projects are soft-deleted (retention for 7 days, then purged)
- [ ] Project list shows creation date, last active date, and event count
- [ ] Users can rename projects
- [ ] Users cannot access other users' projects (authorization check)

---

### P0-F003: OpenAI Event Ingestion

**Description**  
An API endpoint that receives usage events from the user's application. Events contain customer, feature, model, token counts, and metadata.

**User Story**  
As a developer, I want to send a simple JSON event to CostFlow every time my application calls OpenAI so that my costs are automatically tracked.

**Trigger**  
User's application sends a POST request to `/api/v1/events` with a valid API key and event payload.

**Pre-conditions**
- User has a valid project and API key
- Event payload is valid JSON
- Request includes Authorization header with API key

**Post-conditions**
- Event is stored in database
- Cost is calculated based on token counts and current OpenAI pricing
- Event appears in dashboard within 1 minute

**Main Flow**
1. User's application calls OpenAI API
2. After response, application sends event to CostFlow:
   ```
   POST /api/v1/events
   Authorization: Bearer <API_KEY>
   Content-Type: application/json
   
   {
     "customer_id": "cust_278",
     "feature": "pdf_summary",
     "provider": "openai",
     "model": "gpt-4",
     "input_tokens": 42000,
     "output_tokens": 3200,
     "request_id": "req_913",
     "timestamp": "2026-07-18T12:00:00Z",
     "metadata": {
       "plan": "pro",
       "workspace_id": "workspace_42"
     }
   }
   ```
3. System validates API key against project
4. System validates event schema (required fields: customer_id, feature, provider, model, input_tokens, output_tokens)
5. System looks up current OpenAI pricing for the model
6. System calculates cost: (input_tokens * input_price + output_tokens * output_price) / 1000
7. System stores event with calculated cost in database
8. System returns 202 Accepted

**Alternate Flows**
- **Invalid API key:** System returns 401 Unauthorized; no event stored
- **Malformed payload:** System returns 400 Bad Request with error details
- **Missing required fields:** System returns 400 with list of missing fields
- **Unknown model:** System returns 400; suggests valid models
- **Rate limit exceeded:** System returns 429; indicates retry-after header
- **Database error:** System returns 500; event is queued for retry

**Acceptance Criteria**
- [ ] API endpoint accepts POST requests at `/api/v1/events`
- [ ] Endpoint requires valid API key in Authorization header
- [ ] Event schema is validated (customer_id, feature, provider, model, tokens required)
- [ ] Cost is calculated using current OpenAI pricing
- [ ] Historical pricing is used if model price changes (events timestamped)
- [ ] Batch event ingestion is supported (array of events)
- [ ] Endpoint returns 202 Accepted on success
- [ ] Failed events are logged and can be retried
- [ ] Rate limiting: 1,000 events per minute per API key
- [ ] Events appear in dashboard within 60 seconds
- [ ] Duplicate events (same request_id) are ignored
- [ ] Sensitive data (prompts, responses) are not stored; only metadata

---

### P0-F004: Cost Calculation Engine

**Description**  
System calculates API costs based on token counts and OpenAI's current pricing. Pricing is updated regularly to reflect rate changes.

**User Story**  
As a founder, I want CostFlow to automatically calculate the cost of each API call so that I don't have to manually compute pricing.

**Trigger**  
Event is ingested via `/api/v1/events` endpoint.

**Pre-conditions**
- Event contains model name and token counts
- Current OpenAI pricing is available in system

**Post-conditions**
- Cost is calculated and stored with event
- Cost is visible in dashboard

**Main Flow**
1. Event is received with model name, input_tokens, output_tokens
2. System queries pricing database for model and current rates:
   ```
   model: "gpt-4"
   input_price: $0.03 per 1K tokens
   output_price: $0.06 per 1K tokens
   ```
3. System calculates:
   ```
   input_cost = (input_tokens / 1000) * input_price
   output_cost = (output_tokens / 1000) * output_price
   total_cost = input_cost + output_cost
   ```
4. System stores cost with event in database
5. System updates customer and feature cost aggregates (cached for dashboard speed)

**Alternate Flows**
- **Model pricing not found:** System returns error; event is stored with cost = null pending pricing update
- **Pricing changes during month:** System stores historical pricing with each event; older events use old pricing, new events use new pricing
- **Batch calculation:** If user uploads historical events, system calculates cost for all using rates from their respective dates

**Acceptance Criteria**
- [ ] Cost is calculated as (input_tokens / 1000) * input_price + (output_tokens / 1000) * output_price
- [ ] Pricing database includes all OpenAI models (GPT-4, GPT-3.5, etc.)
- [ ] Pricing is updated within 24 hours of OpenAI rate changes
- [ ] Historical pricing is maintained (cost uses price from event date, not current price)
- [ ] Cost precision is 4 decimal places ($0.0001)
- [ ] Zero-token events are handled (cost = $0)
- [ ] Unknown models are flagged and escalated to admin

---

### P0-F005: Cost by Customer Dashboard

**Description**  
Dashboard section displaying total API cost, subscription revenue, gross profit, and margin per customer. Enables identification of unprofitable accounts.

**User Story**  
As a founder, I want to see which customers cost me the most and which are unprofitable so that I can decide whether to optimize, limit, or sunset their access.

**Trigger**  
User logs in and navigates to project dashboard.

**Pre-conditions**
- Project has received at least one event
- Customer data is aggregated in database

**Post-conditions**
- Dashboard displays customer cost breakdown
- Table is sortable and filterable

**Main Flow**
1. System queries database for all customers in project
2. For each customer, system calculates:
   - Total cost (sum of all event costs)
   - Usage trend (daily costs over last 7 days)
   - Request count (number of events)
3. System displays table:
   | Customer | Total Cost | Usage Trend | Request Count | Actions |
   |----------|------------|------------|---------------|---------|
4. User can click on customer to see feature breakdown
5. User can sort by cost (descending), trend (highest growth), or request count
6. Data is cached and refreshed every 5 minutes

**Alternate Flows**
- **No customers yet:** System shows empty state with instruction to send first event
- **Filter by date range:** User selects date range (last 7 days, 30 days, custom); dashboard recalculates
- **Export to CSV:** User clicks "Export"; system generates CSV of customer costs

**Acceptance Criteria**
- [ ] Dashboard displays customer name, total cost, request count
- [ ] Table is sortable by cost (ascending/descending), date added, and activity
- [ ] Table is paginated (50 customers per page)
- [ ] Data is updated within 5 minutes of event ingestion
- [ ] User can filter by date range (last 7/30/90 days or custom)
- [ ] User can drill down into customer to see feature breakdown
- [ ] Trend sparkline shows cost over last 7 days
- [ ] Loading state is shown during data fetch
- [ ] No data error state is shown if project has no events

---

### P0-F006: Cost by Feature Dashboard

**Description**  
Dashboard section displaying total API cost per feature. Enables prioritization of optimization efforts.

**User Story**  
As a founder, I want to see which features are most expensive so that I can optimize, limit, or charge more for them.

**Trigger**  
User logs in and navigates to project dashboard.

**Pre-conditions**
- Project has received at least one event
- Feature data is aggregated in database

**Post-conditions**
- Dashboard displays feature cost breakdown
- Table is sortable and filterable

**Main Flow**
1. System queries database for all features in project
2. For each feature, system calculates:
   - Total cost (sum of all event costs)
   - Usage trend (daily costs over last 7 days)
   - Request count (number of events)
   - Average cost per request (total cost / request count)
3. System displays table:
   | Feature | Total Cost | Requests | Avg Cost/Request | Trend |
   |---------|------------|----------|------------------|--------|
4. User can sort by cost, request count, or average cost per request
5. User can click feature to see customer breakdown
6. Data is cached and refreshed every 5 minutes

**Alternate Flows**
- **No features yet:** System shows empty state
- **Filter by date range:** User selects date range; dashboard recalculates
- **Export to CSV:** User clicks "Export"; system generates CSV of feature costs

**Acceptance Criteria**
- [ ] Dashboard displays feature name, total cost, request count, average cost per request
- [ ] Table is sortable by cost, request count, and average cost
- [ ] Table is paginated (50 features per page)
- [ ] Data is updated within 5 minutes of event ingestion
- [ ] User can filter by date range
- [ ] User can drill down to see which customers use each feature
- [ ] Trend sparkline shows cost over last 7 days
- [ ] Loading state is shown during data fetch

---

### P0-F007: Budget Alerts

**Description**  
System sends email alerts when project spending exceeds user-defined daily or monthly budget limits.

**User Story**  
As a founder, I want to set a monthly budget and receive an email alert when I'm approaching or exceeding it so that I can prevent overspending.

**Trigger**  
User sets budget limit in settings, or daily/monthly spend triggers limit.

**Pre-conditions**
- User has set a budget limit (daily or monthly)
- Project has been receiving events

**Post-conditions**
- Alert email is sent to user
- Alert is logged in system

**Main Flow**
1. User navigates to Project Settings → Budget Alerts
2. User sets:
   - Monthly budget: $500
   - Alert threshold: 80% ($400)
3. System stores budget configuration
4. Each hour, system calculates current month's spending
5. If spending ≥ 80% threshold:
   - System sends email: "Your API spending has reached $400 (80% of your $500 budget)"
   - System records alert sent (prevents duplicate emails)
6. If spending ≥ 100% threshold:
   - System sends urgent email: "You have exceeded your $500 budget. Current spending: $520"
   - System records alert sent

**Alternate Flows**
- **Daily budget:** User sets daily limit; system checks every hour; alerts on threshold and overage
- **Disable alerts:** User can toggle alerts on/off per project
- **Snooze alerts:** User can snooze notifications for 24 hours after receiving first alert

**Acceptance Criteria**
- [ ] Users can set daily and/or monthly budget limits
- [ ] Users can set alert thresholds (50%, 75%, 90%, 100%)
- [ ] Alerts are sent via email to project owner
- [ ] Duplicate alerts are prevented (only one email per day per threshold per project)
- [ ] Alerts include current spend, budget limit, and percentage used
- [ ] Alerts are timestamped and logged in database
- [ ] Users can view alert history in dashboard
- [ ] Users can disable alerts per project or globally
- [ ] Alert calculation is accurate to 2 decimal places

---

### P0-F008: CSV Export

**Description**  
Users can export spending data by customer and feature in CSV format for further analysis in Excel or data tools.

**User Story**  
As a founder, I want to export my spending data as CSV so that I can analyze it in Excel or share it with my finance team.

**Trigger**  
User clicks "Export" button on customer or feature dashboard.

**Pre-conditions**
- Project has received at least one event

**Post-conditions**
- CSV file is generated and downloaded to user's device

**Main Flow**
1. User navigates to Cost by Customer or Cost by Feature dashboard
2. User selects date range (optional; defaults to last 30 days)
3. User clicks "Export as CSV"
4. System queries database for all events in date range
5. System generates CSV file with columns:
   ```
   customer_id, feature, date, model, input_tokens, output_tokens, cost
   cust_001, pdf_summary, 2026-07-18, gpt-4, 42000, 3200, 0.18
   ```
6. System sends file to browser for download
7. File is named: `costflow_export_2026-07-18.csv`

**Alternate Flows**
- **Large dataset:** If export > 50,000 rows, system generates file asynchronously and emails download link
- **Custom columns:** User can select which columns to include in export

**Acceptance Criteria**
- [ ] Users can export all spending data as CSV
- [ ] CSV includes date, customer, feature, model, tokens, and cost columns
- [ ] Date format is ISO 8601 (YYYY-MM-DD)
- [ ] Cost values are formatted to 4 decimal places
- [ ] CSV is properly escaped (commas in strings are quoted)
- [ ] Users can filter by date range before export
- [ ] File download is immediate for datasets < 50k rows
- [ ] Large exports are sent via email with 24-hour download link
- [ ] Exported data matches dashboard totals exactly

---

## 8. Non-Functional Requirements

### Performance
- **API Response Time:** All endpoints must respond in < 500ms (p95)
- **Dashboard Load Time:** Dashboard must load and display data in < 2 seconds
- **Event Ingestion:** Can process 1,000 events per minute per project (initially; scale to 10,000 by v2)
- **Search:** Queries on customer and feature tables must complete in < 500ms even with 1M+ events
- **Caching:** Dashboard data is cached and updated every 5 minutes to reduce database load

### Security
- **Authentication:** All endpoints require valid API key (Bearer token in Authorization header) or session token (JWT)
- **Authorization:** Users can only access projects they own; no cross-project access
- **Data in Transit:** TLS 1.3 for all connections (HTTPS)
- **Data at Rest:** Database records are encrypted with AES-256 (provider-managed)
- **Secrets:** API keys, session tokens, and database passwords are never logged or exposed in error messages
- **Input Validation:** All inputs are validated for type, length, and format; SQL injection and XSS are prevented
- **Sensitive Data:** User prompts and API responses are never stored; only metadata (tokens, model, cost) is retained
- **Rate Limiting:** 
  - API endpoints: 1,000 requests per minute per API key
  - Auth endpoints: 5 failed attempts per minute per IP (lockout for 15 minutes)
  - Dashboard: 60 requests per minute per session

### Availability & Reliability
- **Uptime Target:** 99.9% (4.3 minutes downtime per month)
- **Backups:** Daily automated backups with 30-day retention
- **Failover:** Database uses hot standby; traffic automatically failover on primary failure
- **Monitoring:** Error rates, latency, and availability are monitored 24/7 via cloud provider alerts
- **Incident Response:** Critical incidents trigger PagerDuty alert within 1 minute

### Scalability
- **Database:** Partitioned by project_id; indexes on customer_id, feature, date for query speed
- **Caching:** Redis used for dashboard aggregates; cache invalidated on new events
- **Horizontal Scaling:** API servers are stateless and can scale horizontally behind load balancer
- **Event Backlog:** If ingestion falls behind, events are queued in message broker (e.g., SQS) and processed asynchronously

### Accessibility
- **WCAG 2.1 Level AA:** Dashboard and forms are accessible to users with visual, motor, and cognitive disabilities
- **Keyboard Navigation:** All interactive elements are accessible via keyboard; focus indicators are visible
- **Screen Reader Support:** Dashboard uses semantic HTML; table headers and labels are properly associated
- **Color Contrast:** Text has minimum 4.5:1 contrast ratio; information is not conveyed by color alone

### Compatibility
- **Browsers:** 
  - Chrome 100+
  - Safari 15+
  - Firefox 100+
  - Edge 100+
- **Devices:** Responsive design for desktop (1920px+) and tablet (768px+); mobile is out of scope for v1
- **JavaScript:** ES2020 minimum; no deprecated APIs

### Data & Compliance
- **Data Retention:** Raw events retained for 7 days in v1; aggregated data (by customer/feature) retained for 90 days
- **Data Deletion:** On project deletion, all data is soft-deleted for 7 days, then permanently purged
- **GDPR Readiness:** User personal data (email, name) can be exported or deleted on request; however, aggregated event data is retained
- **Audit Logging:** All API calls are logged with timestamp, user, action, and result; logs retained for 90 days

### Observability & Logging
- **Structured Logging:** All logs are JSON formatted with timestamp, level, service, user_id, request_id, message
- **Log Retention:** 30 days in application logs; longer in data warehouse for analytics
- **Monitoring Metrics:** 
  - API latency (p50, p95, p99)
  - Error rate (5xx, 4xx)
  - Event ingestion rate
  - Dashboard query performance
  - Database connection pool usage
- **Alerting:** 
  - Error rate > 1% triggers alert
  - Event ingestion lag > 5 minutes triggers alert
  - Database CPU > 80% triggers alert

---

## 9. Technical Architecture

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS with custom utility extensions
- **State Management:** React Query (server state) + React Context (client state)
- **Components:** Headless UI components (Radix UI) for accessibility
- **Visualization:** Recharts for charts and trends
- **Build Tool:** Vite with code splitting and lazy loading
- **Testing:** Vitest for unit tests, React Testing Library for component tests
- **Deployment:** Vercel with automatic deployments on main branch

### Backend Stack
- **Runtime:** Node.js 22 LTS (22.12+) with TypeScript
- **Framework:** Express with middleware (helmet for security, cors, express-validator for input validation)
- **Database ORM:** Prisma with TypeScript types
- **Authentication:** JWT with RS256 signing; refresh token rotation every 7 days
- **API Documentation:** OpenAPI/Swagger generated from code
- **Testing:** Jest for unit/integration tests
- **Deployment:** Railway or similar; Docker containerized

### Database Architecture
- **Primary:** PostgreSQL (v14+)
  - `users` table: id, email, password_hash, created_at
  - `projects` table: id, user_id, name, api_key, created_at
  - `events` table: id, project_id, customer_id, feature, model, input_tokens, output_tokens, cost, timestamp (partitioned by date)
  - `pricing` table: id, provider, model, input_price, output_price, effective_date (for historical pricing)
  - `budgets` table: id, project_id, monthly_limit, monthly_threshold, daily_limit, daily_threshold
  - `alerts` table: id, project_id, type (budget/anomaly), threshold, sent_at
- **Caching:** Redis (v7+)
  - Dashboard aggregates: customer_costs:{project_id}, feature_costs:{project_id}
  - Session cache: sessions:{session_id} (TTL 7 days)
  - API key cache: api_keys:{key_hash} (TTL 1 hour)
- **Indexing Strategy:**
  - Events: (project_id, timestamp), (project_id, customer_id), (project_id, feature)
  - Pricing: (provider, model, effective_date)
  - Budgets: (project_id, month)

### Authentication & Authorization
- **Login Flow:**
  1. User posts email/password to POST /auth/login
  2. Server verifies credentials; if valid, generates JWT (algorithm: RS256)
  3. JWT payload: { user_id, email, iat, exp }
  4. JWT is stored in HttpOnly cookie (expires 7 days)
  5. User can request new token before expiry using refresh token
- **API Key Flow:**
  1. User requests API key in project settings
  2. System generates 32+ character random string
  3. Only the plaintext key is shown once; hash is stored in database
  4. Client includes key in Authorization: Bearer {key} header
  5. Server hashes incoming key and compares to stored hash

### Infrastructure & Deployment
- **Hosting:** Vercel (frontend) + Railway/Render (backend database)
- **CDN:** Vercel's edge network for static assets
- **Database Backups:** Automated daily snapshots; 30-day retention
- **Secrets Management:** Environment variables via Vercel secrets (never committed to repo)
- **CI/CD Pipeline:**
  - GitHub Actions on push to main
  - Run tests, build, and deploy to staging automatically
  - Manual approval required for production deployment
  - Rollback capability via GitHub Actions

### External Integrations
- **Email Service:** SendGrid for transactional emails (alerts, password reset)
- **OpenAI API:** Fetch pricing from official rate card endpoint monthly
- **Error Tracking:** Sentry for client and server error monitoring
- **Analytics:** PostHog for product analytics (user behavior, feature usage)
- **Authentication:** No third-party OAuth; in-house with email/password only for v1

---

## 10. Implementation Phases

### Phase 1 — Foundation (Weeks 1–2)
**Goal:** Build authentication, project management, and event ingestion infrastructure.

**Tasks:**
- [ ] Set up development environment (Node.js, PostgreSQL, Redis, git)
- [ ] Design and create database schema (users, projects, events, pricing tables)
- [ ] Implement user signup/login with password hashing
- [ ] Create project creation and API key generation
- [ ] Build `/api/v1/events` endpoint with schema validation
- [ ] Implement event storage and cost calculation
- [ ] Set up GitHub Actions CI/CD pipeline
- [ ] Deploy to staging environment
- [ ] Write unit tests for auth and event ingestion (target: 80%+ coverage)

**Validation:**
- Can create user account and log in
- Can create project and receive API key
- Can send event and verify it's stored with calculated cost
- All tests pass

---

### Phase 2 — Core Dashboards (Weeks 3–4)
**Goal:** Build customer and feature cost dashboards with data visualization.

**Tasks:**
- [ ] Design dashboard layout and UI components (Figma → component library)
- [ ] Build Cost by Customer dashboard with table and sorting
- [ ] Build Cost by Feature dashboard with table and sorting
- [ ] Implement caching layer for dashboard aggregates
- [ ] Add date range filtering
- [ ] Create sparkline charts for cost trends
- [ ] Implement drill-down (customer → features, feature → customers)
- [ ] Write integration tests for dashboard data accuracy
- [ ] Deploy to staging and test with sample data

**Validation:**
- Dashboard loads within 2 seconds
- Data aggregates match sum of raw events exactly
- Sorting and filtering work correctly
- Drill-down shows correct sub-data

---

### Phase 3 — Alerts & Export (Weeks 5–6)
**Goal:** Add budget alerts and CSV export functionality.

**Tasks:**
- [ ] Build budget settings UI (daily/monthly limits, thresholds)
- [ ] Implement budget alert calculation and email sending
- [ ] Integrate SendGrid for transactional emails
- [ ] Build alert history view
- [ ] Implement CSV export for customer and feature data
- [ ] Add error handling for large exports (> 50k rows)
- [ ] Write tests for alert logic and email generation
- [ ] Deploy to staging and test end-to-end

**Validation:**
- Budget alerts are sent at correct thresholds
- Emails contain accurate data and formatting
- CSV exports match dashboard data exactly
- Large exports are handled without timeouts

---

### Phase 4 — Launch Hardening (Weeks 7–8)
**Goal:** Polish, optimize, and prepare for public launch.

**Tasks:**
- [ ] Performance optimization: dashboard < 2s, API < 500ms
- [ ] Security hardening: rate limiting, input validation, HTTPS enforcement
- [ ] Add monitoring and alerting (Sentry, PostHog, Vercel Analytics)
- [ ] Create API documentation (OpenAPI/Swagger)
- [ ] Build onboarding flow and tutorial
- [ ] Load testing: simulate 1,000 events/min, 100 concurrent users
- [ ] Finalize pricing page and landing page
- [ ] Create support documentation and FAQ
- [ ] Set up beta signup flow
- [ ] Deploy to production

**Validation:**
- Performance benchmarks met (< 2s dashboard, < 500ms API)
- Security audit passed
- Load test: system handles 1,000 events/min without degradation
- No critical bugs found in manual testing

---

## 11. User Flows & Edge Cases

### Primary User Flow: View Costs and Set Alerts

1. **User opens CostFlow dashboard**
   - System loads authentication check
   - If no session, redirects to login
   - If session valid, displays project list

2. **User selects project**
   - System loads Cost by Customer and Cost by Feature dashboards
   - Data is cached and refreshed every 5 minutes
   - Charts and tables display with current spending

3. **User reviews expensive customers**
   - Table shows top customers by cost
   - User clicks on a customer name
   - System shows that customer's feature breakdown
   - User identifies that "pdf_summary" feature costs $420/month (most expensive)

4. **User decides to set budget alert**
   - User navigates to Project Settings → Budget Alerts
   - Sets monthly budget: $500
   - Sets alert threshold: 80%
   - System saves configuration

5. **User receives alert**
   - Next hour, system calculates spending: $400
   - 80% threshold ($400) is reached
   - System sends email: "Your API spending has reached $400 (80% of $500 budget)"
   - User receives email and reviews dashboard

6. **User exports data for analysis**
   - User clicks "Export" on Cost by Customer dashboard
   - Selects date range: last 30 days
   - System generates CSV file
   - File is downloaded: `costflow_export_2026-07-18.csv`
   - User imports into Excel for further analysis

---

### Edge Case 1: Invalid Event Payload

**Condition:** Developer sends event with missing required field (e.g., model name)

**System Behavior:**
- System validates event schema
- Detects missing "model" field
- Rejects request with 400 Bad Request
- Response body: `{ "error": "Missing required field: model" }`
- Event is NOT stored

**User Feedback:**
- Developer sees error in logs
- Corrects payload and resends event
- Next request succeeds (202 Accepted)

---

### Edge Case 2: Unknown Model Name

**Condition:** Developer sends event with model name that doesn't exist in pricing database (e.g., "gpt-5" before it's released)

**System Behavior:**
- System ingests event
- Looks up model in pricing database
- Model not found
- Event is stored with cost = null
- Alert is logged for admin review

**User Feedback:**
- Event count increases in dashboard
- Cost by Customer shows null or "unknown cost"
- Admin is notified to update pricing

---

### Edge Case 3: API Key Regeneration

**Condition:** User regenerates API key after production SDK has been deployed

**System Behavior:**
- Old API key is marked as "inactive" in database
- New API key is generated
- Events using old key are rejected with 401 Unauthorized
- Events using new key are accepted (202)

**User Feedback:**
- Developer must update API key in code
- If not updated, events stop flowing and error logs appear
- Once updated, events resume

---

### Edge Case 4: Session Expiration

**Condition:** User's session expires (7 days of inactivity)

**System Behavior:**
- Next API call to dashboard sends expired JWT
- Server verifies JWT signature; expires_at is before now
- Server rejects request with 401 Unauthorized
- Response redirects client to login page

**User Feedback:**
- User is redirected to login screen
- Message: "Session expired. Please log in again."
- User re-enters credentials
- New session is created

---

### Edge Case 5: Large Event Batch Spike

**Condition:** Developer sends 10,000 events in 1 minute (spike due to bulk processing)

**System Behavior:**
- Rate limit: 1,000 events per minute per API key
- Requests 1–1,000 are accepted (202)
- Requests 1,001+ are rejected (429 Too Many Requests)
- Response includes Retry-After header: 60 seconds
- Rejected events are queued in message broker (SQS)

**User Feedback:**
- Developer sees 429 responses
- Implements exponential backoff retry logic
- Resubmits rejected events after 60 seconds
- All events eventually accepted

---

### Edge Case 6: Empty Project (No Events)

**Condition:** User creates project but hasn't sent any events yet

**System Behavior:**
- Dashboard loads
- Cost by Customer section shows empty state: "No data yet"
- Cost by Feature section shows empty state: "No data yet"
- Help text is displayed: "Send your first event to get started"
- Code snippet shows example event payload

**User Feedback:**
- User sees clear empty state with instructions
- User can quickly understand what to do next

---

### Edge Case 7: CSV Export with Large Dataset

**Condition:** User requests export of 1 year of data (1M+ events)

**System Behavior:**
- User clicks "Export as CSV"
- System checks dataset size
- Size > 50,000 rows
- System generates file asynchronously (in background job)
- User is shown message: "Export in progress. You'll receive a download link via email within 5 minutes."
- Background job generates CSV and uploads to object storage
- SendGrid sends email with 24-hour download link

**User Feedback:**
- User receives email within 5 minutes
- Clicks link to download CSV
- Link is valid for 24 hours
- File is ready to use in Excel

---

### Edge Case 8: Pricing Update Mid-Month

**Condition:** OpenAI announces price change effective immediately

**System Behavior:**
- System administrator updates pricing database
- New pricing is stored with effective_date = today
- Old pricing is preserved in historical records
- New events use new pricing
- Old events continue to use pricing from their original date

**User Feedback:**
- Events sent before price change use old pricing
- Events sent after price change use new pricing
- Dashboard accurately reflects costs using historical pricing

---

### Edge Case 9: Budget Limit Exceeded

**Condition:** Project spending exceeds monthly budget limit

**System Behavior:**
- User set monthly budget: $500
- Current month spending: $520
- System detects overage
- Sends email: "You have exceeded your $500 budget. Current spending: $520 (104%)"
- Email includes breakdown by customer and feature

**User Feedback:**
- User receives urgent alert
- Can immediately see which customers/features caused overage
- User can take action: disable feature, contact customer, increase budget

---

## 12. Success Metrics and KPIs

### Business Metrics

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| Beta Signups | 100+ | Google Analytics / signup form | Daily |
| Trial Activation | 50+ active projects | Projects with ≥1 event | Weekly |
| Trial Retention | 60% active after 30 days | % of signups still active | Monthly |
| Customer Feedback | 4.0+ star rating | In-app survey / email feedback | Monthly |
| Churn Rate | < 10% | % of cohort inactive after 30 days | Monthly |

### Product Metrics

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| Events Processed | 100K+ per day | API event count | Daily |
| Avg Events per Project | 1,000+ | Total events / project count | Weekly |
| Dashboard Views | 3+ per user per week | Google Analytics / session logs | Weekly |
| Feature Usage | Cost by Customer: 100%, Cost by Feature: 100%, Alerts: 50% | Tracked via event logging | Weekly |
| Alert Delivery | 100% | Emails sent vs. triggered | Daily |

### Technical Metrics

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| API Latency (p95) | < 500ms | CloudWatch / Vercel Analytics | Continuous |
| Dashboard Load Time | < 2s | Lighthouse / RUM | Continuous |
| Error Rate | < 0.1% | 5xx errors / total requests | Continuous |
| Uptime | 99.9% | Downtime minutes / 30 days | Monthly |
| Event Processing Lag | < 5 minutes | Time from event send to dashboard | Continuous |

### User Satisfaction Metrics

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| NPS (Net Promoter Score) | > 50 | In-app survey: "How likely to recommend?" | Monthly |
| CSAT (Customer Satisfaction) | > 8/10 | In-app survey: "Are you satisfied?" | Monthly |
| Support Response Time | < 24 hours | Email response time | Ongoing |
| Feature Request Volume | Track trends | GitHub Issues / support inbox | Weekly |

### Tracking & Review

- **Tool:** PostHog or Mixpanel for product analytics
- **Review Cadence:** 
  - Daily: API latency, error rate, uptime
  - Weekly: activation, engagement, feature usage
  - Monthly: cohort retention, NPS, churn, growth
- **Owner:** Mohamed Eldeeb (PM) reviews weekly; team discusses in Monday standup

---

## 13. Timeline and Milestones

**Start Date:** July 18, 2026  
**Target Launch:** September 30, 2026  
**Total Duration:** 11 weeks (8 weeks development + 3 weeks buffer/launch)

| Milestone | Description | Due Date | Status | Owner |
|-----------|-------------|----------|--------|-------|
| **Kickoff** | Team alignment, environment setup, design review | July 25, 2026 | TODO | Mohamed Eldeeb |
| **PRD Approved** | Stakeholders sign off on requirements | July 30, 2026 | TODO | Mohamed Eldeeb |
| **Phase 1 Complete** | Auth, projects, event ingestion deployed to staging | August 1, 2026 | TODO | Backend Lead |
| **Phase 2 Complete** | Dashboards (customer/feature) deployed to staging | August 15, 2026 | TODO | Frontend Lead |
| **Phase 3 Complete** | Alerts & export deployed to staging | August 29, 2026 | TODO | Backend Lead |
| **Security Audit** | Third-party security review (if budget allows) | September 5, 2026 | TODO | DevOps Lead |
| **Load Testing** | Verify 1,000 events/min and 100 concurrent users | September 10, 2026 | TODO | QA Lead |
| **Beta Launch** | Public beta signup opens; first cohort onboarded | September 20, 2026 | TODO | Mohamed Eldeeb |
| **Public Launch** | General availability announcement; pricing live | September 30, 2026 | TODO | Mohamed Eldeeb |
| **Post-Launch Support** | Monitor uptime, respond to issues, gather feedback | October 15, 2026 | TODO | Mohamed Eldeeb |

---

## 14. Risk Register

| ID | Description | Likelihood | Impact | Score | Mitigation | Owner |
|----|-------------|------------|--------|-------|----------|-------|
| R001 | Scope creep: requests for multi-provider support, forecasting, etc. | High (3) | Medium (2) | 6 | Enforce MoSCoW strictly; document all feature requests for v2 backlog; weekly scope review | Mohamed Eldeeb |
| R002 | OpenAI pricing changes or new models released mid-development | Medium (2) | Medium (2) | 4 | Maintain pricing database; design system to auto-import new models; spike in Phase 1 | Backend Lead |
| R003 | Team member unavailability (illness, departure) | Medium (2) | High (3) | 6 | Document architecture and decisions; pair programming on critical features | Mohamed Eldeeb |
| R004 | Event volume exceeds expected capacity (> 1,000 req/min) | Low (1) | High (3) | 3 | Design for horizontal scaling from day 1; use message queue for async processing; load test weekly | DevOps Lead |
| R005 | Security vulnerability discovered during development | Low (1) | High (3) | 3 | Follow OWASP Top 10; use dependency scanning (Dependabot); security audit before launch | Backend Lead |
| R006 | Early customers don't adopt (low activation rate) | Medium (2) | Medium (2) | 4 | Onboarding tutorial, email sequences, direct outreach to beta users; weekly activation tracking | Mohamed Eldeeb |
| R007 | Integration complexity: developers struggle to integrate SDK | Medium (2) | Medium (2) | 4 | Minimize SDK (< 50 LOC); provide examples for Python, Node, Python; live demo during onboarding | Frontend Lead |
| R008 | Third-party email service (SendGrid) experiences outage | Low (1) | Medium (2) | 2 | Implement retry logic; fallback to queue-based delivery; monitor service status | DevOps Lead |
| R009 | Database performance degrades with event volume | Medium (2) | High (3) | 6 | Partition events by date; index on (project_id, customer_id, feature); caching layer; weekly query performance review | Backend Lead |
| R010 | Competitor launches similar product | Medium (2) | Medium (2) | 4 | Launch quickly with v1 MVP; focus on profitability (not just cost); build community early | Mohamed Eldeeb |

---

## 15. Stakeholders and Approvals

### Stakeholders

| Name | Role | Involvement | Contact |
|------|------|-------------|---------|
| Mohamed Eldeeb | Product Manager / Founder | Decisions, roadmap, launch | [TBD] |
| Backend Lead | Engineering Lead | Architecture, technical decisions | [TBD] |
| Frontend Lead | UI/UX Engineer | Design, component library, dashboard | [TBD] |
| DevOps Lead | Infrastructure Engineer | Deployment, monitoring, scaling | [TBD] |
| QA Lead | Quality Assurance | Testing, load testing, launch validation | [TBD] |

### Approval Gates

| Gate | Approver | Required By | Status |
|------|----------|------------|--------|
| **PRD Approval** | Mohamed Eldeeb | July 30, 2026 | TODO |
| **Design Review** | Frontend Lead | August 1, 2026 | TODO |
| **Phase 1 Sign-Off** | Backend Lead | August 1, 2026 | TODO |
| **Security Audit** | DevOps Lead | September 5, 2026 | TODO |
| **Load Test Pass** | QA Lead | September 10, 2026 | TODO |
| **Launch Approval** | Mohamed Eldeeb | September 20, 2026 | TODO |

---

## 16. References and Links

| Reference | URL/Details | Status |
|-----------|-----------|--------|
| **Design Files** | Figma: [TBD] | TBD |
| **Repository** | GitHub: [TBD] | TBD |
| **API Documentation** | OpenAPI/Swagger: [TBD] (auto-generated) | TBD |
| **Architecture Diagram** | Miro / Excalidraw: [TBD] | TBD |
| **Staging Environment** | [TBD] | TBD |
| **Production Environment** | [TBD] | TBD |
| **CI/CD Pipeline** | GitHub Actions: [TBD] | TBD |
| **Monitoring Dashboard** | Vercel / Sentry: [TBD] | TBD |
| **Database Schema** | Prisma schema: [TBD] | TBD |
| **Slack Channel** | #costflow-dev | Active |
| **Meeting Notes** | Google Drive: [TBD] | TBD |
| **Pricing Rate Card** | OpenAI API: https://openai.com/pricing | External |
| **Competitor Analysis** | [TBD] | TBD |

---

## 17. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | July 18, 2026 | Mohamed Eldeeb | Initial PRD created; 17 sections complete; ready for team review and Phase 1 kickoff |

---

**END OF DOCUMENT**
