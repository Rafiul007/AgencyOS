import { UserRole } from '@agencyos/shared';
import type { IRhfSelectOption } from '@/components/rhf/RhfSelect';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.OWNER]: 'Owner',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.AGENT]: 'Agent',
  [UserRole.READ_ONLY]: 'Read-only',
};

export const ROLE_COLORS: Record<
  UserRole,
  'secondary' | 'info' | 'warning' | 'default' | 'success'
> = {
  [UserRole.OWNER]: 'secondary',
  [UserRole.ADMIN]: 'info',
  [UserRole.MANAGER]: 'warning',
  [UserRole.AGENT]: 'success',
  [UserRole.READ_ONLY]: 'default',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.OWNER]: 'Full access; the account subscriber.',
  [UserRole.ADMIN]: 'Manage everything including the team.',
  [UserRole.MANAGER]: 'Manage quotes, invoices, clients, and contacts.',
  [UserRole.AGENT]: 'Create and edit day-to-day records.',
  [UserRole.READ_ONLY]: 'View-only access.',
};

/** Roles that can be assigned to a teammate (Owner is reserved for the subscriber). */
export const ASSIGNABLE_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.AGENT,
  UserRole.READ_ONLY,
];

export const ROLE_OPTIONS: IRhfSelectOption[] = ASSIGNABLE_ROLES.map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));
