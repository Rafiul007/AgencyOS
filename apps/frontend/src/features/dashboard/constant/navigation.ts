import type { IconName } from '@/lib/iconHash';

export interface INavItem {
  key: string;
  label: string;
  /** Shorter label used under the icon in the narrow rail. */
  short?: string;
  icon: IconName;
  to?: string;
  ready?: boolean;
}

export interface INavSection {
  title: string;
  items: INavItem[];
}

/** Modules shown in the narrow left icon rail. */
export const PRIMARY_MODULES: INavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    short: 'Home',
    icon: 'Dashboard',
    to: '/dashboard',
    ready: true,
  },
  { key: 'quotations', label: 'Quotations', short: 'Quotes', icon: 'Description' },
  { key: 'campaigns', label: 'Campaigns', short: 'Email', icon: 'Email' },
  { key: 'tickets', label: 'Tickets', short: 'Tickets', icon: 'Support' },
  { key: 'events', label: 'Events', short: 'Events', icon: 'Event' },
  { key: 'clients', label: 'Clients', short: 'Clients', icon: 'People' },
  { key: 'invoices', label: 'Invoices', short: 'Invoices', icon: 'Receipt' },
];

/** Contextual navigation shown in the secondary sidebar. */
export const SIDEBAR_SECTIONS: INavSection[] = [
  {
    title: 'Home',
    items: [
      { key: 'overview', label: 'Overview', icon: 'Dashboard', to: '/dashboard', ready: true },
      {
        key: 'getting-started',
        label: 'Getting started',
        icon: 'Check',
        to: '/dashboard',
        ready: true,
      },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { key: 'quotations', label: 'Quotations', icon: 'Description' },
      { key: 'campaigns', label: 'Campaigns', icon: 'Email' },
      { key: 'tickets', label: 'Tickets', icon: 'Support' },
      { key: 'events', label: 'Events', icon: 'Event' },
      { key: 'clients', label: 'Clients', icon: 'People' },
      { key: 'invoices', label: 'Invoices', icon: 'Receipt' },
    ],
  },
  {
    title: 'Account',
    items: [{ key: 'settings', label: 'Settings', icon: 'Settings' }],
  },
];
