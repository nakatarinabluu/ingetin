import { z } from 'zod';
import { RepeatInterval } from '@prisma/client';

/**
 * 🧸 INGETIN - SHARED SCHEMAS (v8.0)
 * Standardized validation for both Frontend and Backend.
 * Language: Indonesian (Friendly).
 */

export const LoginSchema = z.object({
    username: z.string().min(1, "Nama pengguna jangan lupa diisi ya"),
    password: z.string().min(1, "Kata sandinya jangan lupa diisi ya")
});

export const RegisterSchema = z.object({
    username: z.string()
        .min(3, "Nama pengguna minimal 3 huruf ya")
        .max(20, "Nama pengguna kepanjangan, maksimal 20 huruf")
        .regex(/^[a-zA-Z0-9_]+$/, "Nama pengguna cuma boleh huruf, angka, dan underscore (_)"),
    email: z.string().email("Format emailnya sepertinya salah nih"),
    password: z.string()
        .min(8, "Sandi minimal 8 karakter biar aman")
        .regex(/[A-Z]/, "Sandi harus ada minimal satu huruf besar ya")
        .regex(/[0-9]/, "Sandi harus ada minimal satu angka ya")
        .regex(/^\S*$/, "Sandi gak boleh pakai spasi ya"),
    firstName: z.string().min(2, "Nama depan minimal 2 huruf ya"),
    lastName: z.string().min(2, "Nama belakang minimal 2 huruf ya")
});

export const ReminderSchema = z.object({
    title: z.string().min(1, "Judul pengingat jangan kosong ya").max(100),
    message: z.string().min(1, "Isi pesan jangan kosong ya").max(1000),
    schedule: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Format tanggalnya salah nih"
    }),
    repeat: z.nativeEnum(RepeatInterval).optional().default(RepeatInterval.NONE),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional().default([])
});

export const ActivateLicenseSchema = z.object({
    code: z.string().regex(/^[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}$/, "Format kodenya salah, cek lagi yuk")
});

export const UpdateProfileSchema = z.object({
    firstName: z.string().min(2, "Nama depan minimal 2 huruf").optional(),
    lastName: z.string().min(2, "Nama belakang minimal 2 huruf").optional(),
    email: z.string().email("Format email salah").optional(),
    password: z.string().min(8, "Sandi minimal 8 karakter").optional(),
    phoneNumber: z.string().nullable().optional()
});

export const OTPSendSchema = z.object({
    phone: z.string().min(10, "Nomor HP minimal 10 angka").max(15, "Nomor HP maksimal 15 angka")
});

export const OTPVerifySchema = z.object({
    phone: z.string().min(10).max(15),
    code: z.string().length(6, "Kode OTP harus 6 angka ya")
});

export const GenerateLicenseSchema = z.object({
    targetName: z.string().min(1).max(100).optional()
});

export const SendNotificationSchema = z.object({
    phone: z.string().min(10).max(15),
    message: z.string().min(1).max(1000),
    template: z.string().optional(),
    params: z.array(z.string()).optional()
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
