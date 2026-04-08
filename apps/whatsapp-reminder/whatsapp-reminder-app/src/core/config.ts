import { z } from 'zod';
import { createEnv } from '@ingetin/env';

export const env = createEnv({
    PORT: z.string().trim().default('4000'),
    JWT_SECRET: z.string().trim().min(8),
    META_API_URL: z.string().trim().url().default('https://graph.facebook.com/v22.0'),
    GOOGLE_API_URL: z.string().trim().url().default('https://www.googleapis.com'),
    GOOGLE_CLIENT_ID: z.string().trim().min(1),
    GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
    WA_VERIFY_TOKEN: z.string().trim().min(1),
    WA_OTP_PHONE_NUMBER_ID: z.string().trim().min(1),
    WA_OTP_ACCESS_TOKEN: z.string().trim().min(1),
    WA_NOTIF_PHONE_NUMBER_ID: z.string().trim().min(1),
    WA_NOTIF_ACCESS_TOKEN: z.string().trim().min(1),
    WA_APP_SECRET: z.string().trim().min(1), // Required for Webhook Signature Verification
    ENCRYPTION_SECRET: z.string().trim().min(64), // 256-bit key in hex format
    MY_PERSONAL_PHONE: z.string().trim().optional(),
    ALLOWED_ORIGINS: z.string().trim().optional(), // Comma-separated list
    FRONTEND_URL: z.string().trim().min(1),
    GOOGLE_REDIRECT_URI: z.string().trim().min(1),
    DB_RETENTION_DAYS: z.string().trim().default('30').transform(v => parseInt(v.trim(), 10))
});
