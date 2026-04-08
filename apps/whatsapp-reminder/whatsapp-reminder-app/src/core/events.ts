export enum DomainEvent {
    USER_REGISTERED = 'USER_REGISTERED',
    USER_ACTIVATED = 'USER_ACTIVATED',
    REMINDER_SENT = 'REMINDER_SENT',
    REMINDER_CREATED = 'REMINDER_CREATED',
    REMINDER_UPDATED = 'REMINDER_UPDATED',
    LICENSE_CREATED = 'LICENSE_CREATED',
    MESSAGE_SENT = 'MESSAGE_SENT',
    MESSAGE_FAILED = 'MESSAGE_FAILED',
    CHAT_MESSAGE_RECEIVED = 'CHAT_MESSAGE_RECEIVED',
    SEND_MESSAGE_REQUEST = 'SEND_MESSAGE_REQUEST'
}

export interface EventPayloads {
    [DomainEvent.USER_REGISTERED]: {
        userId: string;
        username: string;
        email?: string | null;
    };
    [DomainEvent.USER_ACTIVATED]: {
        userId: string;
        licenseId: string;
    };
    [DomainEvent.REMINDER_SENT]: {
        reminderId: string;
        userId: string;
        status: 'SENT' | 'FAILED';
    };
    [DomainEvent.REMINDER_CREATED]: {
        reminderId: string;
        userId: string;
    };
    [DomainEvent.REMINDER_UPDATED]: {
        reminderId: string;
        userId: string;
    };
    [DomainEvent.LICENSE_CREATED]: {
        licenseId: string;
        key: string;
    };
    [DomainEvent.MESSAGE_SENT]: {
        messageId: string;
        to: string;
        type: 'otp' | 'notif';
        body: string;
        userId?: string | null;
        timestamp: Date;
    };
    [DomainEvent.MESSAGE_FAILED]: {
        to: string;
        type: 'otp' | 'notif';
        error: string;
        userId?: string | null;
        timestamp: Date;
    };
    [DomainEvent.CHAT_MESSAGE_RECEIVED]: {
        messageId: string;
        from: string;
        body: string;
        userId?: string | null;
        timestamp: Date;
    };
    [DomainEvent.SEND_MESSAGE_REQUEST]: {
        messageId: string;
        to: string;
        type: 'otp' | 'notif';
        body: string;
        userId?: string | null;
        timestamp: Date;
        templateName?: string;
        components?: string[];
    };
}
