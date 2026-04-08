import { z } from 'zod';
import { RepeatInterval } from '@prisma/client';

export const LoginSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6)
});

export const RegisterSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter"),
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short")
});

export const ReminderSchema = z.object({
    title: z.string().min(1).max(100),
    message: z.string().min(1).max(1000),
    schedule: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format"
    }),
    repeat: z.nativeEnum(RepeatInterval).optional().default(RepeatInterval.NONE),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional().default([])
});

export const ActivateLicenseSchema = z.object({
    code: z.string().regex(/^[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}$/, "Invalid license key format")
});

export const UpdateProfileSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    phoneNumber: z.string().nullable().optional()
});

export const OTPSendSchema = z.object({
    phone: z.string().min(10).max(15)
});

export const OTPVerifySchema = z.object({
    phone: z.string().min(10).max(15),
    code: z.string().length(6)
});

export const WebhookPayloadSchema = z.object({
    entry: z.array(z.object({
        id: z.string(),
        changes: z.array(z.object({
            value: z.object({
                messaging_product: z.string(),
                metadata: z.object({
                    display_phone_number: z.string().optional(),
                    phone_number_id: z.string().optional()
                }).optional(),
                statuses: z.array(z.object({
                    id: z.string(),
                    status: z.string(),
                    timestamp: z.string().optional()
                })).optional(),
                messages: z.array(z.object({
                    id: z.string(),
                    from: z.string(),
                    text: z.object({ body: z.string() }).optional(),
                    timestamp: z.string().optional(),
                    type: z.string()
                })).optional()
            }),
            field: z.string()
        }))
    }))
});

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
