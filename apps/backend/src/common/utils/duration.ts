/** Parse a short duration string like "15m", "7d", "24h", "60s" into milliseconds. */
export function durationToMs(value: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration: "${value}" (expected e.g. 15m, 24h, 7d)`);
  }
  const amount = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * unitMs[unit];
}
