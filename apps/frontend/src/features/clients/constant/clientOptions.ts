import type { IRhfSelectOption } from '@/components/rhf/RhfSelect';

export const CLIENT_STATUS_OPTIONS: IRhfSelectOption[] = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export const STATUS_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning'> = {
  LEAD: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'default',
};
