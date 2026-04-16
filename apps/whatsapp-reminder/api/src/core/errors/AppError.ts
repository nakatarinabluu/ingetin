export enum ErrorCode {
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    GOOGLE_AUTH_EXPIRED = 'GOOGLE_AUTH_EXPIRED',
    CALENDAR_SYNC_FAILED = 'CALENDAR_SYNC_FAILED',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly code: ErrorCode = ErrorCode.INTERNAL_ERROR,
        public readonly statusCode: number = 500
    ) {
        super(message);
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = 'Bad Request') {
        super(message, ErrorCode.BAD_REQUEST, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, ErrorCode.UNAUTHORIZED, 401);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Not Found') {
        super(message, ErrorCode.NOT_FOUND, 404);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, ErrorCode.FORBIDDEN, 403);
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Rate limit exceeded') {
        super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Internal Server Error') {
        super(message, ErrorCode.INTERNAL_ERROR, 500);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Conflict') {
        super(message, ErrorCode.CONFLICT, 409);
    }
}
