import { DEFAULT_QUOTE_TEMPLATE, QuoteTemplate } from '@agencyos/shared';
import type { IQuoteTemplateStyle } from '../interface';

const SANS = '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", Times, serif';

/**
 * Style tokens for each built-in template. This is the single source of truth for how
 * a template looks; `QuoteDocument` reads from here and never hard-codes a template.
 */
export const TEMPLATE_STYLES: Record<QuoteTemplate, IQuoteTemplateStyle> = {
  [QuoteTemplate.CLASSIC]: {
    key: QuoteTemplate.CLASSIC,
    fontFamily: SERIF,
    headerVariant: 'bar',
    accent: '#6e56cf',
    onAccent: '#ffffff',
    headerBg: '#1b1c39',
    ink: '#1b1c39',
    inkSoft: '#5a5b7a',
    surface: '#ffffff',
    panel: '#f7f7fb',
    border: '#d9dae6',
    tableHeadBg: '#1b1c39',
    tableHeadText: '#ffffff',
    stripedRows: false,
    radius: 4,
    titleUpper: true,
    titleWeight: 700,
  },
  [QuoteTemplate.MODERN]: {
    key: QuoteTemplate.MODERN,
    fontFamily: SANS,
    headerVariant: 'gradient',
    accent: '#6e56cf',
    onAccent: '#ffffff',
    headerBg: 'linear-gradient(120deg, #6e56cf 0%, #a78bfa 60%, #ff7a59 130%)',
    ink: '#1b1c39',
    inkSoft: '#6b6c86',
    surface: '#ffffff',
    panel: '#f5f3ff',
    border: '#ece9fb',
    tableHeadBg: '#f5f3ff',
    tableHeadText: '#6e56cf',
    stripedRows: false,
    radius: 18,
    titleUpper: false,
    titleWeight: 800,
  },
  [QuoteTemplate.MINIMALIST]: {
    key: QuoteTemplate.MINIMALIST,
    fontFamily: SANS,
    headerVariant: 'plain',
    accent: '#111827',
    onAccent: '#ffffff',
    headerBg: 'transparent',
    ink: '#111827',
    inkSoft: '#9ca3af',
    surface: '#ffffff',
    panel: '#ffffff',
    border: '#e5e7eb',
    tableHeadBg: 'transparent',
    tableHeadText: '#9ca3af',
    stripedRows: false,
    radius: 0,
    titleUpper: false,
    titleWeight: 500,
  },
  [QuoteTemplate.PROFESSIONAL]: {
    key: QuoteTemplate.PROFESSIONAL,
    fontFamily: SANS,
    headerVariant: 'block',
    accent: '#2c7be5',
    onAccent: '#ffffff',
    headerBg: '#12233b',
    ink: '#12233b',
    inkSoft: '#5b6b7f',
    surface: '#ffffff',
    panel: '#f1f5f9',
    border: '#dbe3ec',
    tableHeadBg: '#12233b',
    tableHeadText: '#ffffff',
    stripedRows: true,
    radius: 6,
    titleUpper: true,
    titleWeight: 700,
  },
  [QuoteTemplate.BOLD]: {
    key: QuoteTemplate.BOLD,
    fontFamily: SANS,
    headerVariant: 'banner',
    accent: '#ff5a1f',
    onAccent: '#ffffff',
    headerBg: '#111111',
    ink: '#111111',
    inkSoft: '#6b7280',
    surface: '#ffffff',
    panel: '#fff5f0',
    border: '#111111',
    tableHeadBg: '#111111',
    tableHeadText: '#ffffff',
    stripedRows: false,
    radius: 2,
    titleUpper: true,
    titleWeight: 900,
  },
};

/** Resolve a template's style, falling back to the default if an unknown key slips through. */
export function templateStyle(key: QuoteTemplate): IQuoteTemplateStyle {
  return TEMPLATE_STYLES[key] ?? TEMPLATE_STYLES[DEFAULT_QUOTE_TEMPLATE];
}
