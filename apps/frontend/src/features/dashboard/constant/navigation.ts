import type { IconName } from '@/lib/iconHash';

export interface INavItem {
  key: string;
  label: string;
  icon: IconName;
  to?: string;
  ready?: boolean;
}

export interface INavSection {
  title: string;
  items: INavItem[];
}

/**
 * A top-level module shown in the icon rail. Each module owns the sub-navigation
 * (`sections`) rendered in the secondary sidebar when that module is active.
 */
export interface IModule {
  key: string;
  label: string;
  /** Short label shown under the icon in the narrow rail. */
  short: string;
  icon: IconName;
  /** Landing route when the module icon is clicked. */
  to?: string;
  ready?: boolean;
  sections: INavSection[];
}

export const MODULES: IModule[] = [
  {
    key: 'home',
    label: 'Home',
    short: 'Home',
    icon: 'Dashboard',
    to: '/dashboard',
    ready: true,
    sections: [
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
    ],
  },
  {
    key: 'clients',
    label: 'Clients',
    short: 'Clients',
    icon: 'People',
    to: '/clients',
    ready: true,
    sections: [
      {
        title: 'Clients',
        items: [
          { key: 'all-clients', label: 'All clients', icon: 'People', to: '/clients', ready: true },
          { key: 'contacts', label: 'Contacts', icon: 'People' },
        ],
      },
    ],
  },
  {
    key: 'quotes',
    label: 'Quotations',
    short: 'Quotes',
    icon: 'Description',
    to: '/quotations',
    ready: true,
    sections: [
      {
        title: 'Quotations',
        items: [
          {
            key: 'quotations',
            label: 'All quotations',
            icon: 'Description',
            to: '/quotations',
            ready: true,
          },
          {
            key: 'catalog',
            label: 'Services & products',
            icon: 'Description',
            to: '/catalog',
            ready: true,
          },
          { key: 'templates', label: 'Templates', icon: 'Description' },
          { key: 'quote-settings', label: 'Quote settings', icon: 'Settings' },
        ],
      },
    ],
  },
  {
    key: 'invoices',
    label: 'Invoices',
    short: 'Invoices',
    icon: 'Receipt',
    sections: [
      {
        title: 'Billing',
        items: [
          { key: 'invoices', label: 'All invoices', icon: 'Receipt' },
          { key: 'payments', label: 'Payments', icon: 'Receipt' },
        ],
      },
    ],
  },
  {
    key: 'events',
    label: 'Events',
    short: 'Events',
    icon: 'Event',
    sections: [
      {
        title: 'Events',
        items: [
          { key: 'events', label: 'All events', icon: 'Event' },
          { key: 'attendees', label: 'Attendees', icon: 'People' },
        ],
      },
    ],
  },
  {
    key: 'tickets',
    label: 'Tickets',
    short: 'Tickets',
    icon: 'Support',
    sections: [
      {
        title: 'Support',
        items: [
          { key: 'tickets', label: 'All tickets', icon: 'Support' },
          { key: 'kb', label: 'Knowledge base', icon: 'Description' },
        ],
      },
    ],
  },
  {
    key: 'email',
    label: 'Campaigns',
    short: 'Email',
    icon: 'Email',
    sections: [
      {
        title: 'Campaigns',
        items: [
          { key: 'campaigns', label: 'Campaigns', icon: 'Email' },
          { key: 'contacts', label: 'Contacts', icon: 'People' },
        ],
      },
    ],
  },
];

/** Settings lives on the main rail (bottom), not in the sub-menu. */
export const SETTINGS_ITEM: IModule = {
  key: 'settings',
  label: 'Settings',
  short: 'Settings',
  icon: 'Settings',
  sections: [],
};

/** Resolve which module the current route belongs to (defaults to Home). */
export function getActiveModule(pathname: string): IModule {
  // Prefer an exact sub-item match…
  const bySection = MODULES.find((m) =>
    m.sections.some((s) => s.items.some((i) => i.to === pathname)),
  );
  if (bySection) {
    return bySection;
  }
  // …then the module landing route, including nested paths (e.g. /quotations/new).
  const byModule = MODULES.find(
    (m) => m.to && (pathname === m.to || pathname.startsWith(`${m.to}/`)),
  );
  return byModule ?? MODULES[0];
}
