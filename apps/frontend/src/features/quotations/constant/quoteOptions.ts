import { QuoteStatus } from '@agencyos/shared';

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  CONVERTED: 'Converted',
};

export const STATUS_COLORS: Record<string, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  DRAFT: 'default',
  SENT: 'info',
  ACCEPTED: 'success',
  REJECTED: 'error',
  EXPIRED: 'warning',
  CONVERTED: 'success',
};

/** Allowed next statuses (mirrors the backend transition rules). */
export const NEXT_STATUSES: Record<string, QuoteStatus[]> = {
  DRAFT: [QuoteStatus.SENT],
  SENT: [QuoteStatus.ACCEPTED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED],
  ACCEPTED: [QuoteStatus.CONVERTED],
  REJECTED: [],
  EXPIRED: [],
  CONVERTED: [],
};
