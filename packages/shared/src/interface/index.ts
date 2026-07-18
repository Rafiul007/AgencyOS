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

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: IAuthUser;
  tokens: IAuthTokens;
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

/** The safe, client-facing shape served on the public quote link (no tenant/internal ids). */
export interface IPublicQuote {
  number: string;
  agencyName: string;
  clientName: string | null;
  status: QuoteStatus;
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
