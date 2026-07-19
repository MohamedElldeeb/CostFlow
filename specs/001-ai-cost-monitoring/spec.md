# Feature Specification: AI API Cost Monitoring

**Feature Branch**: `001-ai-cost-monitoring`

**Created**: 2026-07-19

**Status**: Draft

**Input**: User description: "Build CostFlow — an AI API cost monitoring SaaS that helps founders track OpenAI API spending by customer and feature, identify unprofitable accounts, and receive budget alerts before overspending occurs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Account, Project & API Key Setup (Priority: P1)

A founder signs up for CostFlow with their email and password, confirms their email, logs in,
and creates a project for the AI product they want to monitor. CostFlow generates a unique API
key for that project, which the founder copies to integrate into their own application.

**Why this priority**: Nothing else in the product is reachable without an account, a project,
and a key to send data with. This is the entry point every other story depends on, and it is
independently valuable: a founder finishing this flow has everything they need to start
integrating, even before any cost data exists.

**Independent Test**: Can be fully tested by signing up, confirming the account, logging in,
creating a project, and confirming an API key is issued and usable — delivers the value of
"ready to integrate" without requiring any other story.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they sign up with a valid email and password, **Then** an
   account is created and a confirmation email is sent, with login blocked until the email is
   confirmed.
2. **Given** a confirmed account, **When** the user logs in with correct credentials, **Then**
   they land on their project list.
3. **Given** a logged-in user with no projects, **When** they create a project with a unique
   name, **Then** the project appears in their list and a one-time API key is displayed for
   copying.
4. **Given** a user who has lost or wants to rotate their API key, **When** they regenerate the
   key for a project, **Then** a new key is issued, the old key stops working immediately, and
   all historical cost data for that project is preserved.
5. **Given** a user who already has 3 projects, **When** they attempt to create a 4th, **Then**
   the system blocks creation and explains the limit.
6. **Given** a user submits 5 failed login attempts within a minute, **When** they try again,
   **Then** further attempts from that source are blocked for 15 minutes.

---

### User Story 2 - Ingest Usage Events & View Cost by Customer (Priority: P1)

The founder's application sends usage events (which customer, which feature, which AI model,
how many tokens) to CostFlow using the project's API key. CostFlow calculates the dollar cost of
each event and shows the founder a dashboard ranking their customers by total cost, so they can
immediately see who is expensive to serve.

**Why this priority**: This is the core value proposition of the product — turning a single
opaque monthly bill into a per-customer cost breakdown. Without this, CostFlow provides no value
beyond a login screen.

**Independent Test**: Can be fully tested by sending a batch of usage events for a project and
confirming they appear, correctly costed, in a customer-ranked cost table — delivers the primary
"who is costing me money" insight on its own.

**Acceptance Scenarios**:

1. **Given** a valid project API key, **When** the founder's application submits a usage event
   with customer, feature, model, and token counts, **Then** the event is accepted, its cost is
   calculated from the pricing in effect on the event's date, and it appears in the dashboard
   within 60 seconds.
2. **Given** a project with multiple customers sending events, **When** the founder opens the
   Cost by Customer view, **Then** customers are listed sorted by total cost descending by
   default, each row showing total cost, request count, and a short recent-cost trend.
3. **Given** the Cost by Customer view, **When** the founder selects a different date range
   (7/30/90 days or custom), **Then** the totals and ranking update to reflect only that range.
4. **Given** the Cost by Customer view, **When** the founder clicks a customer row, **Then** they
   see that customer's cost broken down by feature.
5. **Given** an event submitted with a `request_id` matching a previously accepted event for the
   same project, **When** it is submitted again, **Then** it is silently ignored and does not
   double-count cost.
6. **Given** an event referencing a model CostFlow has no pricing for, **When** it is submitted,
   **Then** the event is stored without a calculated cost and is flagged for review rather than
   rejected or silently miscosted.
7. **Given** a project sending events faster than its allowed rate, **When** the limit is
   exceeded, **Then** further events are rejected with guidance on when to retry, and accepted
   events are unaffected.
8. **Given** a project with no events yet, **When** the founder opens the dashboard, **Then**
   they see setup guidance for sending their first event instead of a blank table.

---

### User Story 3 - View Cost by Feature (Priority: P2)

The founder views a breakdown of AI spend by feature (e.g., "chatbot", "summarizer") instead of
by customer, so they can see which parts of their product are the most expensive to run and
which customers rely on each feature.

**Why this priority**: Feature-level cost is the second most common question founders have after
"which customer costs the most" — it informs product and pricing decisions but is not needed to
deliver the initial "aha" moment from User Story 2.

**Independent Test**: Can be tested by sending events tagged with different features and
confirming the feature-ranked cost table and drill-down are correct — delivers standalone value
for product-cost decisions.

**Acceptance Scenarios**:

1. **Given** a project with events tagged to multiple features, **When** the founder opens the
   Cost by Feature view, **Then** features are listed sorted by total cost descending by
   default, each row showing total cost, request count, and average cost per request.
2. **Given** the Cost by Feature view, **When** the founder clicks a feature row, **Then** they
   see which customers are driving that feature's cost.
3. **Given** the Cost by Feature view, **When** the founder changes the date range, **Then** the
   totals and ranking update accordingly.
4. **Given** a project with no events yet, **When** the founder opens this view, **Then** they
   see setup guidance rather than a blank table.

---

### User Story 4 - Budget Alerts (Priority: P2)

The founder sets a monthly and/or daily spending limit for a project and chooses which
percentage thresholds should trigger a warning. CostFlow monitors spend and emails the founder
when a threshold is crossed, so they find out before a surprise bill rather than after.

**Why this priority**: Alerts are what make the product proactive instead of purely
retrospective, directly addressing the "before overspending occurs" promise — high value, but
dependent on cost data already being calculated (User Story 2).

**Independent Test**: Can be tested by configuring a low budget and threshold, generating enough
event cost to cross it, and confirming exactly one alert email is received — delivers standalone
value as an early-warning system.

**Acceptance Scenarios**:

1. **Given** a project, **When** the founder sets a monthly or daily budget limit and enables one
   or more thresholds (50/75/90/100%), **Then** the configuration is saved and monitoring begins.
2. **Given** an enabled threshold, **When** cumulative spend for the relevant period crosses that
   threshold, **Then** an alert email is sent containing current spend, the limit, percentage
   used, and the top customers and features driving the spend.
3. **Given** a threshold already triggered once today, **When** spend remains above that
   threshold later the same day, **Then** no duplicate alert is sent for it.
4. **Given** past alerts for a project, **When** the founder views alert history, **Then** they
   see each alert's timestamp, threshold, and the spend amount at the time it fired.
5. **Given** a project with alerts enabled, **When** the founder disables alerts, **Then** no
   further alert emails are sent for that project until re-enabled.

---

### User Story 5 - CSV Export (Priority: P3)

The founder exports cost data for a chosen date range as a CSV file to share with a co-founder,
accountant, or finance team outside of CostFlow.

**Why this priority**: Valuable for sharing and offline analysis, but purely additive to the
insight already available in the dashboards — the product is fully useful without it.

**Independent Test**: Can be tested by requesting an export for a date range and confirming a
correctly formatted CSV is delivered — delivers standalone value for external reporting.

**Acceptance Scenarios**:

1. **Given** the Cost by Customer or Cost by Feature view, **When** the founder chooses a date
   range and requests an export, **Then** they see the estimated number of rows before
   confirming.
2. **Given** an export of 50,000 rows or fewer, **When** the founder confirms, **Then** the CSV
   downloads immediately with correctly escaped values and costs shown to 4 decimal places.
3. **Given** an export of more than 50,000 rows, **When** the founder confirms, **Then** the file
   is generated in the background and a download link is emailed within 5 minutes, expiring
   after 24 hours.

---

### Edge Cases

- Pricing changes mid-month: an event's cost MUST use the price in effect on the event's own
  timestamp, not the price in effect when it's viewed or when pricing was later updated.
- A project is deleted: its events are hidden from the dashboard immediately and the project
  remains recoverable for 7 days before being permanently purged.
- A user's session expires from inactivity: they are returned to login with a clear "please log
  in again" message rather than a generic error.
- A budget threshold is crossed multiple times within the same day (e.g., spend fluctuates around
  the line): only one alert per threshold per day is sent.
- An export is requested for a date range with zero matching events: the user is told there is
  nothing to export rather than receiving an empty or broken file.
- A usage event arrives with missing required fields or malformed values: it is rejected with a
  reason the sender can act on, and does not corrupt aggregate totals.

## Requirements *(mandatory)*

### Functional Requirements

**Accounts & Access**

- **FR-001**: System MUST allow signup with email and password, and MUST require email
  confirmation before first login.
- **FR-002**: System MUST allow a user to log in and log out, and MUST end sessions after 7 days
  of inactivity.
- **FR-003**: System MUST provide a self-service password reset flow via emailed link.
- **FR-004**: System MUST lock out further login attempts from a source after 5 failed attempts
  within a minute, for 15 minutes.
- **FR-005**: System MUST never store a user's password in a recoverable (non-hashed) form.
- **FR-006**: System MUST restrict every user to accessing and modifying only their own
  projects and data.

**Project & API Key Management**

- **FR-007**: System MUST allow a user to create up to 3 projects, each with a name that is
  unique within that user's account.
- **FR-008**: System MUST generate a unique API key for each project, display it in full exactly
  once at creation, and never display or store it in a recoverable form afterward.
- **FR-009**: System MUST allow a user to regenerate a project's API key at any time; the
  previous key MUST stop working immediately and historical cost data MUST be preserved.
- **FR-010**: System MUST allow a user to rename or delete a project.
- **FR-011**: A deleted project's data MUST be recoverable for 7 days before being permanently
  and irreversibly removed.
- **FR-012**: The project list MUST show, per project, its name, creation date, last-active
  date, and total number of events recorded.

**Usage Event Ingestion**

- **FR-013**: System MUST accept usage events identified by a project's API key, each specifying
  at minimum a customer identifier, a feature name, an AI provider, a model, and input/output
  token counts.
- **FR-014**: System MUST accept usage events in single or batch submissions.
- **FR-015**: System MUST calculate the cost of each event from the pricing in effect for that
  event's provider, model, and timestamp.
- **FR-016**: System MUST silently discard duplicate submissions that repeat a previously
  accepted event's deduplication identifier, without double-counting cost.
- **FR-017**: System MUST accept and store an event referencing a model it has no pricing data
  for, leaving its cost unset and flagged for review, rather than rejecting the event or
  guessing a cost.
- **FR-018**: System MUST limit the rate of events accepted per project per minute and MUST
  reject events beyond that limit while telling the sender when to retry, without affecting
  already-accepted events.
- **FR-019**: System MUST make an accepted event visible in the dashboard within 60 seconds.
- **FR-020**: System MUST NOT store the content of AI prompts or AI responses — only usage
  metadata (identifiers, model, token counts, calculated cost) may be retained.

**Cost by Customer**

- **FR-021**: System MUST show, per project, all customers with recorded usage, each with total
  cost, request count, and a recent cost trend, sorted by total cost descending by default.
- **FR-022**: System MUST allow re-sorting the customer list by request count or last-active
  date, and MUST allow filtering by a date range (last 7/30/90 days or a custom range).
- **FR-023**: System MUST allow drilling into a single customer to see that customer's cost
  broken down by feature.
- **FR-024**: System MUST show setup guidance in place of the customer table when a project has
  no events yet.

**Cost by Feature**

- **FR-025**: System MUST show, per project, all features with recorded usage, each with total
  cost, request count, and average cost per request, sorted by total cost descending by default.
- **FR-026**: System MUST allow re-sorting the feature list by request count or average cost per
  request, and MUST allow filtering by date range.
- **FR-027**: System MUST allow drilling into a single feature to see which customers are
  driving its cost.
- **FR-028**: System MUST show setup guidance in place of the feature table when a project has
  no events yet.

**Budget Alerts**

- **FR-029**: System MUST allow a user to set a monthly and/or daily spending limit per project.
- **FR-030**: System MUST allow a user to choose which of 50%, 75%, 90%, and 100% thresholds are
  active for a project, and to toggle alerting on or off entirely.
- **FR-031**: System MUST send an email alert the first time an active threshold is crossed
  within a given day, and MUST NOT send a repeat alert for the same threshold on the same day.
- **FR-032**: An alert email MUST include the current spend, the configured limit, the
  percentage of the limit reached, and the top customers and features contributing to that
  spend.
- **FR-033**: System MUST retain a history of past alerts per project, showing when each fired,
  which threshold it was, and the spend amount at that time.

**Export**

- **FR-034**: System MUST allow exporting cost data (date, customer, feature, model, tokens,
  cost) for a user-selected date range from either the customer or feature view.
- **FR-035**: System MUST show the estimated row count before the user confirms an export.
- **FR-036**: An export of 50,000 rows or fewer MUST be delivered as an immediate download; a
  larger export MUST be generated in the background with a download link emailed within 5
  minutes and expiring after 24 hours.
- **FR-037**: Exported cost values MUST be formatted to 4 decimal places with all fields properly
  escaped for CSV.

### Key Entities

- **User**: A founder's CostFlow account — identified by email, with a confirmed/unconfirmed
  state and a securely stored credential.
- **Project**: A single AI product or app being monitored, owned by one user, holding its own
  API key, budget settings, and usage history.
- **Usage Event**: A single recorded unit of AI usage — which customer and feature it belongs
  to, which provider/model served it, its token counts, its calculated cost, and when it
  occurred. Never includes prompt or response content.
- **Pricing Reference**: The cost-per-token rates CostFlow uses to cost events, keyed by
  provider, model, and the date from which a rate applies.
- **Budget**: A project's configured monthly and/or daily spending limit and which alert
  thresholds are active.
- **Alert**: A record of a budget threshold being crossed — which threshold, when, and the spend
  amount at that moment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new founder can go from signup to seeing their first costed usage event on the
  dashboard in under 10 minutes.
- **SC-002**: A submitted usage event is visible and correctly costed on the dashboard within 60
  seconds, at least 99% of the time.
- **SC-003**: A founder can identify their single most expensive customer within 5 seconds of
  opening the Cost by Customer view (default sort requires no extra action).
- **SC-004**: The cost dashboards load within 2 seconds for a project with a typical volume of
  usage history.
- **SC-005**: A founder is notified by email within 1 hour of their spend crossing a configured
  budget threshold.
- **SC-006**: 100% of exports at or under 50,000 rows complete as an immediate download; 100% of
  larger exports are delivered by email within 5 minutes.
- **SC-007**: A project can send at least 1,000 usage events per minute without any valid event
  being rejected.
- **SC-008**: No prompt or AI response content is ever retained or exposed anywhere in the
  product — verifiable by inspection of everything stored for a usage event.
- **SC-009**: Re-submitting the same usage event never changes a project's total recorded cost.

## Assumptions

- Pricing data (cost per token by provider, model, and effective date) is maintained centrally
  by CostFlow, not entered or managed by individual users.
- All costs are calculated and displayed in US dollars.
- `customer_id` and `feature` are free-form identifiers defined by the integrating application;
  CostFlow does not validate them against an external customer list.
- Each project has a single owner; multi-user/team collaboration on one project is out of scope
  for this feature.
- Email is the only alert and notification channel; no SMS, Slack, or in-app push notifications
  are in scope.
- The 3-project-per-account limit is a fixed v1 constraint; upgrade paths or paid tiers for
  additional projects are out of scope for this feature.
- Signup is fully self-service; no manual account approval step exists.
