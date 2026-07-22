import { InvoiceStatus, PaymentMethod } from '@agencyos/shared';
import type { IRhfSelectOption } from '@/components/rhf/RhfSelect';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Draft',
  [InvoiceStatus.SENT]: 'Sent',
  [InvoiceStatus.PARTIALLY_PAID]: 'Partially paid',
  [InvoiceStatus.PAID]: 'Paid',
  [InvoiceStatus.VOID]: 'Void',
};

export const INVOICE_STATUS_COLORS: Record<
  InvoiceStatus,
  'default' | 'info' | 'warning' | 'success' | 'error'
> = {
  [InvoiceStatus.DRAFT]: 'default',
  [InvoiceStatus.SENT]: 'info',
  [InvoiceStatus.PARTIALLY_PAID]: 'warning',
  [InvoiceStatus.PAID]: 'success',
  [InvoiceStatus.VOID]: 'error',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.BKASH]: 'bKash',
  [PaymentMethod.NAGAD]: 'Nagad',
  [PaymentMethod.ROCKET]: 'Rocket',
  [PaymentMethod.BANK_TRANSFER]: 'Bank transfer',
  [PaymentMethod.CHEQUE]: 'Cheque',
  [PaymentMethod.CARD]: 'Card',
  [PaymentMethod.OTHER]: 'Other',
};

export const PAYMENT_METHOD_OPTIONS: IRhfSelectOption[] = Object.values(PaymentMethod).map((m) => ({
  value: m,
  label: PAYMENT_METHOD_LABELS[m],
}));

export const INVOICE_EVENT_LABELS: Record<string, string> = {
  CREATED: 'Created',
  SENT: 'Sent to client',
  VIEWED: 'Viewed by client',
  PAYMENT_RECORDED: 'Payment recorded',
  PAID: 'Fully paid',
  VOIDED: 'Voided',
};
