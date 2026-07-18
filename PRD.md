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
- **Runtime:** Node.js 18 LTS with TypeScript
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