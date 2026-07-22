// Shared interfaces, enums and types. Interfaces are prefixed with `I`; enum members UPPER_CASE.

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  READ_ONLY = 'READ_ONLY',
}

export enum SubscriptionStatus {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

/** Standard error envelope returned by the API for every non-2xx response. */
export interface IApiError {
  code: string;
  message: string;
  details: unknown | null;
  timestamp: string;
}

/** The authenticated user as exposed to clients (never includes secrets). */
export interface IAuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}

/** A workspace teammate as shown in Team & Roles management. */
export interface ITeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: IAuthUser;
  tokens: IAuthTokens;
}

/** The tenant's subscription as surfaced to the UI (e.g. the top-bar badge). */
export interface ISubscription {
  status: SubscriptionStatus;
  plan: string;
  maxSubUsers: number;
  currentPeriodEnd: string;
  /** Whole days remaining until currentPeriodEnd (0 once it has passed). */
  daysRemaining: number;
  /** True while the plan still grants access (TRIALING/ACTIVE and within period). */
  isActive: boolean;
}

export enum OnboardingTaskStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
  SKIPPED = 'SKIPPED',
}

export interface ITenantSettings {
  id: string;
  name: string;
  logoUrl: string | null;
  timezone: string;
  currency: string;
  businessType: string | null;
  /** The tenant's active quotation template — applied to every quote unless overridden. */
  defaultQuoteTemplate: QuoteTemplate;
  onboardingCompletedAt: string | null;
}

export interface IOnboardingTask {
  id: string;
  key: string;
  title: string;
  status: OnboardingTaskStatus;
  order: number;
  completedAt: string | null;
}

export interface IOnboardingState {
  tenant: ITenantSettings;
  tasks: IOnboardingTask[];
  /** 0–100, based on tasks that are DONE. */
  progress: number;
}

export enum CatalogItemType {
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
  PACKAGE = 'PACKAGE',
  ADDON = 'ADDON',
}

export enum PricingUnit {
  FIXED = 'FIXED',
  MONTHLY = 'MONTHLY',
  PER_UNIT = 'PER_UNIT',
}

export enum ClientStatus {
  LEAD = 'LEAD',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/** A client (the agency's customer) that quotations and invoices attach to. */
export interface IClient {
  id: string;
  tenantId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

/** A saved service/product/package/add-on. Money is in integer minor units (BDT poisha). */
export interface ICatalogItem {
  id: string;
  tenantId: string;
  type: CatalogItemType;
  name: string;
  description: string | null;
  category: string | null;
  pricingUnit: PricingUnit;
  priceMinor: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CONVERTED = 'CONVERTED',
}

/** The five built-in visual layouts a quotation can be rendered with. */
export enum QuoteTemplate {
  CLASSIC = 'CLASSIC',
  MODERN = 'MODERN',
  MINIMALIST = 'MINIMALIST',
  PROFESSIONAL = 'PROFESSIONAL',
  BOLD = 'BOLD',
}

/** Human-facing metadata for a template. The visual style tokens live in the frontend. */
export interface IQuoteTemplateMeta {
  key: QuoteTemplate;
  label: string;
  description: string;
}

export interface IQuoteLineItem {
  id: string;
  catalogItemId: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPriceMinor: number;
  lineDiscountMinor: number;
  lineTotalMinor: number;
  sortOrder: number;
}

export enum QuoteEventType {
  CREATED = 'CREATED',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMMENTED = 'COMMENTED',
  CONVERTED = 'CONVERTED',
}

export interface IQuoteEvent {
  id: string;
  type: QuoteEventType;
  message: string | null;
  actor: string | null;
  createdAt: string;
}

/** A quotation. Money fields are integer minor units (BDT poisha). */
export interface IQuote {
  id: string;
  tenantId: string;
  number: string;
  clientId: string | null;
  clientName: string | null;
  status: QuoteStatus;
  /** The invoice this quote was converted into, if any. */
  invoiceId: string | null;
  invoiceNumber: string | null;
  /** Effective template for this quote (per-quote override, else the tenant default). */
  template: QuoteTemplate;
  currency: string;
  issueDate: string;
  expiresAt: string | null;
  note: string | null;
  terms: string | null;
  taxRatePercent: number;
  discountMinor: number;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  publicToken: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  respondedAt: string | null;
  signerName: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present on the detail response, omitted from list summaries. */
  lineItems?: IQuoteLineItem[];
  events?: IQuoteEvent[];
}

// ---- Invoices & Payments ----

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  VOID = 'VOID',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  ROCKET = 'ROCKET',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export enum InvoiceEventType {
  CREATED = 'CREATED',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PAYMENT_RECORDED = 'PAYMENT_RECORDED',
  PAID = 'PAID',
  VOIDED = 'VOIDED',
}

export interface IInvoiceLineItem {
  id: string;
  catalogItemId: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPriceMinor: number;
  lineDiscountMinor: number;
  lineTotalMinor: number;
  sortOrder: number;
}

/** A recorded payment against an invoice. Money is integer minor units. */
export interface IPayment {
  id: string;
  invoiceId: string;
  amountMinor: number;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
  note: string | null;
  recordedById: string | null;
  recordedByName: string | null;
  createdAt: string;
}

export interface IInvoiceEvent {
  id: string;
  type: InvoiceEventType;
  message: string | null;
  actor: string | null;
  createdAt: string;
}

/** An invoice. Money fields are integer minor units (BDT poisha). */
export interface IInvoice {
  id: string;
  tenantId: string;
  number: string;
  clientId: string | null;
  clientName: string | null;
  quoteId: string | null;
  quoteNumber: string | null;
  status: InvoiceStatus;
  /** Effective template (per-invoice override, else the tenant default). */
  template: QuoteTemplate;
  currency: string;
  issueDate: string;
  dueDate: string | null;
  note: string | null;
  terms: string | null;
  taxRatePercent: number;
  discountMinor: number;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  /** totalMinor - amountPaidMinor (never negative). */
  balanceMinor: number;
  /** True when unpaid/partly-paid and past the due date. */
  isOverdue: boolean;
  publicToken: string | null;
  sentAt: string | null;
  paidAt: string | null;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present on the detail response, omitted from list summaries. */
  lineItems?: IInvoiceLineItem[];
  payments?: IPayment[];
  events?: IInvoiceEvent[];
}

/** Safe, client-facing invoice shape served on the public link (no tenant/internal ids). */
export interface IPublicInvoice {
  number: string;
  agencyName: string;
  clientName: string | null;
  status: InvoiceStatus;
  template: QuoteTemplate;
  currency: string;
  issueDate: string;
  dueDate: string | null;
  note: string | null;
  terms: string | null;
  taxRatePercent: number;
  discountMinor: number;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  balanceMinor: number;
  isOverdue: boolean;
  lineItems: IInvoiceLineItem[];
  payments: Array<{ amountMinor: number; method: PaymentMethod; paidAt: string }>;
}

// ---- Contacts (lead / prospect pipeline) ----

export enum ContactStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  QUALIFIED = 'QUALIFIED',
  WON = 'WON',
  LOST = 'LOST',
}

export enum ContactActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  AD = 'AD',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
}

export enum ContactActivityOutcome {
  CONNECTED = 'CONNECTED',
  NO_ANSWER = 'NO_ANSWER',
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  FOLLOW_UP = 'FOLLOW_UP',
  BOUNCED = 'BOUNCED',
  DONE = 'DONE',
}

/** A single logged outreach touch on a contact. */
export interface IContactActivity {
  id: string;
  contactId: string;
  type: ContactActivityType;
  outcome: ContactActivityOutcome | null;
  note: string | null;
  occurredAt: string;
  nextFollowUpAt: string | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
}

/** A prospect in the outbound sales pipeline. */
export interface IContact {
  id: string;
  tenantId: string;
  name: string;
  company: string | null;
  email: string | null;
  mobile: string | null;
  whatsapp: string | null;
  source: string | null;
  stage: ContactStage;
  tags: string[];
  notes: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  convertedClientId: string | null;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present on the detail response, omitted from list summaries. */
  activities?: IContactActivity[];
  /** Number of logged touches (list summaries). */
  activityCount?: number;
}

/** The safe, client-facing shape served on the public quote link (no tenant/internal ids). */
export interface IPublicQuote {
  number: string;
  agencyName: string;
  clientName: string | null;
  status: QuoteStatus;
  /** Effective template used to render the client-facing document. */
  template: QuoteTemplate;
  currency: string;
  issueDate: string;
  expiresAt: string | null;
  note: string | null;
  terms: string | null;
  taxRatePercent: number;
  discountMinor: number;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  signerName: string | null;
  respondedAt: string | null;
  lineItems: IQuoteLineItem[];
}
