import { apiClient } from '@/lib/apiClient';
import type { IOnboardingState, ITenantSettings, QuoteTemplate } from '@agencyos/shared';

export interface IWorkspaceInput {
  name: string;
  businessType?: string;
  timezone: string;
  currency: string;
}

export interface IProfileInput {
  name: string;
  phone?: string;
}

export async function fetchOnboardingState(): Promise<IOnboardingState> {
  const { data } = await apiClient.get<IOnboardingState>('/onboarding');
  return data;
}

export async function updateWorkspaceSettings(input: IWorkspaceInput): Promise<ITenantSettings> {
  const { data } = await apiClient.patch<ITenantSettings>('/onboarding/settings', input);
  return data;
}

export async function updateOwnerProfile(input: IProfileInput): Promise<void> {
  await apiClient.patch('/onboarding/profile', input);
}

/** Sets the tenant's active quotation template (used as the default for new quotes). */
export async function updateDefaultQuoteTemplate(
  template: QuoteTemplate,
): Promise<ITenantSettings> {
  const { data } = await apiClient.patch<ITenantSettings>('/onboarding/quote-template', {
    defaultQuoteTemplate: template,
  });
  return data;
}

export async function completeOnboardingStep(key: string): Promise<IOnboardingState> {
  const { data } = await apiClient.post<IOnboardingState>(`/onboarding/steps/${key}/complete`, {});
  return data;
}

export async function finishOnboarding(): Promise<ITenantSettings> {
  const { data } = await apiClient.post<ITenantSettings>('/onboarding/complete', {});
  return data;
}
