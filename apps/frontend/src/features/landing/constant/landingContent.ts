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

export interface IPricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
}

/** Single, simple plan. */
export const PRICING_PLAN: IPricingPlan = {
  name: 'Professional',
  price: '৳1,000',
  period: '/month',
  description: 'Everything your agency needs, in one simple plan.',
  features: [
    'All modules — quotations, email, tickets, events, CRM & invoicing',
    'Up to 10 team members',
    'Unlimited clients',
    'bKash, Nagad & card payments',
    '14-day free trial — no card required',
    'Email support',
  ],
};

export interface IDemoFormField {
  name: 'name' | 'email' | 'company' | 'message';
  label: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}

/** Field config for the "Request a demo" form — rendered by mapping over it. */
export const DEMO_FORM_FIELDS: IDemoFormField[] = [
  { name: 'name', label: 'Full name' },
  { name: 'email', label: 'Work email', type: 'email' },
  { name: 'company', label: 'Company' },
  { name: 'message', label: 'What would you like to see?', multiline: true, rows: 3 },
];

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
      'Turn approved quotations into invoices and collect payments via bKash, Nagad, or card — with paid and overdue tracking.',
  },
];

export const PARTNERS = ['bKash', 'Pathao', 'Daraz', 'Chaldal', 'ShopUp'];

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
    name: 'Tanvir Ahmed',
    role: 'Founder, Dhaka Creative',
    initials: 'TA',
  },
  {
    quote:
      'Support tickets and client emails finally live in one place. Our response times dropped noticeably.',
    name: 'Nusrat Jahan',
    role: 'Marketing Lead, Shohoz',
    initials: 'NJ',
  },
  {
    quote:
      'Collecting payments through bKash and following up by email from the same workspace is a real time-saver.',
    name: 'Rakib Hasan',
    role: 'CMO, Chaldal',
    initials: 'RH',
  },
];

export const FAQS: IFaq[] = [
  {
    question: 'How does the free trial work?',
    answer:
      'Every new workspace starts on a 14-day free trial with full access. No card is required to get started, and paid plans are billed in BDT.',
  },
  {
    question: 'Which payment methods can I collect with?',
    answer:
      'You can collect client payments through bKash, Nagad, and cards, and reconcile them against invoices automatically.',
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
