import { describe, it, expect, vi, afterEach } from 'vitest';
import { DateUtils } from '../src/DateUtils.js';

describe('DateUtils', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('toDateString', () => {
        it('formats a date as YYYY-MM-DD', () => {
            const date = new Date('2026-03-15T10:30:00Z');
            expect(DateUtils.toDateString(date)).toBe('2026-03-15');
        });

        it('uses UTC date (not local)', () => {
            // Midnight UTC on Jan 2 — local timezone should not shift the date
            const date = new Date('2026-01-02T00:00:00Z');
            expect(DateUtils.toDateString(date)).toBe('2026-01-02');
        });

        it('pads single-digit months and days', () => {
            const date = new Date('2026-01-05T12:00:00Z');
            expect(DateUtils.toDateString(date)).toBe('2026-01-05');
        });
    });

    describe('nowISO', () => {
        it('returns an ISO 8601 string', () => {
            const result = DateUtils.nowISO();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
        });

        it('returns the current time', () => {
            const before = Date.now();
            const result = new Date(DateUtils.nowISO()).getTime();
            const after = Date.now();
            expect(result).toBeGreaterThanOrEqual(before);
            expect(result).toBeLessThanOrEqual(after);
        });
    });

    describe('isPast', () => {
        it('returns true for a past date', () => {
            expect(DateUtils.isPast(new Date('2000-01-01'))).toBe(true);
        });

        it('returns false for a future date', () => {
            expect(DateUtils.isPast(new Date('2099-01-01'))).toBe(false);
        });

        it('accepts a date string', () => {
            expect(DateUtils.isPast('2000-01-01')).toBe(true);
        });
    });

    describe('isFuture', () => {
        it('returns true for a future date', () => {
            expect(DateUtils.isFuture(new Date('2099-01-01'))).toBe(true);
        });

        it('returns false for a past date', () => {
            expect(DateUtils.isFuture(new Date('2000-01-01'))).toBe(false);
        });

        it('accepts a date string', () => {
            expect(DateUtils.isFuture('2099-12-31')).toBe(true);
        });
    });

    describe('addDays', () => {
        it('adds days to a date', () => {
            const date = new Date('2026-01-10T12:00:00Z');
            const result = DateUtils.addDays(date, 5);
            expect(DateUtils.toDateString(result)).toBe('2026-01-15');
        });

        it('does not mutate the original date', () => {
            const date = new Date('2026-01-10T12:00:00Z');
            DateUtils.addDays(date, 5);
            expect(DateUtils.toDateString(date)).toBe('2026-01-10');
        });

        it('handles month rollover', () => {
            const date = new Date('2026-01-30T12:00:00Z');
            const result = DateUtils.addDays(date, 5);
            expect(DateUtils.toDateString(result)).toBe('2026-02-04');
        });

        it('handles negative days', () => {
            const date = new Date('2026-01-10T12:00:00Z');
            const result = DateUtils.addDays(date, -3);
            expect(DateUtils.toDateString(result)).toBe('2026-01-07');
        });
    });

    describe('subtractDays', () => {
        it('subtracts days from a date', () => {
            const date = new Date('2026-01-15T12:00:00Z');
            const result = DateUtils.subtractDays(date, 5);
            expect(DateUtils.toDateString(result)).toBe('2026-01-10');
        });

        it('does not mutate the original date', () => {
            const date = new Date('2026-01-15T12:00:00Z');
            DateUtils.subtractDays(date, 5);
            expect(DateUtils.toDateString(date)).toBe('2026-01-15');
        });
    });

    describe('diffInDays', () => {
        it('returns the difference in days between two dates', () => {
            expect(DateUtils.diffInDays('2026-01-01', '2026-01-11')).toBe(10);
        });

        it('returns absolute value regardless of order', () => {
            expect(DateUtils.diffInDays('2026-01-11', '2026-01-01')).toBe(10);
        });

        it('returns 0 for the same date', () => {
            expect(DateUtils.diffInDays('2026-06-15', '2026-06-15')).toBe(0);
        });

        it('accepts Date objects', () => {
            const a = new Date('2026-03-01T00:00:00Z');
            const b = new Date('2026-03-04T00:00:00Z');
            expect(DateUtils.diffInDays(a, b)).toBe(3);
        });

        it('returns fractional days for non-midnight times', () => {
            const a = new Date('2026-01-01T00:00:00Z');
            const b = new Date('2026-01-01T12:00:00Z');
            expect(DateUtils.diffInDays(a, b)).toBe(0.5);
        });
    });

    describe('startOfDay', () => {
        it('sets time to 00:00:00.000', () => {
            const date = new Date('2026-05-20T15:30:45.123');
            const result = DateUtils.startOfDay(date);
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });

        it('does not mutate the original date', () => {
            const date = new Date('2026-05-20T15:30:45.123');
            const originalTime = date.getTime();
            DateUtils.startOfDay(date);
            expect(date.getTime()).toBe(originalTime);
        });
    });

    describe('endOfDay', () => {
        it('sets time to 23:59:59.999', () => {
            const date = new Date('2026-05-20T10:00:00.000');
            const result = DateUtils.endOfDay(date);
            expect(result.getHours()).toBe(23);
            expect(result.getMinutes()).toBe(59);
            expect(result.getSeconds()).toBe(59);
            expect(result.getMilliseconds()).toBe(999);
        });

        it('does not mutate the original date', () => {
            const date = new Date('2026-05-20T10:00:00.000');
            const originalTime = date.getTime();
            DateUtils.endOfDay(date);
            expect(date.getTime()).toBe(originalTime);
        });
    });

    describe('isSameDay', () => {
        it('returns true for the same calendar day', () => {
            expect(DateUtils.isSameDay(
                new Date('2026-04-10T08:00:00Z'),
                new Date('2026-04-10T20:00:00Z'),
            )).toBe(true);
        });

        it('returns false for different days', () => {
            expect(DateUtils.isSameDay('2026-04-10', '2026-04-11')).toBe(false);
        });

        it('accepts string inputs', () => {
            expect(DateUtils.isSameDay('2026-07-04', '2026-07-04')).toBe(true);
        });
    });

    describe('max', () => {
        it('returns the later date', () => {
            const a = new Date('2026-01-01');
            const b = new Date('2026-06-01');
            expect(DateUtils.max(a, b)).toBe(b);
        });

        it('returns the first date when equal', () => {
            const a = new Date('2026-01-01T00:00:00Z');
            const b = new Date('2026-01-01T00:00:00Z');
            expect(DateUtils.max(a, b)).toBe(a);
        });
    });

    describe('min', () => {
        it('returns the earlier date', () => {
            const a = new Date('2026-01-01');
            const b = new Date('2026-06-01');
            expect(DateUtils.min(a, b)).toBe(a);
        });

        it('returns the first date when equal', () => {
            const a = new Date('2026-01-01T00:00:00Z');
            const b = new Date('2026-01-01T00:00:00Z');
            expect(DateUtils.min(a, b)).toBe(a);
        });
    });

    describe('isWithinRange', () => {
        it('returns true when date is within range', () => {
            expect(DateUtils.isWithinRange('2026-03-15', '2026-03-01', '2026-03-31')).toBe(true);
        });

        it('returns true when date equals start (inclusive)', () => {
            expect(DateUtils.isWithinRange('2026-03-01', '2026-03-01', '2026-03-31')).toBe(true);
        });

        it('returns true when date equals end (inclusive)', () => {
            expect(DateUtils.isWithinRange('2026-03-31', '2026-03-01', '2026-03-31')).toBe(true);
        });

        it('returns false when date is before range', () => {
            expect(DateUtils.isWithinRange('2026-02-28', '2026-03-01', '2026-03-31')).toBe(false);
        });

        it('returns false when date is after range', () => {
            expect(DateUtils.isWithinRange('2026-04-01', '2026-03-01', '2026-03-31')).toBe(false);
        });

        it('accepts Date objects', () => {
            const date = new Date('2026-06-15T12:00:00Z');
            const start = new Date('2026-06-01T00:00:00Z');
            const end = new Date('2026-06-30T23:59:59Z');
            expect(DateUtils.isWithinRange(date, start, end)).toBe(true);
        });
    });

    describe('toDisplayDate', () => {
        it('formats a Date as "Mon DD, YYYY"', () => {
            const date = new Date('2026-02-16T00:00:00Z');
            expect(DateUtils.toDisplayDate(date)).toBe('Feb 16, 2026');
        });

        it('formats a date string', () => {
            expect(DateUtils.toDisplayDate('2026-12-25T00:00:00Z')).toBe('Dec 25, 2026');
        });

        it('returns empty string for null', () => {
            expect(DateUtils.toDisplayDate(null)).toBe('');
        });

        it('returns empty string for undefined', () => {
            expect(DateUtils.toDisplayDate(undefined)).toBe('');
        });
    });

    describe('formatDate', () => {
        it('returns a locale-formatted date+time string', () => {
            const result = DateUtils.formatDate('2026-02-16T15:45:12Z');
            // The exact format depends on locale/timezone, but it should contain date components
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThan(0);
        });

        it('returns empty string for null', () => {
            expect(DateUtils.formatDate(null)).toBe('');
        });

        it('returns empty string for undefined', () => {
            expect(DateUtils.formatDate(undefined)).toBe('');
        });

        it('accepts a Date object', () => {
            const date = new Date('2026-07-04T12:00:00Z');
            const result = DateUtils.formatDate(date);
            expect(result).toBeTruthy();
        });
    });

    describe('toRelativeString', () => {
        it('returns "just now" for very recent times', () => {
            const now = new Date();
            expect(DateUtils.toRelativeString(now)).toBe('just now');
        });

        it('returns minutes ago for past times within an hour', () => {
            const date = new Date(Date.now() - 5 * 60_000);
            expect(DateUtils.toRelativeString(date)).toBe('5 minutes ago');
        });

        it('returns singular "minute" for 1 minute', () => {
            const date = new Date(Date.now() - 1 * 60_000);
            expect(DateUtils.toRelativeString(date)).toBe('1 minute ago');
        });

        it('returns hours ago for past times within a day', () => {
            const date = new Date(Date.now() - 3 * 3_600_000);
            expect(DateUtils.toRelativeString(date)).toBe('3 hours ago');
        });

        it('returns singular "hour" for 1 hour', () => {
            const date = new Date(Date.now() - 1 * 3_600_000);
            expect(DateUtils.toRelativeString(date)).toBe('1 hour ago');
        });

        it('returns days ago for past times beyond a day', () => {
            const date = new Date(Date.now() - 5 * 86_400_000);
            expect(DateUtils.toRelativeString(date)).toBe('5 days ago');
        });

        it('returns singular "day" for 1 day', () => {
            const date = new Date(Date.now() - 1 * 86_400_000);
            expect(DateUtils.toRelativeString(date)).toBe('1 day ago');
        });

        it('returns "in X minutes" for near future', () => {
            const date = new Date(Date.now() + 10 * 60_000);
            expect(DateUtils.toRelativeString(date)).toBe('in 10 minutes');
        });

        it('returns "in X hours" for future within a day', () => {
            const date = new Date(Date.now() + 2 * 3_600_000);
            expect(DateUtils.toRelativeString(date)).toBe('in 2 hours');
        });

        it('returns "in X days" for future beyond a day', () => {
            const date = new Date(Date.now() + 3 * 86_400_000);
            expect(DateUtils.toRelativeString(date)).toBe('in 3 days');
        });

        it('accepts a date string', () => {
            const date = new Date(Date.now() - 2 * 86_400_000).toISOString();
            expect(DateUtils.toRelativeString(date)).toBe('2 days ago');
        });
    });
});
