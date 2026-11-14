const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const fullDate = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function parse(value: string): Date {
    return new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
}

/** "2026-08-01" -> "Aug 2026" */
export function formatMonth(value: string | null): string {
    return value ? monthYear.format(parse(value)) : '';
}

/** "2026-08-01" -> "1 Aug 2026" */
export function formatDate(value: string | null): string {
    return value ? fullDate.format(parse(value)) : '';
}

/** "Aug 2026 — Present" */
export function formatPeriod(start: string, end: string | null, isCurrent: boolean): string {
    const finish = isCurrent ? 'Present' : formatMonth(end);

    return finish ? `${formatMonth(start)} — ${finish}` : formatMonth(start);
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Relative time such as "3 hours ago". */
export function timeAgo(value: string): string {
    const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
    const units: [number, string][] = [
        [60, 'second'],
        [60, 'minute'],
        [24, 'hour'],
        [30, 'day'],
        [12, 'month'],
        [Number.POSITIVE_INFINITY, 'year'],
    ];
    let amount = seconds;

    for (const [size, unit] of units) {
        if (amount < size) {
            return amount <= 0 ? 'just now' : `${amount} ${unit}${amount === 1 ? '' : 's'} ago`;
        }

        amount = Math.floor(amount / size);
    }

    return '';
}

/** Initials used by the designed image fallback, e.g. "Currency Converter" -> "CC". */
export function initials(text: string, limit = 3): string {
    return text
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, limit)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');
}

/** "https://www.github.com/someone" -> "github.com/someone" */
export function displayUrl(url: string): string {
    return url.replace(/^(https?:\/\/)?(www\.)?/i, '').replace(/^mailto:/i, '').replace(/\/$/, '');
}
