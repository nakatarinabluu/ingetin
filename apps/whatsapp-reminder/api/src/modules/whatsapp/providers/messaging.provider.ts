import type CircuitBreaker from 'opossum';

/** Re-export Opossum's Stats type for use in ProviderStatus */
export type OpossumStats = CircuitBreaker.Stats;

export interface SendMessageOptions {
    type: 'otp' | 'notif';
    to: string;
    userId?: string;
    idempotencyKey?: string;
}

export interface SendTemplateOptions extends SendMessageOptions {
    templateName: string;
    components?: string[];
}

export interface SendTextOptions extends SendMessageOptions {
    text: string;
}

export interface MessagingResponse {
    success: boolean;
    providerMessageId?: string;
    error?: string;
    rawResponse?: unknown;
}

export interface ProviderStatus {
    name: string;
    state: 'OPEN' | 'CLOSED' | 'OPERATIONAL' | 'DEGRADED';
    stats?: OpossumStats;
}

export interface MessagingProvider {
    name: string;
    sendText(options: SendTextOptions): Promise<MessagingResponse>;
    sendTemplate(options: SendTemplateOptions): Promise<MessagingResponse>;
    getStatus?(): ProviderStatus;
}
