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
