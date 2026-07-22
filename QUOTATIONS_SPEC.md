# Quotations — Feature & Business Logic Spec

Module spec for AgencyOS. Read alongside [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md) and
[CLAUDE.md](CLAUDE.md). This is the reference for building the Quotations module.

---

## 1. The problem

Small agencies (esp. in Bangladesh) quote by editing an old Word/Excel file and sending a PDF over
email or WhatsApp. This is slow and inconsistent, invisible after sending (no idea if the client
opened it), version-chaotic, and disconnected from getting paid. Follow-ups are forgotten and deals
die; approvals aren't recorded, so disputes have no paper trail; and once approved, everything is
re-typed into an invoice.

**Insight:** a quotation is not a document — it is a _sales workflow with money attached_. AgencyOS
owns the whole path: **Catalog → Quote (versions + timeline) → Approved (signed) → Invoice**, with
no re-typing anywhere.

---

## 2. Catalog (the foundation)

The agency first saves its offerings once, then builds quotes from them.

**Item types:** `SERVICE`, `PRODUCT`, `PACKAGE` (a bundle with its own set price), `ADDON` (optional
extra the agency adds to a quote).

**Pricing units:** `FIXED` (one-off), `MONTHLY` (retainer / recurring), `PER_UNIT` (price × quantity).
_Hourly is intentionally excluded for MVP._

**Each catalog item:** name, description, category, type, pricing unit, **default price (BDT)**,
active flag. Money is stored as **integer minor units (poisha)** — never floats.

**Custom vs regular price:** the default price auto-fills when the item is added to a quote, but can
be overridden per quote. The chosen price is **snapshotted onto the quote line**, so later catalog
price changes never alter an already-sent quote.

**Packages:** carry their own set price (may differ from the sum of parts, so you can show savings).
Structured package composition (which items make up a package) is a later enhancement; MVP treats a
package as a named, priced item.

---

## 3. Quote builder

- Add lines from the catalog (or free-text lines); each line: description, unit, quantity, unit
  price (minor units), line discount, computed line total.
- **Discounts:** per-line and an overall quote-level discount (amount or %).
- **VAT/tax:** **optional per quote** — a toggle with a configurable rate (default off; many small BD
  clients are billed without VAT). When on, tax is computed on the discounted subtotal.
- **Totals:** subtotal → discounts → tax → grand total, all in minor units, rounded consistently.
- **Meta:** cover note, terms & conditions, **validity/expiry date**, linked **client + contact**.
- **Numbering:** per-tenant sequence with a configurable prefix, e.g. `AOS-2026-014`. Allocation is
  transaction-safe so concurrent creates never collide.

---

## 4. Negotiation & versioning

- Every quote has a **status**, a **timeline**, and one or more **versions**.
- Sending or changing a priced quote after it's been seen creates a **new version** (`v1, v2, v3…`),
  each a full snapshot of its lines and totals. The client-facing link always shows the current
  version; prior versions are preserved and comparable.
- The **timeline** logs every event: created, sent, viewed, commented, revised, approved, rejected,
  converted — each with actor and timestamp.
- From the public link the client can **Request changes / comment**, moving the quote to
  `NEGOTIATING`.

---

## 5. Sending

- Generate a branded **PDF** and a **secure, tokenized public link** (expirable, revocable).
- **Email** — sent through the `MailProvider` interface via the `JobQueue` (retry-safe), never inline.
- **WhatsApp** — MVP generates a pre-filled `wa.me` message containing the link; the agency presses
  send from their own WhatsApp. (WhatsApp Business API automation is a paid, later phase.)
- **Read receipts:** viewing the public link records a `VIEWED` event and timestamp.

---

## 6. Client approval (dispute-proof)

- Public link (no login) → **Approve**, **Reject (with reason)**, or comment.
- **Approve** captures an **e-signature** (typed/drawn name) plus **timestamp, IP, and the exact
  version** approved. Status → `APPROVED`, quote locks, agency is notified.
- This captured record is the legal/paper trail if a client later disputes the agreement.

---

## 7. Internal approval

- A quote whose **grand total exceeds a tenant-configured threshold** must be **approved by a
  Manager/Admin/Owner before it can be sent** (status `PENDING_APPROVAL`).
- Below the threshold, an authorized user can send directly.

---

## 8. Convert to invoice

- An `APPROVED` quote can be converted to:
  - a **full invoice** (grand total), or
  - an **advance + balance split** (e.g. 30% advance now, 70% balance on delivery) — two linked
    invoices.
- Conversion **copies the approved version's lines** into the Invoice (own number, due date, terms),
  links quote ↔ invoice(s), and moves the quote to `CONVERTED` (further edits blocked — the invoice
  is now the source of truth).
- **Online payment (bKash/Nagad) is deferred to Phase 2**; the conversion leaves a clean payment
  hook. Invoices are created but marked unpaid.

---

## 9. Lifecycle (state machine)

```
DRAFT
  → PENDING_APPROVAL      (only if total > internal-approval threshold)
  → SENT
  → VIEWED
  → NEGOTIATING           (client requested changes / commented)
      → (revise) → SENT   (new version)
  → APPROVED              (client e-signed)
  → CONVERTED             (→ invoice/s)

Branches from most states:
  → REJECTED   (client rejected, with reason)
  → EXPIRED    (past validity date, not yet approved)
  → WITHDRAWN  (agency cancelled)
```

**Transition rules (who/what):**

- Only `DRAFT` / `NEGOTIATING` quotes are freely editable. Editing a `SENT`/`VIEWED` quote creates a
  **new version** rather than mutating the seen one.
- `APPROVED` and `CONVERTED` are **locked** (no line edits).
- Sending requires internal approval first **iff** total > threshold.

---

## 10. Edge-case rules (resolved)

| Case                               | Rule                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| Edit after sent/viewed             | Create a new version; never mutate the version the client saw.                          |
| Client approves an expired quote   | Blocked; agency must re-issue (revive → new validity).                                  |
| Approved then client wants changes | Revise creates a new version and supersedes; approval history kept.                     |
| Discount / total over threshold    | Requires internal approval before sending.                                              |
| Concurrent quote numbering         | Sequence allocated inside a DB transaction; unique per tenant.                          |
| Convert, then edit/delete quote    | Blocked once `CONVERTED`; the invoice is the source of truth.                           |
| Catalog price changes later        | Prices are **snapshotted** on the quote line at add time; quote unaffected.             |
| Client has no email                | Flow works via WhatsApp/link; email is optional.                                        |
| Multiple client contacts           | Record which contact approved (name + captured signature/IP).                           |
| Expiry across timezones            | Expiry stored as a date/time in UTC; displayed in the tenant timezone.                  |
| "I never approved this"            | Signature + IP + timestamp + version snapshot is the record.                            |
| Deactivated user / owner leaves    | Their open quotes can be reassigned to another user.                                    |
| Zero/negative values               | Validated; totals cannot go below zero.                                                 |
| Tenant isolation                   | Quotes, numbering, and catalog are strictly tenant-scoped (highest-severity bug class). |

---

## 11. Data model (sketch)

> Built incrementally. Catalog first (this iteration), then quotes.

- **CatalogItem** — `tenantId, type, name, description, category, pricingUnit, priceMinor, currency,
isActive`.
- **Quote** — `tenantId, number, clientId?, status, currency, currentVersionId, expiresAt,
createdById, approval fields, invoice link`.
- **QuoteVersion** — `quoteId, version, subtotalMinor, discountMinor, taxRate, taxMinor,
totalMinor, note, terms` (a snapshot).
- **QuoteLineItem** — `versionId, catalogItemId?, description, unit, quantity, unitPriceMinor,
lineDiscountMinor, lineTotalMinor, sortOrder`.
- **QuoteEvent** — `quoteId, type, actor, meta, createdAt` (the timeline).
- **QuoteApproval** — `quoteId, versionId, signerName, signatureRef, ip, approvedAt`.
- **Invoice** (later) — linked from the converted quote.

All money fields are **integer minor units (BDT poisha)**.

---

## 12. RBAC & audit

- **Owner / Admin / Manager** can create, edit, send, and convert quotes and manage the catalog.
- **Agent** can create/edit drafts; **Read-only** can view.
- Internal approval (over threshold) requires **Manager+**.
- Every state change and edit is written to the **Audit Log** / quote timeline.

---

## 13. Deferred (Phase 2+)

Online payment (bKash/Nagad), client-side add-on upsell, hourly pricing, partial acceptance,
WhatsApp Business API automation, auto-generated recurring invoices from retainers, structured
package composition, and win-rate analytics.

---

## 14. Build plan

1. **Catalog** — models + CRUD API + UI (foundation). ← _in progress_
2. **Quote builder** — Quote/Version/LineItem models, create/edit, numbering, totals.
3. **Sending** — PDF + public tokenized view + email (JobQueue) + WhatsApp link.
4. **Approval** — public approve/reject/comment + e-signature capture + timeline.
5. **Internal approval** + **convert to invoice** (full + advance/balance).
6. **Phase 2** — payments, analytics, and the deferred items above.
