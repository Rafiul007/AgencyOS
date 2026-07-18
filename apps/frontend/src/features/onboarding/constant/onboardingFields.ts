import type { IRhfSelectOption } from '@/components/rhf/RhfSelect';

export const TIMEZONE_OPTIONS: IRhfSelectOption[] = [
  { value: 'Asia/Dhaka', label: 'Dhaka (GMT+6)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (GMT+5:30)' },
  { value: 'Asia/Karachi', label: 'Karachi (GMT+5)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'UTC', label: 'UTC' },
];

export const CURRENCY_OPTIONS: IRhfSelectOption[] = [
  { value: 'BDT', label: 'Bangladeshi Taka (৳)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
];

export const BUSINESS_TYPE_OPTIONS: IRhfSelectOption[] = [
  { value: 'marketing_agency', label: 'Marketing agency' },
  { value: 'creative_studio', label: 'Creative / design studio' },
  { value: 'consultancy', label: 'Consultancy' },
  { value: 'event_management', label: 'Event management' },
  { value: 'other', label: 'Other' },
];
