/**
 * Utility to format phone numbers to Meta's required international format (e.g., 62857...)
 * This version supports international inputs starting with '+'
 */
export const formatPhone = (phone: string | null | undefined, defaultCountry: string = '62'): string => {
    if (!phone) return '';
    
    const trimmed = phone.trim();
    const isExplicitInternational = trimmed.startsWith('+');
    
    // 1. Remove all non-numeric characters
    let cleaned = trimmed.replace(/\D/g, '');

    // 2. If the user provided an explicit '+' (e.g., +1 555...), 
    // we trust that the country code is already included.
    if (isExplicitInternational) {
        return cleaned;
    }

    // 3. Handle leading '0' (Local format for the default country)
    if (cleaned.startsWith('0')) {
        return defaultCountry + cleaned.substring(1);
    }

    // 4. If it's a short number and doesn't start with the country code, add it
    // (Example: User types '812...' instead of '62812...')
    if (!cleaned.startsWith(defaultCountry) && cleaned.length <= 11) {
        return defaultCountry + cleaned;
    }

    return cleaned;
};
