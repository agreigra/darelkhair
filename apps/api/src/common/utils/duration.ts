const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parse a short duration string ("15m", "7d", "24h", "3600s") into milliseconds.
 * A bare number is treated as seconds. Throws on an unparseable value so a
 * misconfigured token lifetime fails fast at boot rather than silently.
 */
export function parseDurationToMs(value: string): number {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 1000;
  }
  const match = /^(\d+)(s|m|h|d)$/.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid duration: "${value}"`);
  }
  return Number(match[1]) * UNIT_MS[match[2]];
}
