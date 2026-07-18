import type { IRhfSelectOption } from '@/components/rhf/RhfSelect';

export const CATALOG_TYPE_OPTIONS: IRhfSelectOption[] = [
  { value: 'SERVICE', label: 'Service' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'PACKAGE', label: 'Package' },
  { value: 'ADDON', label: 'Add-on' },
];

export const PRICING_UNIT_OPTIONS: IRhfSelectOption[] = [
  { value: 'FIXED', label: 'Fixed price' },
  { value: 'MONTHLY', label: 'Per month' },
  { value: 'PER_UNIT', label: 'Per unit' },
];

export const TYPE_LABELS: Record<string, string> = {
  SERVICE: 'Service',
  PRODUCT: 'Product',
  PACKAGE: 'Package',
  ADDON: 'Add-on',
};

export const UNIT_LABELS: Record<string, string> = {
  FIXED: 'Fixed',
  MONTHLY: '/ month',
  PER_UNIT: '/ unit',
};
