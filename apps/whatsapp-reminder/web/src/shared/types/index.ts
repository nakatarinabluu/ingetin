/**
 * 🎨 WEB-SPECIFIC TYPES
 * Extends core types from @ingetin/types for UI/UX purposes.
 */

import type { UserDTO } from '@ingetin/types';

export * from '@ingetin/types';

export type UserProfileExtended = UserDTO & {
    rank?: string;
};

export interface ChartDataEntry {
    name: string;
    income: number;
    expense: number;
}

export interface CategoryEntry {
    name: string;
    amount: number;
    color: string;
    type?: 'INCOME' | 'EXPENSE';
    count?: number;
}

export interface OperationalHistoryEntry {
    at: string;
    action: string;
    old?: string | Record<string, unknown>;
    new?: string | Record<string, unknown>;
    message?: string;
    type?: 'INBOUND' | 'OUTBOUND' | string;
    timestamp?: string;
}

export interface AppError {
    message: string;
    status?: number;
    errorCode?: string;
    details?: string;
}

// ─── Admin Monitor Specifics ──────────────────────────────────────────────────

export interface PulseEntry {
    message: string;
    body?: string;
    level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN';
    status?: string;
    category?: string;
    timestamp?: string;
    time?: string;
}

export interface AuditEvent {
    id: string;
    title: string;
    message: string;
    schedule: string | Date;
    status: string;
    type: string;
}

export interface ResilienceStats {
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failures?: number;
    successes?: number;
    totalRequests?: number;
}

export interface DashboardStats {
    kpis: {
        users: { total: number };
        signals: { unverified: number; balance: string; latency: number };
        messages: { total: number; reliability: number };
        reminders: { active: number };
        integrations: { calendarSyncs: number };
    };
    system?: {
        protocol?: string;
    };
}

export interface ProviderHealth {
    providers: {
        whatsapp: string;
        google: string;
        database: string;
        redis: string;
    };
    resilience: {
        whatsapp?: ResilienceStats;
        google?: ResilienceStats;
    };
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface DisplayFieldProps {
    label: string;
    value?: string | null;
    className?: string;
}

export interface FilterOptionProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

export interface FilterBtnProps {
    label: string;
    active: boolean;
    onClick: () => void;
    count: number;
}

export interface HistoryModalProps {
    type: 'PHONE' | 'EMAIL';
    data?: OperationalHistoryEntry[];
    onClose: () => void;
}

export interface AuditKPIProps {
    label?: string;
    value?: string | number;
    icon?: React.ReactNode;
    status?: string;
    onClick?: () => void;
    active?: boolean;
    count?: number;
}
