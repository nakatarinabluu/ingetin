import { z } from 'zod';

/**
 * 🛡️ INGETIN CORE TYPES (Pure TypeScript)
 * Didefinisikan secara manual untuk menghindari dependensi pada runtime Prisma di Frontend.
 */

export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export enum ReminderStatus {
    PENDING = 'PENDING',
    QUEUED = 'QUEUED',
    SENT = 'SENT',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    PAST = 'PAST'
}

export enum RepeatInterval {
    NONE = 'NONE',
    DAILY = 'DAILY',
    WEEKEND = 'WEEKEND',
    WEEKDAY = 'WEEKDAY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
    CUSTOM = 'CUSTOM'
}

export enum LicenseStatus {
    AVAILABLE = 'AVAILABLE',
    USED = 'USED',
    PAUSED = 'PAUSED',
    REVOKED = 'REVOKED'
}

export enum MessageDirection {
    INBOUND = 'INBOUND',
    OUTBOUND = 'OUTBOUND'
}

export enum UsageType {
    OTP_SENT = 'OTP_SENT',
    NOTIF_SENT = 'NOTIF_SENT',
    INCOMING_MSG = 'INCOMING_MSG',
    REGISTRATION = 'REGISTRATION',
    LICENSE_ACTIVATE = 'LICENSE_ACTIVATE'
}

export enum MessageType {
    OTP = 'OTP',
    NOTIF = 'NOTIF'
}

export enum MessageStatus {
    PENDING = 'PENDING',
    QUEUED = 'QUEUED',
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    READ = 'READ',
    FAILED = 'FAILED'
}

// Re-export as values directly from the source for better static analysis
export { 
    LoginSchema, 
    RegisterSchema, 
    ReminderSchema, 
    ActivateLicenseSchema, 
    UpdateProfileSchema, 
    OTPSendSchema, 
    OTPVerifySchema,
    GenerateLicenseSchema,
    SendNotificationSchema,
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
    GenerateLicenseSchema,
    SendNotificationSchema,
    WebhookPayloadSchema
} from './schemas';

export interface HistoryEntry {
    at: string | Date;
    action: string;
    old?: string;
    new: string;
}

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
    googleRefreshToken?: string | null;
    phoneHistory?: HistoryEntry[];
    emailHistory?: HistoryEntry[];
    license?: {
        status: LicenseStatus;
        key: string;
    } | null;
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
    daysOfWeek: number[]; // Added for proper schedule tracking
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
    durationMonths?: number;
    consumedBy?: string | null;
    user?: {
        id: string;
        username: string | null;
    } | null;
}

export interface AuthResult {
    user: UserDTO;
    token: string;
    refreshToken: string;
}

export interface PaginationDTO {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UsageDetailRecord {
    id: string;
    type: string;
    target: string;
    status: string;
    cost: number;
    createdAt: Date;
}

export interface StatsDTO {
    summary: {
        totalOTP: number;
        totalNotif: number;
        [key: string]: number; // Allow additional type counts
    };
    details: UsageDetailRecord[];
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
    isVerified?: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationDTO;
    stats?: Record<string, number>;
}

export interface ThreadHistoryDTO extends PaginatedResponse<MessageDTO> {
    phone: string;
}

export interface FinanceTransactionDTO {
    id: string;
    title: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    date: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface FinanceSummaryDTO {
    totalIncome: number;
    totalExpense: number;
    remainingBudget: number;
    monthlyBudgetLimit: number;
    balance: number;
    expensePercentage: number;
    status: string;
    dailyStats: { name: string; amount: number }[];
    weeklyStats: { name: string; amount: number }[];
    monthlyStats: { name: string; amount: number }[];
    categories: { name: string; amount: number; color: string }[];
    dailyEstimation?: number;
    subscriptions?: { id: string; name: string; amount: number; dueDate: string }[];
    debts?: { id: string; name: string; amount: number; type: 'DEBT' | 'RECEIVABLE'; dueDate: string }[];
}

// Inferred Types from Schemas
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ReminderInput = z.infer<typeof ReminderSchema>;
export type ActivateLicenseInput = z.infer<typeof ActivateLicenseSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type OTPSendInput = z.infer<typeof OTPSendSchema>;
export type OTPVerifyInput = z.infer<typeof OTPVerifySchema>;
export type GenerateLicenseInput = z.infer<typeof GenerateLicenseSchema>;
export type SendNotificationInput = z.infer<typeof SendNotificationSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalReminders: number;
    systemHealth: number;
    revenue: number;
    activeLicenses: number;
    kpis?: {
        messages?: { total: number };
        users?: { total: number };
        reminders?: { active: number };
    };
}

export interface PulseEntry {
    timestamp: string;
    count: number;
}

export interface AuditEvent {
    id: string;
    type: string;
    title?: string;
    description: string;
    timestamp: string;
    userId?: string;
    metadata?: Record<string, unknown>;
}

export interface ProviderHealth {
    status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
    latency: number;
    lastChecked: string;
}

export type Profile = UserDTO;
export type UserProfile = UserDTO;

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
