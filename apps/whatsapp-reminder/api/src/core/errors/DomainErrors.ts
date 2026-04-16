import { AppError, ErrorCode } from './AppError';

/**
 * MESSAGING DOMAIN ERRORS
 */
export class MessagingProviderError extends AppError {
    constructor(message: string, provider: string) {
        super(`[${provider}] ${message}`, ErrorCode.INTERNAL_ERROR, 502);
    }
}

export class ProviderQuotaExceededError extends AppError {
    constructor(provider: string) {
        super(`Messaging quota exceeded for ${provider}`, ErrorCode.RATE_LIMIT_EXCEEDED, 429);
    }
}

/**
 * AUTH DOMAIN ERRORS
 */
export class UserAccountNotActivatedError extends AppError {
    constructor() {
        super('Your account is not activated. Please link your license.', ErrorCode.UNAUTHORIZED, 401);
    }
}

export class InvalidLicenseKeyError extends AppError {
    constructor() {
        super('The license key provided is invalid or has already been used.', ErrorCode.BAD_REQUEST, 400);
    }
}

/**
 * CALENDAR DOMAIN ERRORS
 */
export class CalendarSyncFailedError extends AppError {
    constructor(reason: string) {
        super(`Google Calendar sync failed: ${reason}`, ErrorCode.CALENDAR_SYNC_FAILED, 500);
    }
}

export class GoogleAuthExpiredError extends AppError {
    constructor() {
        super('Your Google connection has expired. Please re-link your calendar.', ErrorCode.GOOGLE_AUTH_EXPIRED, 403);
    }
}
