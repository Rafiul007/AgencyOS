import type { IconName } from '@/lib/iconHash';

export interface ILandingFeature {
  icon: IconName;
  title: string;
  description: string;
}

export interface IFeatureBlock {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  variant: 'quotation' | 'analytics';
}

export interface ITestimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface IFaq {
  question: string;
  answer: string;
}

/** Core product modules shown in the benefits grid. */
export const LANDING_FEATURES: ILandingFeature[] = [
  {
    icon: 'Description',
    title: 'Memos & Quotations',
    description:
      'Build quotations and digital memos from templates, then send them for client approval and e-signature.',
  },
  {
    icon: 'Email',
    title: 'Promotional Email',
    description:
      'Design campaigns, segment contacts, schedule sends, and track opens and clicks in one place.',
  },
  {
    icon: 'Support',
    title: 'Support Ticketing',
    description:
      'Let clients raise tickets, then assign, prioritise, and resolve them with SLAs and shared history.',
  },
  {
    icon: 'Event',
    title: 'Event Ticketing',
    description:
      'Create marketing events, sell tiered tickets, and check attendees in with QR codes on the day.',
  },
  {
    icon: 'People',
    title: 'CRM & Clients',
    description:
      'Keep every client, contact, and interaction together with a timeline of quotes, emails, and tickets.',
  },
  {
    icon: 'Receipt',
    title: 'Invoicing & Payments',
    description:
      'Turn approved quotations into invoices and collect payments online, with paid and overdue tracking.',
  },
];

export const PARTNERS = ['Hotjar', 'Loom', 'Lattice', 'Evernote', 'Notion'];

/** Alternating feature blocks with mock visuals. */
export const FEATURE_BLOCKS: IFeatureBlock[] = [
  {
    eyebrow: 'Quotations',
    title: 'Quotations your clients can approve in a click',
    description:
      'Draft polished quotations from reusable templates, share a secure link, and watch them move from sent to approved — then convert to an invoice.',
    points: [
      'Reusable templates & line items',
      'Client approval + e-signature',
      'One-click convert to invoice',
    ],
    variant: 'quotation',
  },
  {
    eyebrow: 'Analytics',
    title: 'Real-time performance across every client',
    description:
      'See revenue, campaign engagement, ticket SLAs, and event sales in one dashboard — so you always know what is working.',
    points: ['Live revenue & pipeline', 'Campaign open & click rates', 'Ticket and event insights'],
    variant: 'analytics',
  },
];

export const TESTIMONIALS: ITestimonial[] = [
  {
    quote:
      'We replaced three tools with AgencyOS. Quotations that used to take a day now go out in minutes.',
    name: 'Jake George',
    role: 'Founder, Loom Studio',
    initials: 'JG',
  },
  {
    quote:
      'Support tickets and client emails finally live in one place. Our response times dropped noticeably.',
    name: 'Steve Arnwell',
    role: 'VP Marketing, Evernote',
    initials: 'SA',
  },
  {
    quote:
      'Selling event tickets and following up by email from the same workspace is a real time-saver.',
    name: 'Sam Rahmanian',
    role: 'CMO, Lattice',
    initials: 'SR',
  },
];

export const FAQS: IFaq[] = [
  {
    question: 'How does the free trial work?',
    answer:
      'Every new workspace starts on a 14-day free trial with full access. No credit card is required to get started.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. Every workspace is isolated with strict tenant separation, and data is encrypted in transit and at rest.',
  },
  {
    question: 'How many team members can I add?',
    answer:
      'Your account owner can invite up to 10 sub-users, each with a role such as Admin, Manager, Agent, or Read-only.',
  },
  {
    question: 'Can I manage multiple clients?',
    answer:
      'Absolutely. AgencyOS is built for agencies — manage all of your clients, quotations, and campaigns from one workspace.',
  },
];
