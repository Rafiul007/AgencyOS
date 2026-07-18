// Shared constant data used by both apps.

export const API_VERSION = 'v1';

/** Max sub-users an account (tenant) may have, in addition to the Owner. */
export const MAX_SUB_USERS = 10;

/** Length of the free trial created on registration. */
export const TRIAL_DAYS = 14;

/** Getting-started checklist seeded for every new agency (tenant) on registration. */
export const ONBOARDING_TASKS = [
  { key: 'setup_workspace', title: 'Set up your workspace', order: 1 },
  { key: 'complete_profile', title: 'Complete your profile', order: 2 },
  { key: 'invite_team', title: 'Invite your team', order: 3 },
  { key: 'create_first_quotation', title: 'Create your first quotation', order: 4 },
  { key: 'setup_payments', title: 'Set up payments (bKash / Nagad)', order: 5 },
] as const;

export type OnboardingTaskKey = (typeof ONBOARDING_TASKS)[number]['key'];
