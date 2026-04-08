import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '@ingetin/logger';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') }); // For apps
dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // Fallback for root or scripts

export const baseSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    REDIS_PASSWORD: z.string().min(1).optional(),
    SENTRY_DSN: z.string().url().optional(),
});

export function createEnv<T extends z.ZodRawShape>(schema: T) {
    const mergedSchema = baseSchema.extend(schema);
    const result = mergedSchema.safeParse(process.env);

    if (!result.success) {
        logger.error({ 
            msg: 'Invalid environment variables', 
            errors: result.error.issues.map((issue: z.ZodIssue) => ({
                path: issue.path.join('.'),
                message: issue.message
            }))
        });
        process.exit(1);
    }

    return result.data;
}

export type BaseEnv = z.infer<typeof baseSchema>;
