export const API_ENDPOINTS = {
    AUTH: {
        BASE: '/auth',
        CHECK_USERNAME: '/auth/check-username',
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ACTIVATE: '/auth/activate',
        UPDATE_PROFILE: '/auth/update-profile',
        UNLINK_GOOGLE: '/auth/unlink/google',
        UNLINK_PHONE: '/auth/unlink/phone',
    },
    USER: {
        BASE: '/users',
        PROFILE: '/users/profile',
    },
    REMINDERS: {
        BASE: '/reminders',
        SYNC: '/reminders/sync',
    },
    CHAT: {
        BASE: '/chat',
        THREADS: '/chat/threads',
        MESSAGES: '/chat/messages',
        OTP_SEND: '/whatsapp/otp/send',
        OTP_VERIFY: '/whatsapp/otp/verify',
        MARK_READ: '/chat/read',
    },
    // Alias used by ChatAPI — maps WhatsApp-specific routes
    WHATSAPP: {
        CHATS: '/chat/threads',
        MESSAGES: '/chat/messages',
        OTP_SEND: '/whatsapp/otp/send',
        OTP_VERIFY: '/whatsapp/otp/verify',
    },
    ADMIN: {
        BASE: '',
        ENGINE_STATUS: '/admin/health/engine',
        PULSE: '/admin/health/pulse',
        PROVIDERS: '/admin/health/providers',
        DASHBOARD: '/admin/health/dashboard',
        TRAFFIC: '/admin/traffic',
        LICENSES: '/admin/licenses',
    },
    FINANCE: {
        BASE: '/finances',
        SUMMARY: '/finances/summary',
        PROFILE: '/finances/profile',
        TRANSACTIONS: '/finances/transactions',
    }
} as const;
