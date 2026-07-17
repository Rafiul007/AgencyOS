# AgencyOS — Product Overview

> High-level product overview for a multi-tenant SaaS platform that helps companies and agencies manage client communications, quotations, support, and marketing events from a single workspace.

---

## 1. Product Name

Product name: **AgencyOS** — positioned as the "operating system for agencies."

Alternative names considered (all convey "agency/client operations hub"):

| Name             | Angle                                                  |
| ---------------- | ------------------------------------------------------ |
| **AgencyOS**     | "Operating system for agencies" positioning (selected) |
| **MarketingPro** | Straightforward, professional                          |
| **ClientHub**    | Client-relationship centric                            |
| **Memoflow**     | Emphasizes memos/quotations workflow                   |
| **Engagely**     | Emphasizes client engagement & events                  |
| **PitchDesk**    | Emphasizes quotations/proposals                        |

The rest of this document uses **AgencyOS**.

---

## 2. Vision & Value Proposition

**Vision:** Give companies and marketing agencies one operating system to create client-facing documents, run promotional campaigns, handle support, and sell tickets to their marketing events — replacing 4–5 disconnected tools.

**Core value:**

- **For agencies:** Manage many clients (tenants/workspaces) from one login, brand everything, and get paid faster.
- **For their clients:** Receive professional quotations, get updates, raise issues, and register for events without friction.

**Primary users**

- **Agency / company admins & staff** — create memos, quotations, campaigns, events; manage clients.
- **Clients** — view/approve quotations, raise support tickets, buy/register for event tickets.
- **Event attendees** — purchase tickets and check in at events.

---

## 3. Core Modules (from your requirements)

### 3.1 Digital Memos & Quotations

- Rich document builder for **memos, quotations, proposals, and estimates**.
- Reusable **templates**, line items, service catalog, taxes, and discounts.
- Auto-calculated totals, multi-currency, and validity/expiry dates.
- **Client approval flow**: send → view → approve/reject → e-signature.
- Convert an approved quotation into an **invoice** (optional billing add-on).
- PDF export, versioning, and shareable secure links.
- Status tracking (Draft, Sent, Viewed, Approved, Expired).

### 3.2 Promotional Email & Campaigns

- **Email campaign builder** with drag-and-drop or template-based editor.
- **Contact lists & segmentation** (by client, tag, activity, event attendance).
- Scheduling, A/B subject lines, and personalization/merge tags.
- **Delivery + analytics**: opens, clicks, bounces, unsubscribes.
- Provider integration (SendGrid / Amazon SES / Postmark) with domain auth (SPF/DKIM).
- Consent & unsubscribe management for compliance (GDPR/CAN-SPAM).

### 3.3 Client Support / Ticketing

- Clients **raise tickets** for problems, requests, or questions.
- Ticket fields: category, priority, attachments, and linked quotation/event.
- **Threaded conversations**, internal notes, and status workflow (Open, In Progress, Resolved, Closed).
- **Assignment & routing** to staff, plus SLA timers and escalation.
- Email-to-ticket and notifications to both sides.
- Knowledge base / FAQ to deflect repetitive tickets.

### 3.4 Event Ticketing System

- Create **marketing events** (workshops, webinars, launches, conferences).
- Multiple **ticket types/tiers** (free, paid, VIP, early-bird) with quantity limits.
- **Registration & checkout** with payment (Stripe / local gateway).
- **QR-code tickets** and **on-site check-in** (scan to validate).
- Attendee management, waitlists, and capacity control.
- Post-event follow-up (feed attendees back into email campaigns).

---

## 4. Confirmed Additional Features

These are in-scope alongside the four core modules, each expanded below.

### 4.1 CRM Lite

- Client and contact records with company details, tags, and owner.
- **Activity timeline** per client: quotations sent, emails opened, tickets raised, events attended.
- Deal/quotation history and status at a glance.
- Notes, follow-up reminders, and quick filters/search.
- Feeds directly into email segmentation and reporting.

### 4.2 Invoicing & Payments

- Convert an **approved quotation into an invoice** with one click.
- Online payment collection (Stripe / local gateway) with paid/partial/overdue tracking.
- Recurring invoices and payment reminders.
- Tax, discount, and multi-currency support (shared with quotations).
- Downloadable PDF invoices and receipts; payment history per client.

### 4.3 Team & Role Management

- Roles: **Owner, Admin, Manager, Agent, Read-only** (extendable, permission-based).
- Invite team members by email; manage seats per plan.
- **Granular permissions** scoped per module (quotations, tickets, campaigns, events, billing).
- Per-tenant isolation so agency staff only see their workspace.
- Activity attribution — every action tied to a user (pairs with Audit Log).

### 4.4 Templates Marketplace

- Reusable templates for **quotations, emails, events, and invoices**.
- Private (tenant-owned) templates plus a shared/public gallery.
- Clone, customize, and version templates.
- Variables/merge tags so templates auto-fill client and service data.
- Optionally, premium/community templates for a future monetization channel.

### 4.5 Audit Log

- Immutable record of **who changed what and when** across the workspace.
- Covers logins, document edits, status changes, payments, permission changes.
- Filter by user, module, entity, and date range.
- Supports compliance, security review, and dispute resolution.

### 4.6 Calendar & Scheduling

- Shared calendar for meetings, consultations, campaign sends, and events.
- **Bookable slots** clients can reserve (consultation/discovery calls).
- Links appointments to clients, quotations, or events.
- Reminders and optional external calendar sync (Google/Outlook).
- Feeds event dates and deadlines into notifications.

---

## 4b. Other Optional Features (future backlog)

Lower priority — candidates for later phases:

- **Client portal** — branded self-service area for quotations, tickets, invoices, and events.
- **Automation / workflows** — e.g., "quotation approved → send thank-you email → create onboarding ticket."
- **Analytics dashboard** — revenue, campaign performance, ticket SLA, event sales.
- **Notifications** — in-app, email, and optional SMS/WhatsApp.
- **White-labeling** — agencies apply their own logo, colors, and custom domain.
- **File & asset library** — shared documents, brand assets, contracts.
- **Public API & webhooks** — integrate with clients' existing stacks.

---

## 5. Multi-Tenancy Model

Because the platform serves **companies and agencies**, tenancy is central:

- **Workspace = tenant.** Each agency/company gets an isolated workspace.
- Agencies can manage **multiple client sub-accounts** under their workspace.
- Data isolation per tenant (row-level tenant_id scoping, at minimum).
- Per-tenant **branding, settings, billing plan, and user seats**.
- Global **super-admin** (platform owner) for plan/usage oversight.

---

## 6. Suggested High-Level Architecture

**Frontend (React)**

- React + TypeScript, component library (e.g., MUI / shadcn), state via TanStack Query + Zustand/Redux.
- Separate surfaces: **Agency dashboard**, **Client portal**, **Public event/registration pages**.

**Backend (NestJS)**

- Modular NestJS services: Auth, Tenants, Quotations, Email, Tickets, Events, Payments, Notifications.
- **PostgreSQL** (primary DB) with Prisma or TypeORM; **Redis** for caching, queues, and rate limiting.
- **BullMQ** for background jobs (email sending, PDF generation, reminders).
- **S3-compatible storage** for files, PDFs, and assets.

**Integrations**

- Email: SendGrid / Amazon SES / Postmark.
- Payments: Stripe (+ local gateway option).
- Auth: JWT + refresh tokens; optional OAuth/SSO.

**Cross-cutting**

- RBAC + multi-tenant guards on every request.
- Observability (logging, metrics, error tracking).
- Webhooks + public REST/GraphQL API.

---

## 7. Suggested Delivery Roadmap (Phased MVP)

| Phase             | Focus                    | Key deliverables                                                                                |
| ----------------- | ------------------------ | ----------------------------------------------------------------------------------------------- |
| **Phase 1 — MVP** | Foundations + Quotations | Auth, multi-tenant workspaces, client management, memo/quotation builder + approval, PDF export |
| **Phase 2**       | Support                  | Ticketing system, client portal, notifications                                                  |
| **Phase 3**       | Marketing                | Promotional email campaigns, contact segmentation, analytics                                    |
| **Phase 4**       | Events                   | Event ticketing, checkout, QR check-in                                                          |
| **Phase 5**       | Scale                    | Invoicing/payments, automation, white-labeling, public API                                      |

---

## 8. Monetization

- **Subscription tiers** (Starter / Pro / Agency) based on seats, clients, and email/event volume.
- **Usage add-ons**: extra email sends, event ticket transaction fees, SMS credits.
- **Per-transaction fee** on paid event tickets (optional).

---

## 9. Key Non-Functional Requirements

- **Security & compliance:** tenant data isolation, encryption at rest/in transit, GDPR-ready consent, PCI-compliant payments (via provider).
- **Scalability:** stateless API + queue workers, horizontal scaling.
- **Reliability:** email/event/payment operations must be idempotent and retry-safe.
- **Deliverability:** proper domain authentication for outbound email.
- **Accessibility & responsiveness** across the client-facing surfaces.

---

_Document status: Draft v1 — high-level overview for stakeholder alignment._
