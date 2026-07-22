import { ContactActivityOutcome, ContactActivityType, ContactStage } from '@agencyos/shared';
import type { IRhfSelectOption } from '@/components/rhf/RhfSelect';
import type { IconName } from '@/lib/iconHash';

/** Pipeline order, left→right, used by the board columns and stage selects. */
export const STAGE_ORDER: ContactStage[] = [
  ContactStage.NEW,
  ContactStage.CONTACTED,
  ContactStage.INTERESTED,
  ContactStage.QUALIFIED,
  ContactStage.WON,
  ContactStage.LOST,
];

export const STAGE_LABELS: Record<ContactStage, string> = {
  [ContactStage.NEW]: 'New',
  [ContactStage.CONTACTED]: 'Contacted',
  [ContactStage.INTERESTED]: 'Interested',
  [ContactStage.QUALIFIED]: 'Qualified',
  [ContactStage.WON]: 'Won',
  [ContactStage.LOST]: 'Lost',
};

/** MUI Chip colors for the stage tag. */
export const STAGE_COLORS: Record<
  ContactStage,
  'default' | 'info' | 'secondary' | 'warning' | 'success' | 'error'
> = {
  [ContactStage.NEW]: 'default',
  [ContactStage.CONTACTED]: 'info',
  [ContactStage.INTERESTED]: 'secondary',
  [ContactStage.QUALIFIED]: 'warning',
  [ContactStage.WON]: 'success',
  [ContactStage.LOST]: 'error',
};

/** Accent color used for the board column header bar. */
export const STAGE_ACCENT: Record<ContactStage, string> = {
  [ContactStage.NEW]: '#94a3b8',
  [ContactStage.CONTACTED]: '#3b82f6',
  [ContactStage.INTERESTED]: '#8b5cf6',
  [ContactStage.QUALIFIED]: '#f59e0b',
  [ContactStage.WON]: '#22c55e',
  [ContactStage.LOST]: '#ef4444',
};

export const STAGE_OPTIONS: IRhfSelectOption[] = STAGE_ORDER.map((s) => ({
  value: s,
  label: STAGE_LABELS[s],
}));

export const ACTIVITY_TYPE_META: Record<ContactActivityType, { label: string; icon: IconName }> = {
  [ContactActivityType.CALL]: { label: 'Call', icon: 'Phone' },
  [ContactActivityType.EMAIL]: { label: 'Email', icon: 'Email' },
  [ContactActivityType.WHATSAPP]: { label: 'WhatsApp', icon: 'WhatsApp' },
  [ContactActivityType.SMS]: { label: 'SMS', icon: 'Sms' },
  [ContactActivityType.AD]: { label: 'Ad sent', icon: 'Campaign' },
  [ContactActivityType.MEETING]: { label: 'Meeting', icon: 'Meeting' },
  [ContactActivityType.NOTE]: { label: 'Note', icon: 'Note' },
};

export const ACTIVITY_TYPE_OPTIONS: IRhfSelectOption[] = Object.values(ContactActivityType).map(
  (t) => ({ value: t, label: ACTIVITY_TYPE_META[t].label }),
);

export const OUTCOME_LABELS: Record<ContactActivityOutcome, string> = {
  [ContactActivityOutcome.CONNECTED]: 'Connected',
  [ContactActivityOutcome.NO_ANSWER]: 'No answer',
  [ContactActivityOutcome.INTERESTED]: 'Interested',
  [ContactActivityOutcome.NOT_INTERESTED]: 'Not interested',
  [ContactActivityOutcome.FOLLOW_UP]: 'Needs follow-up',
  [ContactActivityOutcome.BOUNCED]: 'Bounced',
  [ContactActivityOutcome.DONE]: 'Done',
};

export const OUTCOME_OPTIONS: IRhfSelectOption[] = [
  { value: '', label: '— No outcome —' },
  ...Object.values(ContactActivityOutcome).map((o) => ({ value: o, label: OUTCOME_LABELS[o] })),
];

export const SOURCE_OPTIONS: IRhfSelectOption[] = [
  { value: '', label: '— Source —' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Website', label: 'Website' },
  { value: 'Cold list', label: 'Cold list' },
  { value: 'Event', label: 'Event' },
  { value: 'Other', label: 'Other' },
];
