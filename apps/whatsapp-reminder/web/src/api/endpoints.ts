export const API_ENDPOINTS = {
    AUTH: {
        BASE: '/api/auth',
        CHECK_USERNAME: '/api/auth/check-username',
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        ACTIVATE: '/api/auth/activate',
        UPDATE_PROFILE: '/api/auth/update-profile',
        UNLINK_GOOGLE: '/api/auth/google/unlink',
        UNLINK_PHONE: '/api/auth/otp/unlink',
    },
    WHATSAPP: {
        BASE: '/api/whatsapp',
        STATS: '/api/whatsapp/stats',
        MESSAGES: '/api/whatsapp/messages',
        CHATS: '/api/whatsapp/chats',
        OTP_SEND: '/api/whatsapp/otp/send',
        OTP_VERIFY: '/api/whatsapp/otp/verify',
    },
    REMINDERS: {
        BASE: '/api/reminders',
        SYNC: '/api/reminders/sync'
    },
    USER: {
        BASE: '/api/users',
        PROFILE: '/api/users/profile',
        LICENSES: '/api/users/licenses',
    },
    ADMIN: {
        BASE: '/api',
        ENGINE_STATUS: '/api/admin/health/engine',
        PULSE: '/api/admin/health/pulse',
        PROVIDERS: '/api/admin/health/providers',
        DASHBOARD: '/api/admin/health/dashboard',
    },
    FINANCE: {
        BASE: '/api/finances',
        SUMMARY: '/api/finances/summary',
        PROFILE: '/api/finances/profile',
        TRANSACTIONS: '/api/finances/transactions',
    }
} as const;
