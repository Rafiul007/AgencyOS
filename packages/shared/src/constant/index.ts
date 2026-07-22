// Shared constant data used by both apps.

import { QuoteTemplate, type IQuoteTemplateMeta } from '../interface';

export const API_VERSION = 'v1';

/** The template applied when a tenant hasn't chosen one yet. */
export const DEFAULT_QUOTE_TEMPLATE = QuoteTemplate.CLASSIC;

/**
 * The five built-in quotation templates. This is the single source of truth for the
 * available templates — the frontend maps each key to its visual style tokens.
 */
export const QUOTE_TEMPLATES: readonly IQuoteTemplateMeta[] = [
  {
    key: QuoteTemplate.CLASSIC,
    label: 'Classic',
    description: 'Timeless business layout with a dark header and bordered line items.',
  },
  {
    key: QuoteTemplate.MODERN,
    label: 'Modern',
    description: 'Vibrant gradient header, soft rounded cards, and a highlighted total.',
  },
  {
    key: QuoteTemplate.MINIMALIST,
    label: 'Minimalist',
    description: 'Clean monochrome design with generous whitespace and hairline rules.',
  },
  {
    key: QuoteTemplate.PROFESSIONAL,
    label: 'Professional',
    description: 'Corporate navy blocks with striped rows for a formal, structured feel.',
  },
  {
    key: QuoteTemplate.BOLD,
    label: 'Bold',
    description: 'High-contrast accent banner and oversized totals that command attention.',
  },
] as const;

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
