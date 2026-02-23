/**
 * Common date/time utilities for the server.
 */
export class DateUtils {
    /**
     * Format a Date as an ISO 8601 date string (YYYY-MM-DD).
     */
    static toDateString(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    /**
     * Get the current timestamp as an ISO 8601 string.
     */
    static nowISO(): string {
        return new Date().toISOString();
    }

    /**
     * Check if a date string or Date is in the past.
     */
    static isPast(date: Date | string): boolean {
        return new Date(date).getTime() < Date.now();
    }

    /**
     * Check if a date string or Date is in the future.
     */
    static isFuture(date: Date | string): boolean {
        return new Date(date).getTime() > Date.now();
    }

    /**
     * Add days to a date and return a new Date.
     */
    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Subtract days from a date and return a new Date.
     */
    static subtractDays(date: Date, days: number): Date {
        return this.addDays(date, -days);
    }

    /**
     * Get the difference in days between two dates (absolute value).
     */
    static diffInDays(a: Date | string, b: Date | string): number {
        const msPerDay = 86_400_000;
        return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / msPerDay;
    }

    /**
     * Get the start of day (00:00:00.000) for a given date.
     */
    static startOfDay(date: Date): Date {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    /**
     * Get the end of day (23:59:59.999) for a given date.
     */
    static endOfDay(date: Date): Date {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
    }

    /**
     * Check if two dates fall on the same calendar day.
     */
    static isSameDay(a: Date | string, b: Date | string): boolean {
        return this.toDateString(new Date(a)) === this.toDateString(new Date(b));
    }

    /**
     * Return the more recent of two dates.
     */
    static max(a: Date, b: Date): Date {
        return a.getTime() >= b.getTime() ? a : b;
    }

    /**
     * Return the earlier of two dates.
     */
    static min(a: Date, b: Date): Date {
        return a.getTime() <= b.getTime() ? a : b;
    }

    /**
     * Check if a date falls within a range (inclusive).
     */
    static isWithinRange(date: Date | string, start: Date | string, end: Date | string): boolean {
        const ts = new Date(date).getTime();
        return ts >= new Date(start).getTime() && ts <= new Date(end).getTime();
    }

    /**
     * Format a date for display as a short, human-readable date string (UTC).
     * Use for: UI labels, activity logs, default titles — anywhere you need a clean date-only string.
     * Output example: "Feb 16, 2026"
     */
    static toDisplayDate(date: Date | string | null | undefined): string {
        if (date == null) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
        });
    }

    /**
     * Format a date as a full date+time string in the server's local timezone.
     * Use for: timestamps, audit trails, debugging — anywhere you need both date and time.
     * Output example: "2/16/2026, 3:45:12 PM"
     */
    static formatDate(date: Date | string | null | undefined): string {
        if (date == null) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleString('en-US');
    }

    /**
     * Format a date as a human-readable relative string (e.g. "3 days ago", "in 2 hours").
     */
    static toRelativeString(date: Date | string): string {
        const now = Date.now();
        const ts = new Date(date).getTime();
        const diffMs = ts - now;
        const absDiffMs = Math.abs(diffMs);
        const isFuture = diffMs > 0;

        const seconds = Math.floor(absDiffMs / 1_000);
        const minutes = Math.floor(absDiffMs / 60_000);
        const hours = Math.floor(absDiffMs / 3_600_000);
        const days = Math.floor(absDiffMs / 86_400_000);

        let label: string;
        if (seconds < 60) {
            label = 'just now';
            return label;
        } else if (minutes < 60) {
            label = `${minutes} minute${minutes === 1 ? '' : 's'}`;
        } else if (hours < 24) {
            label = `${hours} hour${hours === 1 ? '' : 's'}`;
        } else {
            label = `${days} day${days === 1 ? '' : 's'}`;
        }

        return isFuture ? `in ${label}` : `${label} ago`;
    }
}
