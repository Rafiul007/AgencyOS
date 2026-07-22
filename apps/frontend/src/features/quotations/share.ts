import type { IQuote } from '@agencyos/shared';
import { formatMinor } from '@/lib/money';

/** Cap the itemised list so the message stays readable on a phone. */
const MAX_ITEMS = 8;

function fmtDate(iso: string | null): string | null {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : null;
}

/**
 * Builds a friendly, human-readable WhatsApp message for a quotation: who it's from,
 * a short list of services, the total, validity, and the client approval link.
 */
export function buildQuoteShareMessage(
  quote: IQuote,
  agencyName: string,
  approvalUrl: string | null,
): string {
  const greeting = quote.clientName ? `Hi ${quote.clientName},` : 'Hi there,';

  const items = quote.lineItems ?? [];
  const shown = items.slice(0, MAX_ITEMS).map((line) => {
    const qty = line.quantity > 1 ? ` (x${line.quantity})` : '';
    return `• ${line.description}${qty} — ${formatMinor(line.lineTotalMinor, quote.currency)}`;
  });
  if (items.length > MAX_ITEMS) {
    shown.push(`• …and ${items.length - MAX_ITEMS} more`);
  }

  const validTill = fmtDate(quote.expiresAt);

  const lines: string[] = [
    greeting,
    '',
    `Thank you for considering ${agencyName}. Here's your quotation ${quote.number}:`,
    '',
    ...shown,
    '',
    `Total: ${formatMinor(quote.totalMinor, quote.currency)}`,
  ];
  if (validTill) {
    lines.push(`Valid till: ${validTill}`);
  }
  if (approvalUrl) {
    lines.push('', 'You can review and approve it online here:', approvalUrl);
  }
  lines.push('', 'Feel free to reach out if you have any questions.', `— ${agencyName}`);

  return lines.join('\n');
}
