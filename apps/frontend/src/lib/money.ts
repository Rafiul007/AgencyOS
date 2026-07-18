// Money is handled in integer minor units (BDT poisha). These helpers convert
// to/from the major unit (Taka) for display and form input.

const SYMBOLS: Record<string, string> = { BDT: '৳', USD: '$', INR: '₹' };

/** Format minor units as a currency string, e.g. 2500000 → "৳25,000". */
export function formatMinor(minor: number, currency = 'BDT'): string {
  const major = minor / 100;
  const symbol = SYMBOLS[currency] ?? '';
  return symbol + major.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

/** Convert a major-unit amount (Taka) to integer minor units. */
export function toMinor(major: number | string): number {
  return Math.round(Number(major) * 100);
}

/** Convert integer minor units back to a major-unit number (Taka). */
export function toMajor(minor: number): number {
  return minor / 100;
}
