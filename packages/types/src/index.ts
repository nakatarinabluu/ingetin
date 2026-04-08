import { z } from 'zod';
import { 
    Role, 
    ReminderStatus, 
    RepeatInterval, 
    LicenseStatus, 
    MessageDirection, 
    UsageType,
    MessageType,
    MessageStatus
} from '@prisma/client';

export { 
    Role, 
    ReminderStatus, 
    RepeatInterval, 
    LicenseStatus, 
    MessageDirection, 
    UsageType,
    MessageType,
    MessageStatus
};

// Re-export as values directly from the source for better static analysis
export { 
    LoginSchema, 
    RegisterSchema, 
    ReminderSchema, 
    ActivateLicenseSchema, 
    UpdateProfileSchema, 
    OTPSendSchema, 
    OTPVerifySchema,
    WebhookPayloadSchema
} from './schemas';

// Necessary for inferred types below
import { 
    LoginSchema, 
    RegisterSchema, 
    ReminderSchema, 
    ActivateLicenseSchema, 
    UpdateProfileSchema, 
    OTPSendSchema, 
    OTPVerifySchema,
    WebhookPayloadSchema
} from './schemas';

export interface UserDTO {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    role: Role;
    isActivated: boolean;
    lastLogin?: Date | null;
    createdAt: Date;
}

export interface MessageDTO {
    id: string;
    whatsappId: string;
    from: string;
    to: string;
    body: string;
    direction: MessageDirection;
    messageType: MessageType;
    status: MessageStatus;
    timestamp: Date;
    userId?: string | null;
    user?: {
        username?: string | null;
        fullName?: string | null;
    } | null;
}

export interface ReminderDTO {
    id: string;
    title: string;
    message: string;
    schedule: Date;
    status: ReminderStatus;
    repeat: RepeatInterval;
    externalId?: string | null;
    userId: string;
    createdAt: Date;
    sentAt?: Date | null;
}

export interface LicenseDTO {
    id: string;
    key: string;
    status: LicenseStatus;
    targetName?: string | null;
    userId?: string | null;
    activatedAt?: Date | null;
    createdAt: Date;
    user?: {
        id: string;
        username: string | null;
    } | null;
}

export interface AuthResult {
    user: UserDTO;
    token: string;
}

export interface PaginationDTO {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface StatsDTO {
    summary: {
        totalOTP: number;
        totalNotif: number;
    };
    details: unknown[];
}

export interface ChatThreadDTO {
    phoneNumber: string;
    body: string;
    direction: MessageDirection;
    timestamp: Date;
    status: string;
    username?: string | null;
    isRegistered: boolean;
    unreadCount: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationDTO;
}

export interface ThreadHistoryDTO extends PaginatedResponse<MessageDTO> {
    phone: string;
}

// Inferred Types from Schemas
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ReminderInput = z.infer<typeof ReminderSchema>;
export type ActivateLicenseInput = z.infer<typeof ActivateLicenseSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type OTPSendInput = z.infer<typeof OTPSendSchema>;
export type OTPVerifyInput = z.infer<typeof OTPVerifySchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

// Standard API Response Structure
export type ApiResponse<T> = {
    success: true;
    data: T;
    requestId?: string;
} | {
    success: false;
    error: string;
    errorCode?: string;
    details?: unknown;
    requestId?: string;
};
