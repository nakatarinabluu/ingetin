/**
 * 🛠️ INGETIN FORMATTING UTILITIES
 * Standardized formatting for Currency, Dates, and Numbers.
 */

/**
 * Format number to Indonesian Rupiah (IDR)
 */
export const formatIDR = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '0';
    return amount.toLocaleString('id-ID');
};

/**
 * Format large numbers to million (jt) suffix for compact UI
 */
export const formatMillion = (amount: number | undefined | null): string => {
    // Fix [L-10]: was using `!amount` which treated 0 as falsy, losing a valid value
    if (amount === undefined || amount === null) return '0';
    return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'jt';
};

/**
 * Format date to Indonesian locale with various options
 */
export const formatDate = (date: Date | string, options: Intl.DateTimeFormatOptions = {}): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', options);
};

/**
 * Format time only
 */
export const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Safely parse percentage value between 0 and 100
 */
export const getSafePercent = (percent: number | undefined | null): number => {
    if (percent === undefined || percent === null || isNaN(percent)) return 0;
    return Math.min(Math.max(percent, 0), 100);
};
