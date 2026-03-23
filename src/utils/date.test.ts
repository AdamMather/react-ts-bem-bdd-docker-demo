import { describe, expect, it } from 'vitest';
import useDateFormatter from './date';

describe('useDateFormatter', () => {
  it('returns an empty string for missing and invalid values', () => {
    const { formatDate } = useDateFormatter();

    expect(formatDate()).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate('not-a-date')).toBe('');
  });

  it('formats string and Date inputs as YYYY-MM-DD', () => {
    const { formatDate } = useDateFormatter();

    expect(formatDate('2026-03-04T12:00:00.000Z')).toBe('2026-03-04');
    expect(formatDate(new Date('2026-12-09T00:00:00.000Z'))).toBe('2026-12-09');
  });
});
