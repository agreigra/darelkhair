import { parseDurationToMs } from './duration';

describe('parseDurationToMs', () => {
  it('parses unit suffixes', () => {
    expect(parseDurationToMs('30s')).toBe(30 * 1000);
    expect(parseDurationToMs('15m')).toBe(15 * 60 * 1000);
    expect(parseDurationToMs('24h')).toBe(24 * 60 * 60 * 1000);
    expect(parseDurationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('treats a bare number as seconds', () => {
    expect(parseDurationToMs('3600')).toBe(3600 * 1000);
  });

  it('trims surrounding whitespace', () => {
    expect(parseDurationToMs('  15m  ')).toBe(15 * 60 * 1000);
  });

  it('throws on an unparseable value', () => {
    expect(() => parseDurationToMs('15x')).toThrow('Invalid duration');
    expect(() => parseDurationToMs('abc')).toThrow('Invalid duration');
    expect(() => parseDurationToMs('')).toThrow('Invalid duration');
  });
});
