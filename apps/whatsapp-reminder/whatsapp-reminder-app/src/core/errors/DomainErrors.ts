import { AppError, BadRequestError, UnauthorizedError } from './AppError';

/**
 * MESSAGING DOMAIN ERRORS
 */
export class MessagingProviderError extends AppError {
    constructor(message: string, provider: string) {
        super(`[${provider}] ${message}`, 502, 'MESSAGING_PROVIDER_ERROR');
    }
}

export class ProviderQuotaExceededError extends AppError {
    constructor(provider: string) {
        super(`Messaging quota exceeded for ${provider}`, 429, 'PROVIDER_QUOTA_EXCEEDED');
    }
}

/**
 * AUTH DOMAIN ERRORS
 */
export class UserAccountNotActivatedError extends UnauthorizedError {
    constructor() {
        super('Your account is not activated. Please link your license.');
    }
}

export class InvalidLicenseKeyError extends BadRequestError {
    constructor() {
        super('The license key provided is invalid or has already been used.');
    }
}

/**
 * CALENDAR DOMAIN ERRORS
 */
export class CalendarSyncFailedError extends AppError {
    constructor(reason: string) {
        super(`Google Calendar sync failed: ${reason}`, 500, 'CALENDAR_SYNC_FAILED');
    }
}

export class GoogleAuthExpiredError extends AppError {
    constructor() {
        super('Your Google connection has expired. Please re-link your calendar.', 403, 'GOOGLE_AUTH_EXPIRED');
    }
}
